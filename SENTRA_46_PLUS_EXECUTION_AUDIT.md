# Sentra 46+ Roadmap Execution Audit

## Purpose and scope

This audit turns the attached readiness roadmap into an execution ledger for the current **software-only controlled MVP**. It does not claim that a roadmap item proves a judging score, validates a market claim, or makes the system production-certified. Each item below is classified from the current code and evidence as of this review.

| Status | Meaning |
| --- | --- |
| **Verified** | Present in the current codebase and covered by repeatable evidence. |
| **Code-ready gap** | Can be implemented and tested in this controlled MVP. |
| **Human gate** | Requires real people, external evidence, or final-environment validation; it must not be fabricated. |

## Authority boundary and evidence controls

| Roadmap requirement | Status | Current evidence or precise gap |
| --- | --- | --- |
| One protected action changes only after an allow decision and gateway verification | **Verified, to strengthen** | The transaction in `authority.runScenario` consumes a valid capability and updates `protected_resources` atomically. The adapter is still embedded in the router rather than represented as a named protected-tool adapter with a direct-bypass test. |
| Canonical request binding | **Verified, to expand** | `agentId`, tool, resource, action, desired state, context, nonce, and policy version are canonicalized and hashed. Tenant, purpose, amount/limit, currency, workflow, step, and budget are not yet explicit. |
| Fail-closed verification | **Verified, to expand** | Invalid signature, expiry, hash, scope, nonce, and policy-version mismatch refuse execution. Explicit unavailable-policy and unknown/retired-key paths need implementation and fault tests. |
| Capability lifecycle | **Verified, to expand** | `ISSUED`, `CONSUMED`, `EXPIRED`, and `REJECTED` states exist and consumption/execution are transactional. Expiry persistence and richer lifecycle evidence need implementation. |
| Policy version and policy history | **Code-ready gap** | Version is bound as `sentra-policy-v1`; a visible policy snapshot/history and reason-code view are absent. |
| Key lifecycle | **Code-ready gap** | The MVP uses HMAC-SHA256 accurately, but the capability has no `keyId`, rotation metadata, or invalid-key demonstration. No public-key or non-repudiation claim is appropriate. |
| Proof chain and export | **Verified, to expand** | Hash-chain verification is server-side and exposed to the dashboard. A proof-package export and a visible tamper-result workflow need implementation. |

## Workflow, operations, and clarity controls

| Roadmap requirement | Status | Current evidence or precise gap |
| --- | --- | --- |
| Request mutation and replay resistance | **Verified** | Changed-request and replay scenarios are persisted and blocked; the guided workflow now contrasts one valid execution against replay refusal. |
| Workflow ID, step binding, and step budget | **Code-ready gap** | The authority envelope does not yet bind a capability to a parent workflow, named step, and maximum execution budget. |
| Human escalation binding | **Code-ready gap** | Prompt injection produces `ESCALATE`, but there is no persisted approval request with approver role, expiry, and original request-hash binding. |
| Explainable burst/rate control | **Verified, to expand** | A deterministic burst threshold returns `FREEZE`; its threshold should be visible as policy evidence. |
| Operations metrics | **Code-ready gap** | Basic event, block, and resource counts exist. Latency, denial-reason, expiry, key-rejection, and escalation metrics are absent. |
| Judge narrative and recovery controls | **Verified** | Guided workflow, reset, retry, offline cache, diagnostics, fresh-data status, proof integrity, and repeatable verifier exist. The narrative and release runbook require final consolidation. |

## Impact, adoption, and external-evidence controls

| Roadmap requirement | Status | Human gate and anti-fabrication rule |
| --- | --- | --- |
| Buyer beachhead | **Code-ready artifact + human validation** | A finance/procurement agent-action wedge and phased adoption brief can be documented. Real buyer problem validation requires cited sources and real interview/proxy-review records. |
| Customer discovery | **Human gate** | The team must conduct and document real interviews. No quotes, names, pilots, logos, or savings may be invented. |
| Business model | **Code-ready hypothesis** | Pricing options may be framed as hypotheses, never as validated revenue or customer demand. |
| Market pain and adoption evidence | **Human gate** | Public sources may support broad assertions; claims about a buyer’s own pain or savings require real evidence. |
| Backup video and final-device rehearsal | **Human gate** | A team member must record and test these artifacts on the actual judging device and network. |

## Execution order

1. Move the protected tool behind a named gateway/adapter interface and expand the canonical envelope.
2. Add policy snapshots/history, a named HMAC key lifecycle, workflow/step binding, escalation artifacts, and proof export.
3. Surface only evidence that the current controlled MVP genuinely has: policy, key, capability, workflow, decision, gateway, execution, and proof fields.
4. Add tests for every new fail-closed reason, exactly-once execution, lifecycle transition, workflow mismatch, approval mismatch, and exported proof verification.
5. Build buyer/adoption/threat/release documents with explicit placeholders for human research and final-machine evidence.

## Claim boundary

> Sentra remains a controlled authority MVP. It demonstrates deterministic policy, context-bound HMAC capabilities, gateway-owned protected execution, and persistent proof. It does **not** claim a production security certification, live financial-network integration, public-key non-repudiation, validated buyers, customer traction, or independently audited security.

## Exhaustive roadmap requirement matrix

The following matrix enumerates every distinct request in the roadmap. A **planned** item is not a completed control until its user-visible evidence and automated check have been added.

| Section | Requirement | Classification | Evidence or next action |
| --- | --- | --- | --- |
| P0.1 | Named protected-tool adapter; no direct UI/API bypass | **Implemented in this execution** | `server/protectedTool.ts` creates a module-sealed gateway permit; a unit test rejects direct adapter use. |
| P0.1 | Proposed action → policy → capability → gateway → tool visual | **Verified, retain** | Existing guided/evidence flow; refine labels during the clarity pass. |
| P0.2 | Persist full envelope: tenant, agent, action, resource, amount/limit, currency, purpose, policy, request hash, dates, idempotency | **Implemented in this execution, UI evidence pending** | Envelope and signed capability now contain all required fields; expose them consistently in the evidence screen. |
| P0.2 | A changed bound field yields hash/scope refusal | **Implemented in this execution** | Existing changed-request test plus workflow/idempotency mismatch tests. |
| P0.3 | Unknown/missing/unavailable policy, missing capability, invalid signature, expiry, duplicate capability fail closed | **Code-ready gap** | Existing invalid-signature, expiry, and replay controls; add explicit policy registry and missing-capability fault tests. |
| P0.3 | Gateway says exactly why execution was blocked | **Code-ready gap** | Technical results exist; add plain-language reason mapping and a visible gateway state. |
| P0.3 | Failure injection proves zero protected side effect | **Code-ready gap** | Add missing-capability, unavailable-policy, invalid-key, and direct-tool failure tests. |
| P0.4 | `ISSUED`, `CONSUMED`, `EXPIRED`, `REJECTED` lifecycle and atomic consume-and-execute | **Verified, to strengthen** | Lifecycle/status table and transaction exist; add explicit expiry transition and metric. |
| P0.4 | Repeated/concurrent attempt gives at most one execution | **Code-ready gap** | Idempotency lookup exists; add deterministic repeated/concurrent integration coverage. |
| P0.5 | Versioned policy snapshot/identifier in every decision and capability | **Code-ready gap** | Fixed version is currently bound; add a policy catalog/snapshot record and event evidence. |
| P0.5 | Small policy-history panel; post-issuance policy does not silently change capability context | **Code-ready gap** | Add read-only history and immutable issuance snapshot display. |
| P0.6 | `keyId`, key version, rotation metadata | **Code-ready gap** | Add a demo HMAC key registry and accurately retain shared-secret MAC terminology. |
| P0.6 | Revoked/wrong-key rejection record | **Code-ready gap** | Add deterministic invalid-key scenario/test with zero execution. |
| P0.7 | Hash-linked proof chain | **Verified** | `verifyProofChain` recomputes predecessor links and record hashes. |
| P0.7 | Export/download, visible verify action, deliberate tamper failure | **Code-ready gap** | Add proof-package export and standalone tamper-verification test; surface proof verdict. |
| P1 | Defined finance/procurement beachhead and buyer role | **Code-ready artifact** | Write brief for a control owner and a scoped vendor-approval workflow; label demand assumptions. |
| P1 | One scoped agent workflow in envelope and gateway | **Implemented in this execution** | `workflowId`, named step, and `stepBudget: 1` are capability-bound. |
| P1 | Publicly cited pain/problem evidence | **Research and documentation task** | Collect and cite authoritative public sources; avoid customer-specific inference. |
| P1 | Three interviews or documented proxy reviews | **Human gate** | Team conducts them; no invented responses, quotations, pilots, or logos. |
| P1 | Observe → shadow → low-risk enforce → expand plan | **Code-ready artifact** | Create phased adoption plan that states unavailable capabilities plainly. |
| P1 | Business model | **Code-ready hypothesis** | Frame per-action, per-agent, and control-plane options as hypotheses only. |
| P1 | Six-scenario demo metric | **Verified, retain** | Verifier confirms one protected execution, five blocked paths, and a valid proof chain. |
| P2 | Policy DSL/JSON: subject, action, resource, constraints, decision, reason | **Code-ready gap** | Create policy catalog/constants and serve the active snapshot. |
| P2 | Deterministic final decision; no LLM authority | **Verified** | Current decision kernel has no LLM allow path; retain ADR and test evidence. |
| P2 | Parent workflow ID and one named step/budget | **Implemented in this execution** | Envelope/capability binding and mismatch test exist. |
| P2 | Escalation includes approver, expiry, original-request hash | **Code-ready gap** | Persist pending approval and test that modified scope stays denied. |
| P2 | Explainable burst threshold | **Code-ready gap** | Existing burst scenario; expose its policy threshold/condition. |
| P2 | Latency, denial reasons, expiry count, proof status | **Code-ready gap** | Extend metrics helper/API/UI; label figures local/demo. |
| P2 | Threat/control/test/residual matrix | **Code-ready artifact** | Create `SENTRA_THREAT_MODEL.md`. |
| P3 | One-line 30-second narrative | **Verified, retain** | Existing story can be aligned with the roadmap wording. |
| P3 | Required 2:45 judge-demo ordering | **Code-ready gap** | Align guided script to the stated order; manual scenarios remain available. |
| P3 | One principal action, manual scenarios, progressive proof | **Verified, retain** | Guided controls and expandable records already exist. |
| P3 | Plain-language reason beside technical code | **Code-ready gap** | Add a reason-code dictionary and show both representations. |
| P3 | Light mode, keyboard access, reduced motion, online/offline clarity | **Verified** | Existing light UI, accessibility, offline, and motion work. |
| P3 | Source-of-truth label, policy version, timestamp, proof result | **Code-ready gap** | Add consistent local/live source and policy labels. |
| P4 | Tests, type check, and production build pass | **Validation gate** | Re-run after all code changes. |
| P4 | Verifier plus manual valid/replay/changed run | **Validation + human gate** | Run verifier; team performs final device rehearsal. |
| P4 | Direct protected-tool rejection | **Implemented in this execution, final validation pending** | Unit test exists; include final result in release report. |
| P4 | Reset, refresh, cache, retry, reconnect recovery | **Verified, final validation pending** | Existing recovery features/tests; repeat smoke test after additions. |
| P4 | 90-second backup and offline architecture screenshot | **Human gate** | Team must record/capture these artifacts. |
| P4 | README command path, known seed, commit/tag, one-page runbook | **Code-ready artifact** | Update runbook/README and create a final checkpoint; tag is a team Git decision. |
| Final package | Cited beachhead brief | **Code-ready artifact + research dependency** | Create after reviewing sources, with clear references. |
| Final package | Architecture one-pager | **Verified, to cross-check** | Existing architecture/ADRs need alignment with new controls. |
| Final package | Threat/control/test matrix | **Code-ready artifact** | Produce threat-model document. |
| Final package | Three-minute script and 90-second backup | **Script verified; backup human gate** | Refine script; team records backup. |
| Final package | README, `.env.example`, ADRs, test/verifier commands, release commit | **Code-ready artifact** | Update repository release packet and checkpoint. |
| Final package | Judge evidence screen: reason, lifecycle, protected result, proof | **Code-ready gap** | Enrich the dashboard with policy/key/workflow/approval/metric/export evidence. |
| Final package | Controlled-MVP limitations statement | **Verified, retain** | Consolidate current limitations in final report. |

## Audit conclusion

The audit remains current only if later phases update this matrix with the corresponding file and test evidence. Every item marked **Human gate** remains intentionally unclaimed until the team performs and records that work.
