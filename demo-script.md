# Sentra Authority OS
## Round 2 Live Demo Script

**Total duration:** 3 to 4 minutes

## 1. Opening, 20 seconds

> “Sentra is a runtime authority layer for autonomous agents. The agent can propose an action, but it cannot execute a protected tool directly. Sentra evaluates the exact request, issues a narrow signed capability only when policy allows it, and makes the gateway verify that authority before execution.”

Show the live status card. Point out the protected vendor approval is initially held and that the dashboard uses a persistent software database, not hardware.

## 2. Valid Action, 30 seconds

Click **Valid Action**.

> “The procurement agent requests approval for this vendor. Sentra canonicalizes the request, evaluates deterministic policy, creates a signed capability, and verifies it at the gateway. Because the request is within scope, the result is `ALLOW` and the protected approval state changes.”

Open the decision record to show the canonical request, capability, request hash, capability hash, gateway result, and execution result.

## 3. Unauthorized Tool, 25 seconds

Click **Unauthorized Tool**.

> “Now the same agent requests a tool outside its authority, an employee data export. The gateway returns `DENY`. No protected tool call is issued, and the state remains unchanged.”

## 4. Prompt Injection, 25 seconds

Click **Prompt Injection**.

> “Untrusted text tries to tell the agent to ignore policy. Text can influence reasoning, but it cannot mint authority. Sentra returns `ESCALATE`; execution stops before the gateway.”

## 5. Changed Request, 25 seconds

Click **Changed Request**.

> “Approval is bound to the exact canonical request hash. When one field changes after approval, the hash does not match the capability. Sentra returns `DENY` and blocks the changed request.”

## 6. Burst Anomaly and Replay Attempt, 30 seconds

Click **Burst Anomaly**, then **Replay Attempt**.

> “Abnormal behavior moves the agent into `FREEZE`. A replayed request is also denied because the nonce has already been consumed. In both cases, the protected tool state does not change.”

## 7. Proof chain and close, 30 seconds

Scroll to the persisted audit timeline.

> “Every record includes the prior record hash and its own record hash, along with the request, decision, capability, gateway verification, and execution result. The judge can inspect the whole request-to-proof chain, not just a dashboard message.”

Finish with:

> **“The model can change its reasoning. It cannot change its authority.”**
