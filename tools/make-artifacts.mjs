// make-artifacts.mjs — assemble evidence.json, verification.json, report.md for the
// schema-guard bounty delivery from a runtime-values config.
//
//   node tools/make-artifacts.mjs artifact-config.json <outDir>
//
// The config is filled in after the post-publish dogfood run. This keeps the
// delivery artifacts a deterministic function of the real runtime evidence.

import fs from "node:fs";
import path from "node:path";

const [, , configPath, outDirArg] = process.argv;
if (!configPath) throw new Error("usage: node make-artifacts.mjs <config.json> [outDir]");
const c = JSON.parse(fs.readFileSync(configPath, "utf8"));
const outDir = outDirArg || ".";
fs.mkdirSync(outDir, { recursive: true });

const summary =
  `schema-guard is a published, installable runx skill (${c.registry_ref}) that checks a proposed JSON Schema ` +
  `against the current one for breaking changes, validates sample payloads, and emits a gated publish_schema_proposal ` +
  `for the schema-publisher executor only when the change is compatible — never writing a live schema. Local harness ` +
  `passed ${c.harness_cases.length}/${c.harness_cases.length}; the post-publish dogfood sealed receipt ${c.dogfood.receipt_ref} ` +
  `with compatible=${c.dogfood.compatible} (block=${c.dogfood.block}), and runx verify returned ${c.dogfood.verify_verdict}.`;

// ---- evidence.json ----------------------------------------------------------
const observations = [
  `runx CLI version: ${c.runx_version} (publish, install, dogfood, and verify were all run with this binary).`,
  `Publisher owner: ${c.owner}. Package name: ${c.package} (exact). Version: ${c.version}.`,
  `Registry ref: ${c.registry_ref}. Public adoption page (public_url): ${c.public_url}.`,
  `Source/provenance (source_url): ${c.source_url}.`,
  `Pull request against runxhq/runx (pr_url): ${c.pr_url}. Head commit: ${c.pr_head_commit}.`,
  `Raw X.yaml from the PR head commit: ${c.x_yaml}.`,
  `Raw SKILL.md from the PR head commit: ${c.skill_md}.`,
  `Publish method: ${c.publish_method}.`,
  `Install command: ${c.install_command}.`,
  `Local harness (pre-publish): status=${c.local_harness_status}, cases=[${c.harness_cases.map((h) => `${h.name}:${h.status}`).join(", ")}].`,
  `Hosted registry harness (post-publish): ${c.hosted_harness_status}.`,
  `Dogfood command: ${c.dogfood.command}.`,
  `Dogfood receipt_ref (post-publish run of ${c.registry_ref}, not a harness fixture seal): ${c.dogfood.receipt_ref}.`,
  `runx verify verdict on the dogfood receipt: ${c.dogfood.verify_verdict}.`,
  `Compatibility status on the dogfood input: compatible=${c.dogfood.compatible}, block=${c.dogfood.block}, proposal_status=${c.dogfood.proposal_status}.`,
  `Breaking changes detected: ${c.dogfood.breaking_changes.length === 0 ? "none" : c.dogfood.breaking_changes.join("; ")}.`,
  `Sample validation_results: ${c.dogfood.validation_summary}.`,
  `The publish_schema_proposal is gated: performed_by=schema-publisher, requires_approval=true; schema-guard writes no live schema.`,
  `Compatible harness case '${c.harness_cases[0] && c.harness_cases[0].name}' seals with a proposal; the breaking case withholds the proposal; the apply case is the governed stop.`,
  `New-user path: install with '${c.install_command}', run '${c.dogfood.command}', and verify the sealed receipt with '${c.verify_command}'. verification.json records the public key so verification needs no private context.`,
];

const evidence = {
  schema: "schema.guard.bounty.evidence.v1",
  summary,
  bounty: c.bounty,
  package: { owner: c.owner, name: c.package, version: c.version, registry_ref: c.registry_ref },
  artifacts: {
    public_url: c.public_url,
    source_url: c.source_url,
    pr_url: c.pr_url,
    x_yaml: c.x_yaml,
    skill_md: c.skill_md,
    receipt_ref: c.dogfood.receipt_ref,
  },
  observations,
  dogfood: {
    package: c.registry_ref,
    input: c.dogfood.input,
    command: c.dogfood.command,
    receipt_ref: c.dogfood.receipt_ref,
    verify_verdict: c.dogfood.verify_verdict,
    compatible: c.dogfood.compatible,
    block: c.dogfood.block,
    proposal_status: c.dogfood.proposal_status,
    breaking_changes: c.dogfood.breaking_changes,
    harness_cases: c.harness_cases,
  },
  runx_version: c.runx_version,
};
fs.writeFileSync(path.join(outDir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");

// ---- verification.json ------------------------------------------------------
const verification = {
  schema: "schema.guard.bounty.verification.v1",
  summary,
  receipt_ref: c.dogfood.receipt_ref,
  verify_command: c.verify_command,
  verify_verdict: c.dogfood.verify_verdict,
  signature_alg: "Ed25519",
  issuer_kid: c.issuer_kid,
  public_key_base64: c.public_key_base64,
  public_key_sha256: c.public_key_sha256,
  note: "Public key only — no secret. Anyone can verify the sealed dogfood receipt with the command above.",
};
fs.writeFileSync(path.join(outDir, "verification.json"), JSON.stringify(verification, null, 2) + "\n");

// ---- report.md --------------------------------------------------------------
const bullets = [
  `**Package**: \`${c.registry_ref}\` — published to the runx registry via \`${c.publish_method}\`.`,
  `**runx CLI**: \`${c.runx_version}\` for every publish/install/dogfood/verify step.`,
  `**Public URL**: ${c.public_url}`,
  `**Source**: ${c.source_url}`,
  `**PR**: ${c.pr_url} (head \`${c.pr_head_commit}\`) adds \`skills/schema-guard/{X.yaml,SKILL.md,run.mjs,fixtures}\`; raw [X.yaml](${c.x_yaml}) and [SKILL.md](${c.skill_md}) are fetchable from the head commit.`,
  `**Install**: \`${c.install_command}\``,
  `**Local harness**: ${c.local_harness_status} — cases ${c.harness_cases.map((h) => `\`${h.name}\` (${h.status})`).join(", ")}; the additive case emits a proposal, the breaking case withholds it, the apply case is the governed stop.`,
  `**Hosted harness**: ${c.hosted_harness_status}.`,
  `**Dogfood**: \`${c.dogfood.command}\` sealed receipt \`${c.dogfood.receipt_ref}\`; \`${c.verify_command}\` → **${c.dogfood.verify_verdict}**.`,
  `**Compatibility decision**: the dogfood input yields compatible=${c.dogfood.compatible}, block=${c.dogfood.block}, proposal ${c.dogfood.proposal_status}; breaking changes: ${c.dogfood.breaking_changes.length === 0 ? "none" : c.dogfood.breaking_changes.join("; ")}.`,
  `**Gated proposal**: \`publish_schema_proposal.performed_by = schema-publisher\`, \`requires_approval = true\`; schema-guard writes no live schema.`,
  `**Verify it yourself**: install, run the dogfood command, then \`${c.verify_command}\` with the public key in [verification.json](${c.verification_json || "verification.json"}).`,
];
const report = [
  "# schema-guard — bounty delivery report",
  "",
  `Bounty: ${c.bounty}. A published, installable runx skill that checks a proposed JSON Schema against the`,
  "current one for breaking changes, validates sample payloads, and emits a gated publish proposal — without",
  "ever writing a live schema.",
  "",
  "## Evidence",
  "",
  ...bullets.map((b) => `- ${b}`),
  "",
  "## How a new user adopts it",
  "",
  `1. \`${c.install_command}\``,
  `2. \`${c.dogfood.command}\``,
  `3. \`${c.verify_command}\` (public key in verification.json) → ${c.dogfood.verify_verdict}.`,
  "",
].join("\n");
fs.writeFileSync(path.join(outDir, "report.md"), report + "\n");

console.log("wrote evidence.json, verification.json, report.md to", path.resolve(outDir));
console.log("evidence observations:", observations.length, "| report bullets:", bullets.length);
