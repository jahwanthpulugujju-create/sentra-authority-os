# Sentra Controlled-MVP Threat Model

## Scope and method

This threat model covers the current **software-only, one-adapter controlled MVP**. It maps threats to implemented controls, automated checks, and residual limitations. It does not certify that the system is secure against all threats or replace an independent assessment. OWASP identifies excessive functionality, permissions, and autonomy as causes of excessive agency and recommends downstream complete mediation and human approval for high-impact actions.[1]

| Threat | Example in the demo scope | Implemented control | Evidence / automated check | Residual limitation |
| --- | --- | --- | --- | --- |
| Prompt injection | Untrusted vendor note attempts to cause an employee-data export | Deterministic `ESCALATE`; planner text cannot alter the authority kernel; pending review is hash-bound to the original request | Prompt Injection scenario; escalation-binding unit test | No content-sanitization pipeline, real approver UI, or user identity workflow |
| Replay | A spent capability is presented again | Single-use lifecycle and consumed-status refusal before protected execution | Replay Attempt scenario; guided valid-vs-replay contrast | The controlled demo does not model distributed cache or multi-region concurrency |
| Request mutation | Action, state, purpose, or workflow changes after approval | Canonical request hash and exact scope/workflow/idempotency binding | Changed Request scenario; workflow and idempotency mismatch tests | The demo accepts fixed scenario inputs rather than external untrusted API payloads |
| Credential/key theft or misuse | A capability claims a revoked, retired, or unknown key ID | Key registry rejects non-active key IDs before signature/tool processing; UI labels HMAC accurately | Revoked/unknown key unit test | HMAC shared-secret design is not public-key non-repudiation; production secret custody and rotation automation are out of scope |
| Policy outage or unknown policy | Request references unavailable, retired, or unknown policy | Fail-closed policy availability check | Policy outage/retirement/unknown unit test | Policy catalog is local/in-memory; no replicated policy-control plane |
| Confused deputy / direct tool bypass | UI or router tries to call the vendor-approval handler directly | Module-sealed gateway permit accepted only after capability verification | Direct protected-tool invocation unit test | TypeScript module privacy is a demo boundary, not a hardened process-isolation boundary |
| Audit tampering | Stored gateway/execution record is altered after the event | Predecessor hash links, recomputation verifier, and export package with verifier status | Proof hash unit test; `verify-demo.sh` proof-chain assertion | Local database operator could alter records and recompute a new chain; no external timestamping or immutable store |
| Rate/burst anomaly | Agent proposes nine approvals in 20 seconds | Deterministic `FREEZE` condition and visible reason code | Burst Anomaly scenario | No live traffic ingestion, statistical anomaly model, or per-tenant rate service |

## Trust boundaries

| Boundary | Expected authority | Current enforced rule |
| --- | --- | --- |
| Agent/planner → Authority API | Propose only | Proposal becomes a canonical request; it cannot directly change protected state |
| Policy kernel → Capability | Decide bounded scope | Only active policy snapshot can support capability verification |
| Capability → Gateway | Demonstrate exact, fresh authority | Request hash, scope, tenant, workflow, step, budget, nonce, idempotency key, policy, time, signature, and active key are checked |
| Gateway → Protected tool | Execute once | Tool adapter requires a module-sealed, gateway-issued permit |
| Event store → Reviewer | Preserve evidence | Hash-linked verifier detects unexpected change relative to the recorded predecessor chain |

## Security claim boundary

> Sentra demonstrates a narrow runtime-authority pattern. It does not claim protection against a compromised server runtime, database administrator, source-code supply chain, browser host, secret-management system, or network adversary. These require deployment-specific controls and independent review.

## References

[1] [OWASP Gen AI Security Project, *LLM06:2025 Excessive Agency*](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
