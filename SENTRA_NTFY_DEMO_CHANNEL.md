# Sentra ntfy Controlled-Demo Channel

## Purpose

The website exposes a **Send ntfy demo alert** action for final-round presentation. It publishes only the latest high-level outcome, technical reason code, and internal event ID after a Sentra scenario has already completed. The notification exists to show that a verified authority event can produce an operational signal; it is not part of the policy decision, capability verification, protected-tool execution, or proof chain.

## Scope boundary

| Included in the ntfy notification | Explicitly excluded |
| --- | --- |
| Outcome, for example `ALLOW` or `DENY` | Canonical request JSON |
| Technical reason code | Request/capability/proof hashes |
| Internal demo event ID | Tenant, agent, purpose, amount, limit, identities, or customer data |
| Link instruction to inspect the local Sentra demo | Proof package JSON or any attachment |

The server creates one random `sentra-demo-<20 hexadecimal characters>` topic for its current runtime. It is intentionally marked **ephemeral public demo channel** in the interface. Because ntfy’s public-topic model treats the topic name as a password, the topic is not a production secret store and must not be used for sensitive evidence or customer information. The ntfy API accepts HTTP POST publishing and supports title, priority, and tags, which Sentra uses for this limited demo signal. [1]

## Presenter flow

1. Run a Sentra scenario and inspect the local proof record first.
2. Click **Send ntfy demo alert** in the proof action panel.
3. The website shows a green success toast after ntfy accepts the outcome-only notification.
4. If a judge asks about the notification, state: “The policy and proof remain local. ntfy receives an operational summary only.”

## Production boundary

For a production deployment, replace this public demo topic with a user-owned or self-hosted ntfy server, a protected topic, an access token stored through the project secret flow, explicit retention policy, delivery monitoring, and a data-classification review. Do not treat the randomized topic as durable configuration or security control.

## References

[1]: https://docs.ntfy.sh/publish/ "ntfy — Sending messages"
