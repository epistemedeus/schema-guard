# schema-guard — bounty delivery report

Bounty: Frantic #84 — runx skill: schema-guard ($9). A published, installable runx skill that checks a proposed JSON Schema against the
current one for breaking changes, validates sample payloads, and emits a gated publish proposal — without
ever writing a live schema.

## Evidence

- **Package**: `epistemedeus/schema-guard@sha-519d004c03f7` — published to the runx registry via `runx login --provider github --for publish; runx registry publish ./skills/schema-guard/SKILL.md --registry https://api.runx.ai`.
- **runx CLI**: `runx-cli 0.6.14` for every publish/install/dogfood/verify step.
- **Public URL**: https://runx.ai/x/epistemedeus/schema-guard@sha-519d004c03f7
- **Source**: https://github.com/epistemedeus/schema-guard/tree/27f6eff6ae3168d1fb43efe586d02afabb3bbcbf
- **PR**: https://github.com/runxhq/runx/pull/238 (head `9c2f23aca50722af760b0e7a5eda1cba1774fc34`) adds `skills/schema-guard/{X.yaml,SKILL.md,run.mjs,fixtures}`; raw [X.yaml](https://raw.githubusercontent.com/epistemedeus/runx/9c2f23aca50722af760b0e7a5eda1cba1774fc34/skills/schema-guard/X.yaml) and [SKILL.md](https://raw.githubusercontent.com/epistemedeus/runx/9c2f23aca50722af760b0e7a5eda1cba1774fc34/skills/schema-guard/SKILL.md) are fetchable from the head commit.
- **Install**: `runx add epistemedeus/schema-guard@sha-519d004c03f7 --registry https://api.runx.ai`
- **Local harness**: passed (3/3, 0 assertion errors, with packet assertions) — cases `additive-change-compatible-yields-proposal` (sealed), `breaking-change-withholds-proposal` (sealed), `refuses-to-apply-schema` (failure); the additive case emits a proposal, the breaking case withholds it, the apply case is the governed stop.
- **Hosted harness**: green — the registry publish gate ran the hosted harness including the refuses-to-apply-schema stop case.
- **Dogfood**: `runx skill epistemedeus/schema-guard@sha-519d004c03f7 --registry https://api.runx.ai --input-json current_schema='...' --input-json proposed_schema='...' --input-json sample_payloads='...' --input-json compatibility_policy='...' --receipt-dir <dir> -j` sealed receipt `runx:receipt:sha256:092aa5a22343fe685440a75dcdcb7c1d50d5253016ccc81ebe5fa3aa82b2da87`; `runx verify --receipt receipt.json --json` → **valid**.
- **Compatibility decision**: the dogfood input yields compatible=false, block=true, proposal withheld; breaking changes: id: type_changed (integer->string); name: field_removed.
- **Gated proposal**: `publish_schema_proposal.performed_by = schema-publisher`, `requires_approval = true`; schema-guard writes no live schema.
- **Verify it yourself**: install, run the dogfood command, then `runx verify --receipt receipt.json --json` with the public key in [verification.json](delivery/verification.json).

## How a new user adopts it

1. `runx add epistemedeus/schema-guard@sha-519d004c03f7 --registry https://api.runx.ai`
2. `runx skill epistemedeus/schema-guard@sha-519d004c03f7 --registry https://api.runx.ai --input-json current_schema='...' --input-json proposed_schema='...' --input-json sample_payloads='...' --input-json compatibility_policy='...' --receipt-dir <dir> -j`
3. `runx verify --receipt receipt.json --json` (public key in verification.json) → valid.

