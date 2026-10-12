# Deployment and operations

## Build outputs

`pnpm build` produces the Vite client in `dist/public/`, the Node server in `dist/index.js`, and the Vercel server bundle in `api/sentra-app.js`. Generated output is ignored by Git. `api/index.js` imports the generated Vercel bundle.

## Vercel configuration

`vercel.json` declares the install command, build command, static output directory, API function duration, and API rewrites. Import this repository using a Git integration that has access to it. Provide runtime secrets and public build configuration through the hosting provider.

Configure `DATABASE_URL` and `JWT_SECRET`. Supply OAuth variables when retaining the managed OAuth integration, and validate callback origins against the deployed domain. Managed Forge services require compatible credentials and provider access; they should be reviewed before migrating to a different host.

## Node hosting

Install the locked dependencies and build the repository. Run `pnpm start` with production runtime configuration. The Node entry point serves the compiled client and API together. Use a process supervisor and a trusted TLS reverse proxy for an external deployment.

## Release verification

1. Apply reviewed database migrations to the intended environment.
2. Confirm the dashboard API returns persisted state.
3. Exercise the valid action and each refusal scenario against isolated demonstration data.
4. Verify capability replay refusal and the exported proof chain.
5. Confirm login, mobile review, and notification integrations that the deployment enables.

With Bash, `SENTRA_BASE_URL="https://YOUR_HOST" ./verify-demo.sh` verifies the API scenarios. The script resets demonstration state; do not run it against live operational records.

## Operational boundaries

The demo includes public scenario procedures, a demonstration signing-key fallback, and fixed policy/key metadata. Restrict external access and review those controls before using the application for real authority decisions. HMAC capability verification and hash-linked evidence do not replace deployment identity controls, an independent security assessment, or external immutable audit storage.

Store private configuration in a secret manager. Environment-file ignore rules prevent new accidental commits but do not remove historical content. Rotate privileged credentials if they have been exposed.
