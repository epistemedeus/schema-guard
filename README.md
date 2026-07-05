# schema-guard

A [runx](https://runx.ai) skill that checks a proposed JSON Schema against the
current one for **breaking changes**, validates sample payloads, and emits a
**gated publish proposal only when the change is compatible** — without ever
writing a live schema.

- **Read-only and offline.** No network, no schema writes, no code execution.
- **Grounded in the diff.** Breaking changes are reported by field path with the
  old contract, new contract, and the policy rule they trip.
- **Gated proposal.** A `publish_schema_proposal` is emitted only when compatible;
  it is performed by the downstream `schema-publisher` executor, never here.
- **Policy-aware.** `required_fields` must remain; `breaking_allowed` and
  `versioning_rule` govern whether other breaking changes pass.

## Layout

```
skills/schema-guard/
  SKILL.md      # skill card and full documentation
  X.yaml        # execution profile, policy, and typed inputs/outputs
  run.mjs       # dependency-free Node analyzer
  fixtures/
    additive-change-compatible-yields-proposal.yaml   # compatible -> proposal, block: false
    breaking-change-withholds-proposal.yaml            # breaking   -> no proposal, block: true
    refuses-to-apply-schema.yaml                        # apply=true -> governed stop (failure)
```

## Install and run

```bash
runx add epistemedeus/schema-guard@0.1.0
runx skill epistemedeus/schema-guard@0.1.0 \
  --input-json current_schema='{...}' --input-json proposed_schema='{...}' --json
```

## Local harness

```bash
runx harness ./skills/schema-guard
```

Three cases: `additive-change-compatible-yields-proposal` (seals, proposal),
`breaking-change-withholds-proposal` (seals, no proposal), and
`refuses-to-apply-schema` (the governed stop case).

The authoritative harness cases are declared inline in `X.yaml` under
`harness.cases` (what `runx harness <skill-dir>` runs); the files in `fixtures/`
mirror those same cases. Keep them in sync when editing.

## License

MIT — see [LICENSE](LICENSE).
