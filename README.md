# Sentra Authority OS

### An agent proposes an action. Sentra verifies its authority to execute.

[![CI](https://github.com/jahwanthpulugujju-create/sentra-authority-os/actions/workflows/ci.yml/badge.svg)](https://github.com/jahwanthpulugujju-create/sentra-authority-os/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479a1?logo=mysql&logoColor=white)

Sentra is an open-source reference implementation of runtime authority enforcement for software agents. It evaluates a canonical action request, binds an allowed action to an HMAC capability, verifies it at a gateway, and records the result in a persistent, hash-linked proof chain.

[Get started](#get-started) · [Architecture decisions](docs/architecture-decisions.md) · [API](docs/api.md) · [Contribute](CONTRIBUTING.md) · [Roadmap](docs/roadmap.md)

## Why explore Sentra?

- **Study an execution boundary:** deterministic policy separates a proposal from permission to perform a protected action.
- **Build an adapter prototype:** a gateway-issued permit mediates the reference vendor-approval tool.
- **Test refusal behavior:** request mutation, unauthorized tools, prompt injection, bursts, and replay have explicit outcomes.
- **Inspect execution evidence:** persisted events, policy/key metadata, proof verification, and JSON exports make decisions inspectable.

The implemented workflow is deliberately bounded: one database-backed vendor approval and six scenarios. The broader [platform specifications](docs/platform/README.md) document the direction for additional adapters and deployment controls.

## Request to proof

```mermaid
flowchart LR
  A[Agent proposal] --> B[Canonical request]
  B --> C[Deterministic policy]
  C -->|ALLOW| D[HMAC capability]
  D --> E[Gateway verification]
  E --> F[Protected adapter]
  F --> G[Hash-linked evidence]
  C -->|DENY / ESCALATE / FREEZE| G
```

Capabilities bind tenant, request hash, tool, resource, workflow, budget, nonce, idempotency, expiry, policy, and key lifecycle. Gateway verification and capability consumption precede protected execution. Mobile review resolves an escalation; it does not execute the original untrusted action.

## Get started

**Requirements:** Node.js 22.13 or later and the pnpm version declared in `package.json`. A MySQL-compatible database is needed to run persisted workflows; Docker is an optional local database path.

```sh
git clone https://github.com/jahwanthpulugujju-create/sentra-authority-os.git
cd sentra-authority-os
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Those checks run without a live database. To start the application with a local database:

```sh
docker compose up -d --wait database
```

Set configuration in PowerShell:

```powershell
$env:DATABASE_URL = "mysql://sentra:sentra_local_only@127.0.0.1:3306/sentra"
$env:JWT_SECRET = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
pnpm db:migrate
pnpm dev
```

Or in Bash:

```sh
export DATABASE_URL="mysql://sentra:sentra_local_only@127.0.0.1:3306/sentra"
export JWT_SECRET="$(node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))")"
pnpm db:migrate
pnpm dev
```

Open the URL printed by the server, normally **http://localhost:3000**. The Compose credentials are local demonstration values and the database port binds to loopback. Optional OAuth and managed-service integrations need separate configuration; see [Development](docs/development.md).

With the isolated application running, `./verify-demo.sh` checks API scenarios, idempotency, and proof export. This Bash script resets demonstration state. Never point it at live operational records.

## Repository map

- `client/` — authority dashboard, mobile review, and reliability utilities.
- `server/` — policy, capabilities, protected execution, proof exports, and API infrastructure.
- `shared/` — shared types and constants.
- `drizzle/` — schema and migration history.
- `api/` — Vercel entry point.
- `scripts/` — portable development and production startup.
- `docs/` — API, architecture, threat model, deployment, and platform design.
- `patches/` — locked dependency patches.

## Contribute

Fork the repository and follow [CONTRIBUTING.md](CONTRIBUTING.md). Useful contributions include adapter conformance tests, proof-export regressions, mobile accessibility fixes, and clearer independent deployment setup. Open a feature proposal before changing the authority contract.

The [roadmap](docs/roadmap.md) identifies next steps; it does not imply that future production controls are already implemented. If you find the project useful, a star helps other developers discover it.

## Security and scope

The authority API currently includes public demonstration procedures. Capabilities use shared-secret HMAC verification, not public-key signatures. The local hash-linked store cannot prevent a privileged database operator from rewriting and recomputing evidence. Production identity, tenant authorization, secret custody, process isolation, and independent audit anchoring require additional work.

Read the [threat model](docs/threat-model.md), [deployment guide](docs/deployment.md), and [security policy](SECURITY.md) before adapting the project to operational use.

## License

[MIT](LICENSE). Use, modify, and distribute the project under the license terms. Retain copyright and license notices; dependencies retain their own licenses.
