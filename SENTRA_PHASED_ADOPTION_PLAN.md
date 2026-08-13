# Sentra Phased Adoption Plan

## Purpose

This is a **proposed adoption sequence**, not a customer deployment record. It follows the principle of starting with one narrow protected action and retaining a clear rollback/review boundary. OWASP advises minimizing extensions and permissions, using human approval for high-impact actions, and enforcing authorization downstream rather than relying on the model itself.[1]

| Phase | Objective | Scope and evidence | Exit question | Current status |
| --- | --- | --- | --- | --- |
| 0. Observe | Understand proposed actions without blocking them | Capture normalized proposed action, tool, resource, purpose, amount/limit, actor, and policy candidate; do not issue authority | Is the request shape complete enough to evaluate? | **Not implemented** |
| 1. Shadow decision | Compare deterministic Sentra decisions with the existing workflow | Generate a no-side-effect ALLOW/DENY/ESCALATE/FREEZE outcome and review mismatches | Are policy reasons understandable to the control owner? | **Partially represented by the deterministic local demo** |
| 2. Enforce one low-risk action | Put the gateway before one reversible or bounded tool action | Issue a one-time capability, verify it at the adapter, record lifecycle and proof | Can an altered or replayed action be shown to cause zero effect? | **Implemented in the controlled demo for one vendor-approval state transition** |
| 3. Add a review queue | Apply human review to scoped high-risk cases | Persist a hash-bound request, required approver role, expiry, and approval outcome | Does approving the original scope remain ineffective for a changed request? | **Evidence artifact implemented; real approval UI/identity is not implemented** |
| 4. Expand only after review | Add distinct actions one by one | Separate policy, adapter, key, and test evidence per action | Is each new action bounded, testable, and recoverable? | **Not implemented** |

## Integration guardrails

Each phase retains the same boundaries: the planner proposes, deterministic policy decides, the gateway verifies, and the protected adapter executes only after verification. A new action should not inherit authority from a prior action, workflow step, or capability. NIST’s current agent initiative identifies secure operation and agent identity/authorization as relevant enterprise concerns; that context supports investigation, not any claim of conformity or endorsement.[2]

## Required human checkpoints

Before moving beyond the local demo, a named control owner should validate the proposed action scope, required review condition, reason-code language, retention expectation, and rollback plan. Production rollout additionally requires integration-specific security review, privacy review, identity design, failure-mode testing, and written approval. None of those gates are satisfied by the current MVP.

## References

[1] [OWASP Gen AI Security Project, *LLM06:2025 Excessive Agency*](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)

[2] [NIST, *AI Agent Standards Initiative*](https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative)
