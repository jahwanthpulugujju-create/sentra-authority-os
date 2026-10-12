# Event Taxonomy and Stream Contract

## Event principle

The relational authority transaction remains the system of record. The event stream is a durable downstream contract for analytics, notification, integration observability, and feature computation. A consumer delay or replay must never change an already committed decision or cause an extra protected execution.

| Topic | Producer | Partition key | Consumer examples | Retention intent |
|---|---|---|---|---|
| `authority.decision.v1` | Authority API | tenant ID + request ID | evidence export, policy metrics, alerting | Audit and operational replay. |
| `capability.lifecycle.v1` | Capability/gateway service | capability ID | replay analytics, expiry worker, integrity monitor | Capability lifecycle visibility. |
| `gateway.execution.v1` | Gateway | tenant ID + resource ID | adapter reconciliation, SLO metrics, incident monitor | Protected side-effect trace. |
| `review.lifecycle.v1` | Review service | review ID | notification, review queue, governance dashboard | Human-review audit. |
| `telemetry.signal.v1` | Gateway and adapters | tenant ID + agent ID | anomaly service, rate control, capacity analytics | Friction-only intelligence inputs. |
| `policy.lifecycle.v1` | Policy service | policy ID + version | cache invalidation, audit, deployment monitor | Immutable policy change evidence. |

## Envelope

```json
{
  "event_id": "evt_...",
  "event_type": "authority.decision.created",
  "schema_version": "1.0",
  "occurred_at": "2026-08-18T00:00:00Z",
  "tenant_id": "tenant_acme",
  "correlation_id": "req_...",
  "causation_id": null,
  "idempotency_key": "...",
  "data_classification": "confidential",
  "payload": {},
  "payload_hash": "sha256:..."
}
```

## Processing rules

Consumers are idempotent using `event_id`; producers use a transactional outbox or equivalent atomic publication approach. Schema changes are additive by default and versioned. Invalid messages go to a dead-letter topic with owner and replay procedure. Event consumers cannot mutate an authority decision directly; any requested state change re-enters the authority API as a new canonical request.
