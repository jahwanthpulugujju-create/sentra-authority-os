# Sentra Buyer Beachhead Brief

## A narrow initial buyer hypothesis

**Proposed beachhead:** the finance, procurement, or revenue-operations control owner responsible for approving high-impact SaaS actions performed by an AI-enabled workflow. The controlled Sentra demo focuses on a single action: approving a scoped vendor in a procurement workflow. This is a **buyer hypothesis**, not evidence of current customer demand, a pilot, savings, or a validated pricing model.

| Element | Controlled MVP definition | Claim boundary |
| --- | --- | --- |
| Buyer role | Controller, Head of Finance, Procurement Operations owner, or RevOps owner who owns approval controls | The team has not yet interviewed or contracted with any buyer. |
| Agent workflow | An agent proposes approval of a named vendor with a defined purpose, USD limit, workflow ID, step, and one-action budget | The demo does not connect to a bank, payment network, ERP, or live SaaS account. |
| Runtime control gap | Existing access may establish that a service identity can call a tool; Sentra adds a separate check for whether **this action**, in **this context**, can cross the protected boundary once | This is a product thesis, not a claim that every existing control is insufficient. |
| Initial integration | Place Sentra’s gateway in front of one protected action adapter, then record the policy, capability, gateway result, and proof chain | The current implementation has one adapter and is not production-certified. |

## Why this wedge is defensible to investigate

NIST’s AI Agent Standards Initiative describes agents capable of autonomous actions and identifies secure agent operation, authentication/identity infrastructure, and enterprise agent identity and authorization as active areas of work.[1] OWASP’s Excessive Agency guidance describes risks when model outputs can cause damaging actions, including via prompt injection, and recommends minimum permissions, human approval for high-impact actions, and downstream complete mediation rather than relying on the model to decide whether an action is allowed.[2]

> **Sentra’s testable hypothesis:** A control owner may value a narrow, inspectable authority boundary in front of one high-impact agent action when ordinary service access alone does not express the action’s current purpose, limit, workflow step, freshness, and one-time-use condition.

This is deliberately a hypothesis. It should be accepted, revised, or rejected only after structured discovery with real control owners.

## What Sentra shows today

| Evidence | Demonstrated in the controlled MVP | Not demonstrated |
| --- | --- | --- |
| Exact action context | Canonical tenant, agent, tool, resource, action, amount/limit, currency, purpose, workflow step/budget, policy version, nonce, and idempotency key | Production context ingestion, policy authoring workflow, or multiple tenants |
| Runtime enforcement | A gateway verifies an HMAC capability before a named protected-tool adapter can change state | A live third-party SaaS, bank, or payment integration |
| Unsafe-path behavior | Altered request, replay, untrusted instruction, out-of-scope tool, and anomaly paths do not change protected state | A comprehensive real-world threat assessment |
| Review path | High-risk prompt-injection input creates a pending, hash-bound approval artifact with role and expiry fields | A real user approval queue, identity provider, or human approval action |
| Evidence | Local persistent event chain, policy/key history, and downloadable proof package | An independent audit, retention guarantee, or regulatory attestation |

## Discovery protocol: human-owned gate

The team should conduct **three** structured 20–30 minute interviews or documented proxy reviews with real people matching the control-owner or operator role. The following prompts are questions, not implied answers.

| Question | Evidence to capture | Do not claim without evidence |
| --- | --- | --- |
| Which agent-enabled action would you permit first, and which would you block? | Role, workflow, stated condition, and a de-identified note | That buyers want vendor approval specifically |
| What existing control proves who may call the tool? What control binds current purpose or limit? | Current control description and stated gap | That existing tools lack every runtime control |
| Would observe-only, shadow decision, or low-risk enforcement be acceptable first? Why? | Adoption preference and constraints | A committed deployment plan |
| What proof would an auditor, controller, or incident reviewer need? | Required artifact fields and retention expectation | That the local proof chain meets a compliance requirement |

No customer quote, name, logo, pilot, ROI, loss estimate, or conversion claim may be added until the team has contemporaneous, permissioned evidence.

## Business-model hypotheses

The team may test three commercial packaging hypotheses after discovery: a per-protected-action usage model, a per-active-agent model, and an enterprise control-plane license. These are **hypotheses only**; this document contains no pricing, revenue, demand, or market-size assertion.

## Measurable demo outcome

The immediate evidence metric is technical rather than commercial: **six authority scenarios, one protected execution, five blocked or contained paths, and zero protected-state change on the adverse paths**. It demonstrates controlled-MVP behavior, not business ROI.

## References

[1] [NIST, *AI Agent Standards Initiative*](https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative)

[2] [OWASP Gen AI Security Project, *LLM06:2025 Excessive Agency*](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
