# Sentra Authority OS
## Round 2 Live Demo Script

**Total duration:** approximately 2 minutes 45 seconds

## 1. Problem and authority boundary, 20 seconds

> “AI agents can take actions, but normal permissions only prove that an agent has access. Sentra checks whether this exact action is allowed right now, gives it a one-time capability, and the protected tool refuses to run without that proof. If the request changes or is replayed, nothing executes.”

Show the live status card. Point out the protected vendor approval is initially held and that the dashboard uses a persistent software database, not hardware.

## 2. Valid Action, 25 seconds

Click **Valid Action**.

> “The procurement agent proposes one scoped vendor approval. The request binds the tenant, purpose, USD limit, workflow step, policy version, and operation key. Sentra evaluates deterministic policy, creates a one-time HMAC capability, and verifies it at the gateway. Only then does the protected state change.”

Open the decision record to show the canonical request, capability, request hash, capability hash, gateway result, and execution result.

## 3. Changed Request or Replay Attempt, 30 seconds

Click **Changed Request**. If time permits, use the guided valid-versus-replay contrast rather than a second manual run.

> “A request that looks similar is not enough. The action changed after approval, so the request hash no longer matches the capability. Sentra blocks it before the tool. The replay contrast shows the same principle in time: one fresh capability may execute once; the spent capability produces no second side effect.”

## 4. Prompt Injection and approval binding, 25 seconds

Click **Prompt Injection**.

> “Untrusted text tries to override policy. It can influence a planner’s reasoning, but it cannot mint authority. Sentra returns `ESCALATE` and stores a pending review artifact bound to the original request hash, a controller role, and an expiry. That artifact cannot approve a changed request.”

## 5. Policy, key, and proof inspection, 35 seconds

Open the decision record, then the policy and key panels. Scroll to the proof verifier and download control.

> “This screen shows the actual local source of truth: the policy version and rule, the HMAC key ID and lifecycle status, the canonical request, gateway reason, capability lifecycle, and the proof-integrity result. The JSON download is a local evidence package, not an external audit.”

## 6. Beachhead, scope, and close, 30 seconds

> “Our beachhead is one high-impact finance or procurement action behind one gateway. We would start by observing, then shadowing decisions, then enforcing a low-risk bounded action, before expanding. This is a controlled software MVP: one adapter, no live bank or ERP connection, no production certification, and market demand still needs real buyer validation.”

Finish with:

> **“The model can change its reasoning. It cannot change its authority.”**
