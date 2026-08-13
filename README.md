# Sentra Authority OS

> **An autonomous agent can propose an action. Sentra decides whether it is allowed to execute.**

Sentra Authority OS is a software-only runtime authority layer for autonomous agents. It sits between an agent and a protected workspace tool. Each proposed action is converted into a canonical request, evaluated by deterministic policy, bound to a signed capability when allowed, independently verified at the gateway, and recorded in a persistent hash-linked proof chain.

The Round 2 MVP has **no IoT, MQTT, or physical hardware dependency**. It demonstrates the enforcement boundary through a protected vendor-approval workspace action backed by a persistent database.

## What the MVP proves

| Requirement | Sentra behavior |
|---|---|
| Valid action | Returns `ALLOW`, persists the capability, and changes the protected tool state. |
| Unauthorized Tool | Returns `DENY`; no protected tool call is issued. |
| Prompt Injection | Returns `ESCALATE`; untrusted text cannot grant authority. |
| Changed Request | Returns `DENY`; a changed request invalidates the old approval. |
| Burst Anomaly | Returns `FREEZE`; the agent is contained. |
| Replay Attempt | Returns `DENY`; a consumed nonce cannot create another side effect. |

## Architecture

Sentra separates the system into four planes.

| Plane | Responsibility |
|---|---|
| **Control** | Identity, authority contracts, policies, approvals, and revocation. |
| **Data** | Canonical request intake, context, and deterministic policy input. |
| **Enforcement** | Capability issuance, gateway verification, state management, and protected tool control. |
| **Evidence** | Hash-linked audit records, replay review, incidents, and proof export. |

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
pnpm dev
```

Open the local application, select a scenario, and inspect the persisted authority decision and proof chain. The valid action is the only scenario permitted to change the protected vendor-approval state.

## Persistent proof chain

Every authority event stores the canonical request, request hash, policy outcome, signed capability when issued, capability hash, gateway result, execution result, previous record hash, and current record hash. The record hash includes the prior record hash, so the timeline is ordered and replayable.

The proof chain is a real database-backed feature of this MVP. It is not a client-side mock. The app stores protected resource state and authority events in the database through the server API.

## Testing

```bash
pnpm test
pnpm check
pnpm build
```

The test suite covers stable canonicalization, required policy outcomes, the rule that only `ALLOW` may change protected execution state, exact capability-to-request hash binding, altered signature refusal, expiry refusal, changed-request refusal, and hash-linked evidence sensitivity.

### Repeatable judge-demo verification

With the local application running, run the complete real API verification pass:

```bash
./verify-demo.sh
```

The script resets the demo baseline, executes all six scenarios through the server, verifies one allowed state change and five refused paths, then confirms a valid six-record proof chain. This is a reproducible demo check, not an external security certification.

## Round 2 deliverables

| Deliverable | Evidence in this repository |
|---|---|
| GitHub repository | Source code, setup instructions, architecture, tests, and demo script. |
| Working MVP | Persistent fullstack application with live scenario controls and database-backed state. |
| Progress update | [`progress-update.md`](./progress-update.md) |
| Live demo | [`demo-script.md`](./demo-script.md) |
| Professional readiness review | [`SENTRA_PROFESSIONAL_REVIEW.md`](./SENTRA_PROFESSIONAL_REVIEW.md) |
| 100-day team operating plan | [`SENTRA_100_DAY_OPERATING_PLAN.md`](./SENTRA_100_DAY_OPERATING_PLAN.md) |

## Scope and limitations

This is a controlled hackathon MVP. It demonstrates deterministic authority enforcement, persistent proof records, and testable attack scenarios. It is not a production security certification, external penetration test, or replacement for established identity, authentication, payment, or authorization infrastructure.

## Team

**Brand New Day**  
Project: **Sentra Authority OS**
