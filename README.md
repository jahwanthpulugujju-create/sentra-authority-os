# Sentra Authority OS

Runtime authority enforcement for software agents. Sentra evaluates a proposed action, verifies its capability at the gateway, and records the execution outcome in a persistent proof chain.

## Core workflow

```text
Agent proposal → Canonical request → Deterministic policy
              → HMAC capability → Gateway verification
              → Protected action → Hash-linked evidence
```

The implemented reference workflow protects a database-backed vendor approval. Six scenarios exercise valid execution, unauthorized tools, prompt injection, request mutation, burst anomalies, and replay attempts. Policy returns `ALLOW`, `DENY`, `ESCALATE`, or `FREEZE`; only a verified allow path may change protected state.

## Engineering design

- A canonical request binds identity, tool, resource, purpose, workflow, budget, nonce, and idempotency context.
- HMAC capabilities bind execution authority to the exact request and active policy/key lifecycle.
- The protected adapter requires a gateway-issued permit.
- Database transactions persist capability consumption and protected execution state.
- Hash-linked events support proof verification and JSON evidence export.

The client uses React, TypeScript, and tRPC. An Express server implements authority enforcement, with Drizzle and MySQL-compatible persistence. A Vercel adapter is included.

## Repository structure

- `client/` — authority dashboard, mobile review, and shared interface components.
- `server/` — policy, capabilities, protected execution, proof exports, and API infrastructure.
- `shared/` — shared types, constants, and errors.
- `drizzle/` — schema and migration history.
- `api/` — Vercel entry point.
- `docs/` — engineering documentation and platform specifications.
- `patches/` — dependency patches applied by pnpm.

## Local development

Use Node.js 22 or later and the pnpm version declared in `package.json`. Follow [Development](docs/development.md) to configure the database and runtime, then run:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
pnpm dev
```

## Technical documentation

- [Architecture decisions](docs/architecture-decisions.md)
- [Authority API](docs/api.md)
- [Threat model](docs/threat-model.md)
- [Development and verification](docs/development.md)
- [Deployment and operations](docs/deployment.md)
- [Platform specifications](docs/platform/README.md)

## Implementation boundaries

Sentra is a controlled reference implementation with one protected adapter. Capabilities use a shared-secret HMAC, rather than public-key signatures. Hash-linked evidence is tamper-evident relative to recorded state; a privileged database operator could rewrite and recompute it. Production identity, secret custody, isolation, external audit anchoring, and multi-tenant deployment controls require further work. Platform specifications describe that future direction and are distinct from implemented guarantees.
