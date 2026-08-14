# Sentra Authority OS

> **An autonomous agent can propose an action. Sentra decides whether it is allowed to execute.**

Sentra Authority OS is a software-only runtime authority layer for autonomous agents. It sits between an agent and a protected workspace tool. Each proposed action is converted into a canonical request, evaluated by deterministic policy, bound to a signed capability when allowed, independently verified at the gateway, and recorded in a persistent hash-linked proof chain.

The Round 2 MVP has **no IoT, MQTT, or physical hardware dependency**. It demonstrates the enforcement boundary through a protected vendor-approval workspace action backed by a persistent database.

## What the MVP proves

| Requirement | Sentra behavior |
|---|---|
| Valid action | Returns `ALLOW`, persists the capability, and changes the protected tool state. |
| Unauthorized Tool | Returns `DENY`; no protected tool call is issued. |
| Prompt Injection | Returns `ESCALATE`; untrusted text cannot grant authority and creates a hash-bound pending-review artifact. |
| Changed Request | Returns `DENY`; a changed request invalidates the old approval. |
| Burst Anomaly | Returns `FREEZE`; the agent is contained. |
| Replay Attempt | Returns `DENY`; a consumed capability cannot create another side effect. |

## Architecture

Sentra separates the system into four planes.

| Plane | Responsibility |
|---|---|
| **Control** | Identity, policy snapshots, authority contracts, approvals, and key lifecycle. |
| **Data** | Canonical request intake, context, and deterministic policy input. |
| **Enforcement** | Capability issuance, gateway verification, state management, and protected tool control. |
| **Evidence** | Hash-linked audit records, replay review, local metrics, and proof-package export. |

The request-to-proof flow is:

```text
Agent request
  → Canonical request
  → Deterministic policy decision
  → Signed capability
  → Gateway verification
  → Protected tool execution
  → Hash-linked proof record
```

## Quick start

```bash
pnpm install
pnpm test
pnpm check
pnpm build
pnpm dev
```

Open the local application, select a scenario, and inspect the persisted authority decision and proof chain. The valid action is the only scenario permitted to change the protected vendor-approval state.

## Persistent proof chain

Every authority event stores the canonical request, request hash, policy version, reason code, signed capability when issued, capability hash, pending-review artifact when applicable, gateway result, execution result, local decision latency, previous record hash, and current record hash. The record hash includes the prior record hash, so the timeline is ordered and replayable.

The proof chain is a real database-backed feature of this MVP. It is not a client-side mock. The app stores protected resource state and authority events in the database through the server API. The proof section can download a self-describing local JSON evidence package that includes verifier status, policy history, key lifecycle metadata, local metrics, and chronological events. It is not an external audit artifact.

## Authority evidence additions

| Control | Current implementation |
| --- | --- |
| Canonical envelope | Binds tenant, agent, tool, resource, action, amount/limit, currency, purpose, policy version, workflow ID, step budget, nonce, and idempotency key. |
| Policy availability | Active, retired, unavailable, and unknown policy states fail closed. The dashboard exposes read-only policy history and rule snapshots. |
| Key lifecycle | Capabilities record HMAC key ID/version/rotation metadata. Retired, revoked, and unknown IDs are rejected before a tool call. HMAC is accurately described as shared-secret MAC verification, not a public-key signature. |
| Gateway boundary | The protected vendor-approval adapter accepts only a module-sealed permit issued after gateway verification; a direct adapter call is rejected in tests. |
| Escalation | The prompt-injection scenario writes a pending review artifact bound to the original request hash, workflow, approver role, and expiry. It does not provide a real approval UI. |
| Operations evidence | Local demo telemetry shows average decision latency, denial reasons, expired capabilities, escalation count, and proof-verification status. |

## Testing

```bash
pnpm test
pnpm check
pnpm build
```

The test suite covers stable canonicalization, required policy outcomes, the rule that only `ALLOW` may change protected execution state, direct protected-tool rejection, exact capability-to-request/workflow/idempotency binding, altered signature refusal, expiry refusal, policy fail-closed behavior, revoked-key refusal, hash-bound escalation, changed-request refusal, proof export shape, and hash-linked evidence sensitivity.

### Repeatable judge-demo verification

With the local application running, run the complete real API verification pass:

```bash
./verify-demo.sh
```

The script resets the demo baseline, executes all six scenarios through the server, verifies one allowed state change and five refused paths, then confirms a valid six-record proof chain. This is a reproducible demo check, not an external security certification.

## Deliverables

| Deliverable | Evidence in this repository |
|---|---|
| GitHub repository | Source code, setup instructions, architecture, tests, and demo script. |
| Working MVP | Persistent fullstack application with live scenario controls and database-backed state. |
| Progress update | [`progress-update.md`](./progress-update.md) |
| Live demo | [`demo-script.md`](./demo-script.md) |
| Architecture decisions | [`ARCHITECTURE_DECISIONS.md`](./ARCHITECTURE_DECISIONS.md) |
| Professional readiness review | [`SENTRA_PROFESSIONAL_REVIEW.md`](./SENTRA_PROFESSIONAL_REVIEW.md) |
| Readiness assessment | [`SENTRA_READINESS_ASSESSMENT.md`](./SENTRA_READINESS_ASSESSMENT.md) |
| 100-day team operating plan | [`SENTRA_100_DAY_OPERATING_PLAN.md`](./SENTRA_100_DAY_OPERATING_PLAN.md) |
| Roadmap execution matrix | [`SENTRA_46_PLUS_EXECUTION_AUDIT.md`](./SENTRA_46_PLUS_EXECUTION_AUDIT.md) |
| Threat/control/test matrix | [`SENTRA_THREAT_MODEL.md`](./SENTRA_THREAT_MODEL.md) |
| Buyer beachhead hypothesis | [`SENTRA_BUYER_BEACHHEAD_BRIEF.md`](./SENTRA_BUYER_BEACHHEAD_BRIEF.md) |
| Phased adoption proposal | [`SENTRA_PHASED_ADOPTION_PLAN.md`](./SENTRA_PHASED_ADOPTION_PLAN.md) |
| Judge-machine release runbook | [`SENTRA_RELEASE_RUNBOOK.md`](./SENTRA_RELEASE_RUNBOOK.md) |
| Human-owned validation gates | [`SENTRA_HUMAN_VALIDATION_GATES.md`](./SENTRA_HUMAN_VALIDATION_GATES.md) |
| Final roadmap completion report | [`SENTRA_46_PLUS_COMPLETION_REPORT.md`](./SENTRA_46_PLUS_COMPLETION_REPORT.md) |

## Scope and limitations

This is a controlled hackathon MVP. It demonstrates deterministic authority enforcement, persistent proof records, and testable attack scenarios. It is not a production security certification, external penetration test, public-key non-repudiation system, live payment/ERP/bank integration, or replacement for established identity, authentication, payment, or authorization infrastructure. Buyer and business-model statements are hypotheses until validated through real, documented discovery.

## Team

**Brand New Day**  
Project: **Sentra Authority OS**
