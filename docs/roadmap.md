# Contribution roadmap

The current repository implements a bounded reference workflow. The [platform specifications](platform/README.md) describe the broader design. Proposals should state which implemented guarantee they extend and how the extension will be verified.

## Harden deployment boundaries

- Add deployment-owned identity and tenant authorization for authority procedures.
- Replace demonstration signing-key defaults with explicit production configuration and a managed key lifecycle.
- Test concurrent capability consumption and review resolution against a real database.
- Add independent audit anchoring beyond the local hash-linked event store.

## Extend the adapter model

- Define an adapter conformance suite for additional protected tools.
- Exercise the canonical request and idempotency contract with externally supplied requests.
- Add policy version rollout and failure-mode integration tests.

## Improve independent operation

- Decouple optional managed OAuth and Forge integrations from core authority workflows.
- Add reproducible database-backed integration verification to CI.
- Publish measured capacity and latency results with the workload and environment used.

Good first contributions include documentation corrections, mobile accessibility improvements, and focused proof-export regression cases. Production claims require measured evidence and deployment-specific review.
