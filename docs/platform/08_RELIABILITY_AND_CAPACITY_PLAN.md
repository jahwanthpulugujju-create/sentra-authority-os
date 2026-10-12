# Reliability and Capacity Plan

## Reliability design

Consequential execution depends on authority storage, policy availability, key verification, capability state, and gateway/adapter behavior. Failure of these dependencies must create a visible refusal or an `UNKNOWN_EXECUTION_STATE` requiring reconciliation; it must not create an unrecorded side effect.

| Dependency failure | Expected behavior | Recovery action |
|---|---|---|
| PostgreSQL unavailable | Fail closed for new protected actions. | Restore database; replay outbox/operational evidence only after integrity check. |
| Redis unavailable | Bypass non-authoritative cache if safe; retain strict database-backed consumption. | Reduce rate-control capacity; alert; do not treat cache as source of truth. |
| Event stream unavailable | Commit authority transaction and transactional outbox; defer analytics publication. | Replay outbox after stream recovers. |
| Key service unavailable | Refuse capability issuance/verification. | Restore key service; never use a fallback key. |
| Adapter timeout | Mark unknown execution state; block blind retry. | Reconcile using adapter receipt/idempotency key. |
| Notification failure | Keep review pending; expose queue and alternative reviewer route. | Retry delivery under controlled policy. |

## Benchmark program

Benchmark only workload-specific scenarios: decision-only requests, capability issue, gateway verification, adapter success, replay refusal, and review creation. The load profile must include realistic tenant skew, payload sizes, policy complexity, cache hit/miss behavior, network latency, adapter latency, and failure injection.

| Gate | Required artifact |
|---|---|
| Correctness | No duplicate side effect under retries, replay, or consumer recovery. |
| Latency | p50/p95/p99 by route and dependency state. |
| Saturation | Throughput-versus-latency curve and backpressure behavior. |
| Resilience | Database/key/stream/adapter outage exercise and recovery evidence. |
| Cost | Cost per protected action and per retained evidence event. |
| Security | Tenant/isolation and abuse-case results at target load. |

No one-million-RPS statement may be used until these gates are met for a defined workload and deployment topology. Such capacity generally requires a dedicated, multi-region engineering program—not a single app-server configuration.
