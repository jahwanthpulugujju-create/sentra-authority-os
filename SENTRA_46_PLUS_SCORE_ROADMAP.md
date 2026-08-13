# Sentra 46+ Readiness Roadmap

## Decision boundary

> **A score greater than 45 means at least 46/50.** No team can honestly guarantee this result because judges apply the rubric. This roadmap defines the evidence package that would make a 46+ assessment *defensible* under the supplied five-criterion model; it does not manufacture a score or promise first place.

The audited workbook places Brand New Day / Sentra at **41/50** with an ordinal position of **#3** and a tie for **#2 by total**. Its supplied criterion profile is Innovation **8**, 24-Hour Feasibility **8**, Impact & Market Potential **7**, Clarity & Completeness **9**, and Technical Depth **9**. The highest supplied total is 44/50. Therefore, the target is not merely “improve Sentra”; it is to create sufficient comparable evidence for a credible **46/50 target case**.

## Target score case

The following profile is a target evidence standard, **not a predicted judge score**. It totals 46 and keeps the strongest current attributes while addressing the two weakest workbook areas.

| Criterion | Supplied workbook score | Evidence target | Target-case score | Why this change must be earned |
|---|---:|---|---:|---|
| Innovation & Uniqueness | 8 | A narrowly defined runtime-authority protocol, not a generic AI payment checker | 9 | The differentiation must be visible in the actual enforcement path. |
| 24-Hr Feasibility | 8 | A bounded, repeatable end-to-end integration with an actual protected action | 9 | Working scope, demo recoverability, and tests must remove “architecture only” doubt. |
| Impact & Market Potential | 7 | One credible beachhead, quantified pain from cited sources, and a buyer/rollout model | 9 | Market claims need evidence and a clear adoption path, not a broad “all agents” claim. |
| Clarity & Completeness | 9 | A judge can explain the problem, mechanism, and proof in under one minute | 10 | Every screen and answer must reinforce the same one-sentence story. |
| Technical Depth | 9 | A coherent gateway, capability, policy, audit, and operations design with adversarial proof | 9 | The aim is reliable proof, not feature inflation. |
| **Total** | **41** | **Evidence-complete target case** | **46** | **More than 45 requires 46 or higher.** |

## The non-negotiable product thesis

**Sentra is a runtime authority firewall that turns an AI agent’s proposed high-impact action into a one-time, context-bound capability; the protected tool executes only after independent policy and gateway verification.**

This should replace vague messages such as “Sentra judges AI payments” or “Sentra uses AI to decide whether an action makes sense.” The actual differentiation is an **enforceable authority boundary**: a prompt, model, and agent planner may propose an action, but they cannot execute it without a verified capability whose scope exactly matches that action.

## Scorecard-to-evidence matrix

| Criterion | What judges must see | Required implementation evidence | Claim to avoid |
|---|---|---|---|
| Innovation | The protected execution path refuses a seemingly valid but altered or replayed action. | Request-bound, policy-version-bound, time-bound, single-use capability; gateway verification before the tool handler. | “We are the first security platform for AI” or “we solve all agent safety.” |
| Feasibility | A controlled user flow works repeatedly in a short live demo and recovers after reset. | Narrow tool adapter, seeded demo tenant, deterministic policy data, reset button, tests, known-good verifier, fallback recording. | “Production ready” or “works with every bank/agent/provider.” |
| Impact | A specific buyer has a costly, frequent authorization problem and can adopt Sentra incrementally. | One buyer persona, one high-impact workflow, cited market/problem sources, control-owner workflow, phased integration plan. | Unsupported market-size, loss, or customer claims. |
| Clarity | A non-technical judge can restate the value within 30 seconds. | One-line value proposition, five-screen narrative, visible red/green execution result, readable evidence reveal. | Leading with cryptography, components, or acronyms before the problem. |
| Technical depth | A technical judge can inspect exactly why the system allowed or blocked an action. | Canonical request, deterministic policy result, signed capability, atomic consumption, event hash chain, test evidence, architecture decision records. | Calling HMAC a public-key signature, claiming non-repudiation, or presenting a mock as an external integration. |

## Priority 0 — finish the enforceable authority boundary

These items are the highest-value work because they strengthen Innovation, Feasibility, and Technical Depth simultaneously. Do not add broad new features until these are demonstrably complete.

| Work item | Required implementation | Judge-visible proof | Verification gate |
|---|---|---|---|
| **1. Real protected-tool adapter** | Route one meaningful demo action through `SentraGateway.authorize()` before the tool handler. The handler must have no direct UI/API bypass. | The screen shows “proposed action → policy → capability → gateway → tool result.” | A direct handler call is rejected in a test; only a verified capability reaches the tool. |
| **2. Canonical authority envelope** | Define and persist `tenantId`, `agentId`, `action`, `resource`, `amountOrLimit`, `currency`, `purpose`, `policyVersion`, `requestHash`, `issuedAt`, `expiresAt`, and `idempotencyKey`. | Open one evidence record and show each bound field. | Changing any bound field produces `REQUEST_HASH_MISMATCH` or scope denial. |
| **3. Fail-closed gateway** | Default unknown policy, missing capability, invalid signature, expired capability, unavailable policy, and duplicate capability to deny or escalate. | A small “gateway status” line says exactly why execution was blocked. | Fault-injection test proves no protected side effect on verification failure. |
| **4. Capability lifecycle** | Keep `ISSUED`, `CONSUMED`, `EXPIRED`, and `REJECTED` states, with atomic consume-and-execute semantics. | Replay Attempt visibly fails after one successful action. | Concurrent/repeated attempt test yields at most one tool execution. |
| **5. Policy versioning** | Store a versioned policy snapshot/identifier in every decision and capability. Add a small policy history panel. | Judge can see which rule allowed or blocked the event. | Changing policy after issuance does not silently change the capability’s intended context. |
| **6. Key lifecycle** | Add a `keyId`, issuance key version, rotation metadata, and a demo-safe key revocation/invalid-key test. Prefer Ed25519 for a public-verification story; if retaining HMAC, describe it accurately as shared-secret MAC verification. | A “key invalid / capability rejected” evidence record. | Test proves retired or wrong key material cannot validate the capability. |
| **7. Audit-chain verification** | Preserve canonical event hashes and predecessor links. Add an export/download of the proof record. | Clicking “Verify proof chain” returns a clear pass/fail. | Deliberate tamper test fails verification. |

### Minimal architecture to show

```text
Agent / Prompt / Planner
        │ proposes only
        ▼
Authority API ──► Deterministic Policy Kernel
        │                    │
        │               ALLOW / DENY / ESCALATE / FREEZE
        ▼
Context-bound, expiring, single-use capability
        ▼
Independent Gateway Verification ──► Protected Tool Adapter
        │                                      │
        └────────── audit proof chain ◄────────┘
```

The line between the **Gateway** and **Protected Tool Adapter** is the one a judge must believe. If the UI can call the protected action without going through that boundary, Sentra loses its core differentiation.

## Priority 1 — create a credible market and impact case

The current supplied impact score of 7 is the largest numerical gap in the 46 target case. Do not answer this with a generic “AI market is huge” slide. Answer it with one buyer, one action class, one control failure, and one deployable adoption path.

### Choose one beachhead

Use **AI-agent spending and high-impact SaaS actions for finance/operations teams** as the initial wedge. The demo can use a controlled “software purchase / vendor payment approval” style workflow without claiming to connect to a live bank or payment network.

| Required element | Exact content needed | Evidence standard |
|---|---|---|
| Buyer | Head of Finance, Controller, or RevOps/Procurement owner responsible for agent-enabled purchasing. | State the role and its control responsibility. |
| Agent workflow | Agent requests a subscription purchase, vendor payout, account permission change, or contract-renewal action. | The action must be represented in the canonical request and gateway scope. |
| Pain | Existing approval and payment controls verify who can pay, not whether an agent’s current action matches a purpose, budget, and policy. | Support public assertions with cited sources in the presentation and repository. |
| Adoption | Deploy Sentra first as an API/gateway in front of one tool, then add policy catalog, approval queue, and audit export. | Show a three-stage diagram and state what is not yet implemented. |
| Business model | Per protected action / per active agent / enterprise control-plane license. | Label as a hypothesis unless supported by customer discovery. |

### Required impact artifacts

1. A two-page buyer brief with a cited problem statement, a cost/risk hypothesis, target workflow, and why existing controls leave a runtime gap.
2. Three short structured interviews or documented proxy reviews with people who match the buyer/operator role. Do not invent quotes, customer logos, pilots, or savings.
3. A one-page phased adoption plan: **observe**, **shadow decision**, **enforce low-risk action**, **expand to higher-impact actions**.
4. A measurable demo outcome such as: “six tested authority scenarios; one valid protected execution; five blocked paths; no blocked path changes protected state.” This is an implementation metric, not a business ROI claim.

## Priority 2 — turn technical depth into an inspection advantage

The aim is not to increase component count. It is to make the design explainable under questioning.

| Topic | Add or tighten | Proof to show |
|---|---|---|
| Policy model | Add a concise policy DSL or policy JSON with subject, action, resource, constraints, decision, and reason code. | Show one policy evaluated against the canonical request. |
| Decision determinism | Keep the security decision deterministic. An LLM may summarize context, but it must not be the final authority kernel. | Prompt injection has no authority to change gateway behavior. |
| Multi-step workflows | Demonstrate a parent workflow ID and step budget, where a capability only authorizes one named step. | A step from a different workflow or budget is refused. |
| Human escalation | For high-risk requests, create an approval request with explicit approver, expiry, and binding to the original request hash. | Approving a changed request does not authorize the modified one. |
| Rate and anomaly controls | Keep the existing burst anomaly rule and add an explainable threshold/policy condition. | A normal request passes only if all other policy gates pass. |
| Observability | Add decision latency, gateway denial reason counts, capability expiry count, and proof-verification status. | Metrics are labeled demo/local unless collected from a real deployment. |
| Threat model | Add a compact repository threat model: prompt injection, replay, request mutation, credential theft, policy outage, confused deputy, and audit tampering. | Map every threat to a control, test, and residual limitation. |

## Priority 3 — make clarity a 10-point strength

Clarity is not visual polish alone. A clarity score of 10 requires one coherent narrative from problem to proof.

### The 30-second explanation

> “AI agents can now take actions, but normal permissions only prove that an agent has access. Sentra checks whether this exact action is allowed right now, gives it a one-time capability, and the protected tool refuses to run without that proof. If the request changes or is replayed, nothing executes.”

### Required judge-demo order

| Time | What happens | What the judge learns |
|---:|---|---|
| 0:00–0:20 | State one irreversible-risk story and the Sentra one-liner. | Why existing access is insufficient. |
| 0:20–0:45 | Show one Valid Action. | A valid request can cross the boundary once. |
| 0:45–1:15 | Show Changed Request or Replay Attempt. | The same-looking request cannot execute if context changes. |
| 1:15–1:45 | Open the proof record. | The decision is inspectable, not a black box. |
| 1:45–2:15 | Show the policy/gateway architecture and market beachhead. | The approach is deliberate, feasible, and adoptable. |
| 2:15–2:45 | State scope, limitation, and next integration. | The team is credible rather than overclaiming. |

### Interface requirements

- Keep one principal action per screen state; the guided walkthrough is useful, but manual scenario buttons must remain available.
- Use plain-language reason codes beside technical codes. For example: **“Blocked: request details changed after approval”** plus `REQUEST_HASH_MISMATCH`.
- Keep the proof explorer progressive: show the verdict first, then request/capability/gateway/proof details on demand.
- Preserve light-mode contrast, keyboard access, reduced-motion support, and clear online/offline status.
- Put the actual source of truth on screen: live/local label, policy version, timestamp, and proof-integrity result.

## Priority 4 — demonstrate feasibility with an operating release gate

The team should not claim a 9/10 feasibility case until every gate below passes on the same environment used for judging.

| Gate | Required proof | Pass condition |
|---|---|---|
| Build reliability | `pnpm test`, `pnpm check`, and `pnpm build`. | All succeed in the final demo environment. |
| Authority safety | `./verify-demo.sh` plus manual valid/replay/changed-request run. | One valid side effect; no blocked side effect. |
| Gateway boundary | Direct protected-tool invocation test. | Rejected unless gateway-verified capability is present. |
| Recovery | Reset, refresh, offline cache, retry, and reconnect tests. | Demo returns to a known baseline without data ambiguity. |
| Presentation resilience | 90-second local backup video and offline architecture screenshot. | Usable if network or browser fails. |
| Reproducibility | README command path, known demo seed, commit/tag, and one-page runbook. | A teammate can run the demo without the original developer. |

## What not to add

The following reduce credibility or consume time without supporting the 46-point case.

| Do not add | Why it hurts |
|---|---|
| IoT/hardware claims | Sentra is a software-only authority product; unrelated hardware obscures the core value. |
| A generic chatbot | It does not prove enforcement and makes Sentra resemble every other AI assistant. |
| An LLM as the final security decision-maker | Prompt injection and non-determinism undermine the authority claim. |
| Blockchain “for audit” without a need | Hash-linked proof and clear retention controls are stronger than decorative complexity. |
| Fake customer testimonials, ROI, pilots, or ratings | It is ethically unacceptable and easy for judges to challenge. |
| A live payment claim without a real, permitted integration | Use a protected demo action and label it accurately. |
| More scenarios without a clear decision reason | Five excellent adversarial cases are better than ten unexplained buttons. |

## Final evidence package

Before presenting, the team should have the following files and screens ready.

1. **One-page problem and beachhead brief** with cited public evidence, buyer, action, and adoption path.
2. **Architecture one-pager** showing agent proposal, policy kernel, capability, gateway, protected tool, and proof chain.
3. **Threat/control/test matrix** with each threat mapped to a mitigation and an executed test.
4. **Demo script** limited to three minutes and a 90-second backup recording.
5. **Repository release packet** containing README, `.env.example` with no secrets, architecture decisions, test commands, verifier, and tagged final commit.
6. **Judge evidence screen** that shows decision reason, capability lifecycle, one protected-state result, and proof-integrity result.
7. **Limitations statement**: controlled software MVP; no production certification; no external audit; one tool adapter; market claims are hypotheses until validated.

## Release decision

Proceed with the 46+ case only when all Priority 0 gates, at least one credible beachhead evidence pack, the full release gate, and the three-minute rehearsal are complete. If any security claim cannot be demonstrated, remove or narrow it. A smaller, truthful authority firewall that visibly blocks a changed or replayed request is more likely to score well than a larger system with unsupported claims.
