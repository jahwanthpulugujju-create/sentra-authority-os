# High-Scale Infrastructure Migration and Benchmark Gates

## Migration posture

Docker, Kubernetes, Kafka, Redis, and Rust are useful tools, not a completeness checklist. The migration order follows measured bottlenecks and operational need, preserving a small working authority kernel while adding services only when their boundary is proven.

| Milestone | Architecture change | Promotion gate |
|---|---|---|
| Pilot | Managed PostgreSQL, Redis for non-authoritative performance paths, object storage, real adapter, SSO. | One design-partner workflow and recovery test. |
| Multi-tenant foundation | Tenant partitioning, policy bundles, key-management service, transactional outbox, stream contract. | Isolation tests, outbox recovery, performance baseline. |
| Service separation | Stateless authority service, independent gateway service, review service, analytics consumers. | Contract tests and distributed trace evidence. |
| Container maturity | Reproducible Docker builds, SBOM, signed images, CI integration environment. | Supply-chain, secret, and rollback checks. |
| Orchestration | Managed Kubernetes or equivalent only if autoscaling/service isolation needs justify it. | Multi-zone deployment, autoscaling tests, on-call runbook. |
| Hot-path optimization | Rust gateway/verifier only where profiling shows CPU/latency bottleneck. | Measured improvement and identical conformance behavior. |
| Regional scale | Regional routing, partition strategy, replication, disaster-recovery exercise. | Defined RTO/RPO and failover evidence. |

## Capacity truth

Capacity is a function of request mix, policy complexity, evidence-write volume, network geography, adapter latency, key verification, tenant distribution, and consistency guarantees. A “one million requests per second” target must be expressed as a benchmark scenario with a cost model and independent test report. It must not be inferred from a single front-end/backend connection or compared directly to a social network’s total event volume.
