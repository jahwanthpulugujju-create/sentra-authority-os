# Responsible Optimization Policy

## Objective hierarchy

Sentra optimizes for safe and explainable adoption of AI-agent actions. It does not optimize for compulsive engagement, maximum allow rate, maximum block rate, maximum review speed, or raw event volume.

| Metric type | Examples | Use |
|---|---|---|
| Primary value | Safe action completion, evidence completeness, time-to-safe-deploy, successful integration. | Product and customer value. |
| Safety metrics | Duplicate-side-effect rate, unauthorized-execution rate, policy/evidence integrity, tenant isolation failures. | Hard release gates; tolerance near zero for critical failures. |
| Quality metrics | False escalation, false denial, review correctness, reviewer burden, explainability satisfaction. | Policy and workflow improvement. |
| Operational metrics | p95/p99 verification latency, adapter reconciliation time, backlog age, availability. | Capacity and reliability planning. |
| Anti-metrics | Session duration, notification clicks, approval speed in isolation, raw event volume. | Must not be used as sole optimization target. |

## Model and feature governance

Intelligence models are advisory. Each model version has an owner, intended use, input lineage, evaluation data boundary, deployment condition, rollback rule, and fairness/privacy assessment. A model recommendation that increases friction needs an explainable reason and a policy-approved mapping. A model recommendation can never silently grant authority.

## Stop conditions

Pause feature rollout if evidence integrity fails, tenant isolation is uncertain, review backlog exceeds agreed policy, a model shows unexplained cohort disparity, false escalation materially harms operations, or a gateway/adapter cannot reconcile unknown side effects.
