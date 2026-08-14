# Sentra ntfy Controlled-Demo Channel

## Purpose

The judge demo has exactly **one automatic phone-alert path**: the **Prompt Injection** scenario returns `ESCALATE` and then publishes an outcome-only message to the current ntfy topic. The other scenarios do not publish phone alerts. The notification shows that an escalation can create a safe operational signal; it is not part of the policy decision, capability verification, protected-tool execution, or proof chain.

## Scope boundary

| Included in the ntfy notification | Explicitly excluded |
| --- | --- |
| The high-level fact that human review is required | Canonical request JSON |
| Instruction to inspect the local Sentra proof record | Request/capability/proof hashes |
| No agent, tenant, event, or technical-reason identifier | Purpose, amount, limit, identities, or customer data |
| Link instruction to inspect the local Sentra demo | Proof package JSON or any attachment |

The server creates one random `sentra-demo-<20 hexadecimal characters>` topic for its current runtime. It is intentionally marked **ephemeral public demo channel** in the interface. Because ntfy’s public-topic model treats the topic name as a password, the topic is not a production secret store and must not be used for sensitive evidence or customer information. The ntfy API accepts HTTP POST publishing and supports title, priority, and tags, which Sentra uses for this limited demo signal. [1]

## Presenter flow

1. Before presenting, subscribe your phone’s ntfy app to the current randomized topic shown in the proof panel.
2. Run **Prompt Injection**. This is the one scenario designed to return `ESCALATE`.
3. Sentra records the local escalation evidence and automatically sends an outcome-only alert with a one-time review link.
4. The Sentra dashboard separately shows an eight-character reviewer code. It is never delivered through ntfy, the notification body, or the review link.
5. Open the alert on the phone, enter that dashboard-held reviewer code, then choose **Approve review** or **Deny review**. Either choice closes only the review; it never executes the original untrusted action.
6. The website records a separate hash-linked mobile-review event. Incorrect codes, expired links, and reused review links are refused.
7. If a judge asks about the notification, state: “ntfy is delivery only. The dashboard-held reviewer code and one-time link are both required to resolve a bounded human review. The original request stays blocked and must be resubmitted as a fresh trusted request.”

## Production boundary

For a production deployment, replace this public demo topic and URL token with authenticated reviewer identity, a user-owned or self-hosted ntfy server, protected topics, access tokens stored through the project secret flow, explicit retention policy, delivery monitoring, a data-classification review, and an authorization audit. Do not treat the randomized topic or one-time review link as durable production security controls.

## References

[1]: https://docs.ntfy.sh/publish/ "ntfy — Sending messages"
