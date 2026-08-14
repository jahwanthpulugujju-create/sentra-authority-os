# Product Scope — Sentra Authority OS

## 1. Product definition

Sentra Authority OS is a software-only runtime authority layer for autonomous agents. It is designed for teams that want a clear technical boundary between an agent’s proposed action and a consequential software action. Its role is not to make an agent more capable; its role is to decide and prove whether a narrowly defined action may execute.

## 2. User and job to be done

| Intended user | Job to be done | Sentra contribution |
|---|---|---|
| Automation or platform engineer | Connect an agent to a protected tool without granting unrestricted execution. | Bind policy, scope, identity context, expiry, and single-use enforcement to each action. |
| Security or risk reviewer | Inspect why an action ran or why it was blocked. | Present the canonical request, decision, gateway result, and hash-linked evidence. |
| Operations owner | Contain unsafe, changed, or anomalous agent behavior. | Return explicit `DENY`, `ESCALATE`, or `FREEZE` outcomes before a protected side effect. |

## 3. Included in the Round 3 MVP

The submitted MVP includes a single protected workspace action: **scoped Contoso vendor approval**. It provides the following implemented capabilities:

| Capability | Scope of implementation |
|---|---|
| Canonicalization | A stable request envelope captures agent, tenant, target tool, resource, action, purpose, workflow, limits, nonce, and idempotency context. |
| Deterministic policy | Six judge-visible scenarios return `ALLOW`, `DENY`, `ESCALATE`, or `FREEZE`. |
| Capability control | Allowed requests receive a scoped, short-lived HMAC-SHA256 capability tied to the request hash and relevant workflow context. |
| Gateway enforcement | The protected adapter executes only after a gateway verifies the exact bound capability. |
| Replay resistance | A consumed capability cannot produce a second protected side effect. |
| Evidence | Decision records and protected-state results are stored as a hash-linked proof chain and can be exported. |
| Judge experience | Guided walkthrough, single-scenario controls, reset, proof download, copy/email sharing, and clarity-focused light-mode interface. |

## 4. Out of scope

The following are deliberately excluded from the submitted MVP:

| Exclusion | Reason for exclusion |
|---|---|
| IoT, MQTT, sensors, or physical hardware | Sentra’s chosen Round 3 scope is software-only agent authority. Legacy database fields do not form part of the submission claim. |
| Live financial, ERP, HR, healthcare, or payment execution | The prototype demonstrates a protected software workspace action only. |
| Production identity governance | There is no enterprise SSO, just-in-time provisioner, or full role-administration system in the submitted MVP. |
| Public-key non-repudiation | The MVP uses HMAC-SHA256 shared-secret MAC verification and states this explicitly. |
| Human approval workflow UI | Escalation creates a hash-bound review artifact, not a fully operational approval console. |
| Security certification | No independent penetration test, SOC 2 assessment, or formal certification is claimed. |

## 5. Success criteria for the demonstration

A successful judge run establishes five observable facts:

1. An agent proposal does not execute directly.
2. A valid, in-scope request can cross the gateway once.
3. Tool-scope escape, untrusted instructions, changed requests, burst conditions, and replays do not create protected side effects.
4. The decision material is inspectable after execution.
5. The proof record is exportable and linked to the preceding record.

## 6. Product development path

| Stage | Intended next step | Human validation required |
|---|---|---|
| 1. Controlled MVP | One protected tool, deterministic policy, proof chain, adversarial scenarios. | Judge/demo validation. |
| 2. Design partnership | Interview operators and security owners; identify a real protected-tool integration and decision taxonomy. | Documented user research and consent. |
| 3. Pilot | Add tenant separation, policy administration, real human approvals, managed secrets, and one integration adapter. | Pilot contract, threat model review, and operational acceptance. |
| 4. Production readiness | External key management, monitoring, access governance, load testing, incident response, security assessment, and independent review. | Legal, security, reliability, and customer approval. |

## 7. Submission deployment note

The managed/local environment is the verified database-backed authority demonstration. A public Vercel deployment is configured for the static application and serverless API routing, but production use of that public API requires `DATABASE_URL` and `JWT_SECRET` to be configured in Vercel. This is an environment-configuration dependency, not a claim that the project lacks a persistent proof model. The submitted scope must state the distinction accurately.

## 8. Scope statement for judges

> Sentra does not try to replace an enterprise identity system or claim to secure every agent. It proves a smaller and more important point: before a defined software action changes a protected state, that action must carry an exact, unexpired, unused authority that an independent gateway can verify and that a reviewer can inspect afterward.

## References

[1]: ../../README.md "Sentra Authority OS repository README"
[2]: ../../SENTRA_BUYER_BEACHHEAD_BRIEF.md "Buyer-beachhead hypothesis"
[3]: ../../SENTRA_PHASED_ADOPTION_PLAN.md "Phased adoption plan"
[4]: ../../SENTRA_HUMAN_VALIDATION_GATES.md "Human-owned validation gates"
