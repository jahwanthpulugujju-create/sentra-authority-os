# Sentra Final-Round Story Pitch

## The one idea the judges must remember

> **An AI agent may propose an action, but Sentra decides whether that exact action may happen now—and proves why it happened or why it was blocked.**

Do not open by saying “we built a security platform.” Start with one relatable moment. The judges should first feel the danger of an agent acting with broad access, then see the simple answer: a one-time permission checked at the gate.

## Before you speak

Reset the website with **Reset proof & inputs**. Keep the browser at the top of the Sentra page. Confirm that the protected vendor state is held, the header says **Live authority**, and no previous proof event is distracting the judge. One teammate should speak; a second teammate should operate the website only when the script says **Click**. Do not let two people explain the same point.

## Main pitch: 3 minutes 30 seconds

| Time | Website action | Exact words to say | What the judge should understand |
| --- | --- | --- | --- |
| 0:00–0:25 | Keep the hero visible. Make eye contact before touching the laptop. | “Imagine a procurement agent is helping a company approve vendors. It receives one ordinary instruction: ‘Approve this vendor.’ That sounds useful. But if the agent has broad access, one bad prompt, one changed amount, or one repeated request can create a real business action. The question is not only, ‘Can the agent use the tool?’ The question is, ‘Should this exact action happen right now?’” | You understand a real agent-risk problem in simple terms. |
| 0:25–0:45 | Point to the hero line and boundary diagram. | “That is why we built Sentra. Sentra is the decision boundary between an AI agent and a protected software action. The agent can propose. Sentra decides. The protected tool executes only when it receives a real, verified yes.” | The project is an authority layer, not a chatbot or generic dashboard. |
| 0:45–1:00 | Point to the protected action on the right. | “For the final demo, we chose one focused workflow: vendor approval. Right now, the action is held safely. Nothing has happened just because the agent asked.” | The demo is focused, feasible, and safe. |
| 1:00–1:30 | **Click Valid Action once.** Let the result settle. | “Now I send one valid request. Sentra reads the exact purpose, amount limit, workflow step, policy version, and request identity. If all of that matches the policy, Sentra issues a one-time capability. The gateway checks that capability before the protected tool changes state. Notice: the action changes only after the check.” | The allow path is real and deterministic. |
| 1:30–1:45 | Point to the latest decision, request record, and verdict. | “This is important: we do not show only a green success message. We store what was requested, what policy decided, what capability was issued, what the gateway checked, and what execution happened. A judge or reviewer can inspect the decision afterwards.” | The product provides evidence, not just an interface. |
| 1:45–2:05 | **Click Changed Request.** Point to the unchanged protected state. | “Now let us try a common failure: someone changes the request after approval. It may look almost identical, but it is not the same action. Sentra sees that the request no longer matches the approved capability. So it refuses the request before the protected tool. Nothing executes.” | Sentra binds authority to the exact request. |
| 2:05–2:25 | **Click Replay Attempt.** | “Now we try to reuse a permission that was valid once. A capability is not a permanent pass. After it is consumed, it cannot be used again. Sentra blocks the replay, so there is no second side effect.” | Sentra blocks replay and enforces one-time authority. |
| 2:25–2:45 | **Click Prompt Injection.** | “Finally, suppose untrusted instructions try to push the agent outside the intended workflow. Sentra does not let model text create authority. This request is escalated for review instead of executed. The model may change its reasoning, but it cannot change its authority.” | Sentra separates AI reasoning from execution control. |
| 2:45–3:05 | Scroll to the policy, key, and proof areas. | “Here is the proof behind the demo: visible policy version, signing-key lifecycle, capability lifecycle, denial reasons, and a hash-linked authority record. We can copy, export, email a summary, reset the whole proof workspace, or send an outcome-only demo alert. The sensitive proof itself stays in Sentra.” | The team has thought about auditability and operability. |
| 3:05–3:20 | Point to business/architecture summary or stay at proof panel. | “We begin with one high-impact finance or procurement action because it is easy to observe, control, and validate. First we observe the workflow, then shadow it, then enforce one bounded action, and only then expand.” | The adoption plan is realistic. |
| 3:20–3:30 | Stop clicking. Return attention to judges. | “Sentra does not promise that AI will never make mistakes. It makes one promise we can prove: the agent cannot turn a proposal into a protected action without a real yes. Thank you.” | Clear close, memorable distinction, honest scope. |

## The simple story version to memorize

If you forget every detail, remember this sequence:

> “An agent asks to act. Sentra checks the exact action. If the action is valid, it gets one-time permission. If anything changes, repeats, or becomes suspicious, nothing executes. And afterwards, we can prove what happened.”

That is the whole product. Every screen and every technical term should support this sequence, not distract from it.

## Exactly how to explain the technical words

| If the judge sees | Say this simple sentence | Avoid saying |
| --- | --- | --- |
| Canonical request | “This is the exact version of the request that Sentra evaluated.” | “It is just JSON.” |
| Capability | “It is a short-lived, one-time permission for one exact action.” | “It is a token that gives access.” |
| Gateway | “This is the final gate before the protected software action.” | “The API layer.” |
| Request hash | “It is the fingerprint of the approved request. If the request changes, the fingerprint changes.” | “Cryptographic digest” unless asked. |
| Replay | “Trying to use the same one-time permission twice.” | “Nonce reuse.” |
| Proof chain | “A linked record of what happened, so later events cannot silently replace earlier evidence.” | “Blockchain.” |
| Escalation | “Suspicious instructions go to review instead of directly to execution.” | “The LLM is blocked.” |

## If the judges interrupt

An interruption is usually good: it means they are engaged. Stop the demo, answer in one or two sentences, then return to the same story point.

| Question | Answer in plain language | Then show |
| --- | --- | --- |
| “Why not normal user permissions?” | “Permissions say who can use a tool. Sentra checks whether this exact action, with this purpose and limit, should run now.” | Changed Request. |
| “Does this really execute?” | “Yes. The valid action changes the protected state once. The invalid attempts leave it unchanged.” | Valid Action, then Replay Attempt. |
| “How do you handle prompt injection?” | “We do not treat a prompt as authority. It can propose; policy and the gateway decide.” | Prompt Injection. |
| “Can you prove the block?” | “Yes. Each decision stores its reason, capability state, gateway result, and linked proof record.” | Proof panel. |
| “Is it production ready?” | “This is a controlled MVP with one protected software adapter. Production would add integration-specific identity, key custody, monitoring, and security review.” | Policy/key/proof panel. |
| “Who would use it?” | “Finance and procurement teams can begin with one high-impact agent action, then expand only after evidence and approval controls are trusted.” | The workflow map. |

## Do not say these things

Do not say “we will definitely prevent every attack,” “we are integrated with banks or ERP systems,” “we are production certified,” “our proof is blockchain,” “we have customer traction,” or “we will definitely win.” Such statements make judges test your credibility rather than your system. Say what the demo genuinely proves and state the next production step clearly.

## Ninety-second emergency version

Use this only if judges reduce your time.

> “AI agents can propose real actions, but a broad permission is not enough. A request can be changed, replayed, or influenced by untrusted instructions. Sentra is the boundary between the agent and the protected tool. It checks this exact request, not only the identity of the agent.
>
> Here is one valid vendor approval. Sentra checks the policy and creates one short-lived, one-time capability. The gateway verifies it, and only then does the protected state change.
>
> Now we change the request. Sentra refuses it because the approved fingerprint no longer matches. Now we replay the same authority. Sentra refuses it because it was already consumed. In both cases, nothing executes.
>
> We store the policy result, gateway verdict, capability state, and proof record so the decision can be inspected later. Sentra is a controlled software MVP, but its central principle is simple: the model can change its reasoning; it cannot change its authority.”

## Rehearsal rule

Practice until the live demo sounds like a story, not like a feature list. The audience should hear **problem → danger → boundary → valid action → refusal → proof → realistic next step**. Pause for one second after “Nothing executes.” Let the website show the result before you explain the next concept.
