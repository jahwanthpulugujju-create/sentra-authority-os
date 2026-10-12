# Development and verification

## Runtime and dependencies

Use Node.js 22.13 or later and the pnpm version declared in `package.json`. Install with `pnpm install --frozen-lockfile`. Keep `pnpm-lock.yaml` and dependency patches under version control.

## Configuration

Provide values through your shell or deployment secret manager. Local environment files are ignored and are not distributed with the repository.

- `DATABASE_URL` — MySQL-compatible connection URL for persisted authority state. TiDB Cloud connections enable certificate-verified TLS in the runtime database client.
- `JWT_SECRET` — session secret and current capability HMAC material. Supply a private, randomly generated value; the fallback signing value in the code is for local demonstration only.
- `PORT` — optional server port; defaults to 3000 and development can select another available port.
- `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` — required when using the existing managed OAuth integration.
- `OWNER_OPEN_ID` — optional owner-specific administration identity.
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` — managed service configuration for dependent storage and service integrations.
- `SENTRA_NTFY_TOPIC` — optional notification topic. Use a private deployment-specific topic when enabling notifications.

Only public configuration belongs in variables prefixed with `VITE_`; Vite embeds them in client assets.

For a local database, `docker compose up -d --wait database` starts a loopback-bound MySQL service. Set the `DATABASE_URL` shown in the README and run `pnpm db:migrate` to apply committed migrations. Use `docker compose stop` to stop the service while retaining its data.

Review `drizzle/schema.ts` and the committed migrations before applying schema changes. The existing `pnpm db:push` script generates and then applies migrations; inspect the generated changes before using it against a shared database. The API's persisted workflows require a configured database; unit tests can run without a live database.

## Validation

```sh
pnpm test
pnpm check
pnpm build
```

Tests exercise policy decisions, request binding, capability lifecycle, gateway enforcement, proof exports, database connection options, and client reliability utilities.

With the configured application running, use Bash to run `./verify-demo.sh`. This performs a real API check of the six scenarios and proof chain. It resets the demo baseline and changes demonstration state; use an isolated verification database.

The development and production scripts set `NODE_ENV` through a portable Node.js entry point and work in PowerShell or Bash. `pnpm dev` uses Node watch mode and the tsx loader. The API verification script still requires Bash and curl.
