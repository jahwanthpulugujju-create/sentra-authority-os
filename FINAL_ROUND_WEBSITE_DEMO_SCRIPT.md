# Sentra Final-Round Website Demo Script

## Presenter objective

The final-round website demonstration should make one argument: **an agent can propose an action, but only a verified, single-use authority can cross Sentra’s protected boundary.** Do not try to explain every screen. Show one permitted action, prove two dangerous paths fail, then make the evidence inspectable.

> **Target time:** 2 minutes 45 seconds.  
> **Primary close:** “The model can change its reasoning. It cannot change its authority.”

## Before the judge arrives

Reset the demo baseline. Confirm the header reports **Live authority**, the vendor approval is held, and the proof timeline is visible lower on the page. Keep the browser at the hero section. Have the fallback video and offline architecture screenshot available, but do not mention them unless a network or browser problem occurs.

## Main script: 2 minutes 45 seconds

| Time | Website action | Say this | What the judge should conclude |
| --- | --- | --- | --- |
| 0:00–0:20 | Point to the hero and the boundary diagram. | “AI agents can take actions, but normal access only tells us that an agent can call a tool. Sentra checks whether **this exact action** is allowed now. It issues a one-time authority, and the protected tool refuses to run without it.” | Sentra is a runtime authority layer, not an AI chatbot or generic dashboard. |
| 0:20–0:30 | Point to the initial protected-state status. | “This is one controlled software workflow: vendor approval. The state is held until Sentra approves the exact request.” | The demo has one focused, testable action. |
| 0:30–0:55 | Click **Valid Action** once. | “The agent proposes an approval. Sentra binds the tenant, purpose, USD limit, policy version, workflow step, and operation key into a canonical request. Deterministic policy allows it, a one-time HMAC capability is issued, and the gateway verifies it before the protected tool changes state.” | The valid state change happens only after policy and gateway verification. |
| 0:55–1:15 | Open the new decision record. Point to request, capability, policy, and gateway. | “This is not a success message alone. The exact request, policy, capability, gateway verdict, and execution result are stored together. The visible reason explains the decision in plain language and also retains the technical code.” | The decision is inspectable after it happens. |
| 1:15–1:40 | Click **Changed Request**. | “Now we change the request after approval. A request that merely looks similar is not enough. Its hash no longer matches the capability, so Sentra blocks it before the tool. Notice that protected state does not change.” | Authority is bound to request context, not a broad standing permission. |
| 1:40–2:00 | Click **Replay Attempt**, or use the valid-versus-replay contrast if already open. | “A valid capability is not reusable. The first permitted action consumes it. A replayed attempt is refused, so there is no second side effect.” | Single-use authority blocks replay. |
| 2:00–2:18 | Click **Prompt Injection**. | “Untrusted instructions may affect a model’s reasoning, but they cannot mint authority. This path escalates to a review artifact bound to the original request hash, approver role, and expiry. It cannot approve a changed request.” | Sentra separates model output from execution authority. |
| 2:18–2:35 | Scroll to policy/key/proof evidence. | “Here is the local source of truth: policy version and constraints, key lifecycle, gateway result, capability lifecycle, and a hash-linked proof chain. The proof check is visible and the JSON package can be downloaded for inspection.” | The system exposes evidence, not just a UI claim. |
| 2:35–2:45 | Return attention to the final proof/result. | “We start with one high-impact finance or procurement action behind one gateway, then expand only after observing and validating real workflows. This is a controlled software MVP—not a production-certified payment or ERP integration. The model can change its reasoning. It cannot change its authority.” | The team understands scope, feasibility, and honest limitations. |

## If the judge gives only two minutes

Use the following compressed sequence. Do **not** add extra scenarios.

1. **Problem, 15 seconds:** “An agent can propose an action; Sentra decides whether that exact action may execute now.”
2. **Valid Action, 30 seconds:** Run it once and show the state change after policy, capability, and gateway verification.
3. **Changed Request, 30 seconds:** Run it and point to unchanged protected state.
4. **Replay Attempt, 20 seconds:** Explain that consumed authority cannot cause a second effect.
5. **Proof and close, 25 seconds:** Open the proof status, name the policy/key/capability evidence, then close with the one-line statement.

## Optional talking points when the judge asks deeper questions

| Likely question | Short answer | Show on the website |
| --- | --- | --- |
| “Why not use normal permissions?” | “Normal permissions can be broad and persistent. Sentra adds a decision for this exact action, purpose, limit, workflow step, and time window.” | Canonical request and policy panel. |
| “How do you stop prompt injection?” | “We do not treat model text as authority. The deterministic policy and gateway decide; suspicious instructions escalate rather than execute.” | Prompt Injection result and review artifact. |
| “How do you prevent replay?” | “The capability is one-time. Once consumed, the same authority is refused before the protected adapter can act again.” | Replay result or valid-versus-replay contrast. |
| “Can the audit be changed?” | “Records are hash-linked, and the verifier recomputes the chain. In this MVP it is local persistent evidence, not an external immutable audit service.” | Proof verifier and download control. |
| “What is the business use?” | “The first wedge is one high-impact finance or procurement action. We would observe, shadow, then enforce a bounded low-risk action before expanding.” | Beachhead/limitations copy and policy evidence. |
| “Is this production ready?” | “No. It is a controlled MVP with one protected adapter. Production needs integration-specific security review, key custody, identity design, buyer validation, and operational controls.” | Scope/limitations section. |

## Presenter rules

Speak in short, factual sentences. Always lead with the consequence: **“Nothing executes.”** Then show why. Avoid deep cryptography unless asked; if asked, say **“HMAC-SHA256 shared-secret MAC verification in the controlled demo, not a public-key signature system.”**

Do not claim a live bank, payment, ERP, or customer integration; production certification; independent security audit; customer traction; ROI; or a guaranteed competition result. If something goes wrong, do not improvise an explanation. Reset baseline, show the proof record, or use the backup walkthrough.
