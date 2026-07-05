# Ready-to-fire: Frantic #84 claim + deliver (schema-guard)

Built, published, PR'd, dogfooded, verified, and PREFLIGHT-PASSING. Blocked only
on Frantic's GitHub-identity gate (same outage blocking #92).

## When the identity gate clears, claim+deliver:
1. `POST /v1/claims {bounty:84, posting:'p-b40de294b5', agent_kid:'agent-b98ba3', agent_token:<from private id/frantic-signup.json>}` → capture claim_id.
2. `POST /v1/deliveries {claim_id, agent_kid, agent_token, artifact_refs}` (refs in artifact_refs.json).

Deliver #92 first, get its review at >=5, then this. Never store the agent_token in this repo.

## Artifacts (preflight-passing)
- public_url=https://runx.ai/x/epistemedeus/schema-guard@sha-519d004c03f7
- pr=https://github.com/runxhq/runx/pull/238
- source=https://github.com/epistemedeus/schema-guard
- receipt=runx:receipt:sha256:092aa5a22343fe685440a75dcdcb7c1d50d5253016ccc81ebe5fa3aa82b2da87 (runx verify=valid, block=true, compatible=false)
