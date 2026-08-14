# Vercel Deployment Handoff

## Status and scope

This repository now includes a **Vercel serverless adapter** at `api/[...path].ts`, a shared Express application factory, and `vercel.json`. The configuration builds the Vite client into `dist/public` and routes `/api/*` through the Express/tRPC application. It is prepared for a user-owned Vercel import; it has **not** been published from this managed environment.

Vercel supports default-exported Express applications and requires static assets to be served from a `public/**` deployment output rather than `express.static()`. The adapter and output configuration reflect that model. [1] The `vercel.json` file uses supported project configuration fields for install, build, output, and function settings. [2]

## User-owned publication steps

| Step | In Vercel | Value or action |
| --- | --- | --- |
| 1 | **Add New → Project** | Import `jahwanthpulugujju-create/sentra-authority-os` from GitHub. |
| 2 | **Framework Preset** | Select **Other**. |
| 3 | **Build and Deployment** | Install command: `pnpm install --frozen-lockfile`; Build command: `pnpm build`; Output directory: `dist/public`. The committed `vercel.json` supplies the same values. |
| 4 | **Node.js version** | Select Node.js 22 to match the repository’s local runtime. |
| 5 | **Environment Variables** | Add the required values below separately for Production and Preview as appropriate. Never commit them. |
| 6 | **Deploy** | Use the Vercel dashboard to create the deployment, then run the smoke test below. |

## Required environment configuration

| Variable | Requirement | Reason |
| --- | --- | --- |
| `DATABASE_URL` | **Required** | The authority events, capabilities, protected state, proof chain, and metrics are database-backed. |
| `JWT_SECRET` | **Required** | Signs session state. Use a newly generated Vercel-specific value. |
| `VITE_APP_ID` | **Required if Manus OAuth remains enabled** | Client-side application identity used by the current OAuth flow. |
| `OAUTH_SERVER_URL` | **Required if Manus OAuth remains enabled** | Current server OAuth endpoint. |
| `VITE_OAUTH_PORTAL_URL` | **Required if Manus OAuth remains enabled** | Current browser OAuth portal endpoint. |
| `OWNER_OPEN_ID`, `OWNER_NAME` | Optional for the public demo; required only for owner-specific behavior. | Current managed-environment ownership metadata. |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` | **Do not copy blindly** | These are managed-environment services. Replace dependent storage/Forge paths with Vercel-compatible providers before relying on those paths in production. |

## Required manual compatibility checks

The current demo uses the managed OAuth and Forge environment. Before presenting a Vercel URL publicly, update the OAuth provider’s allowed callback/origin settings to the Vercel domain and test login, storage proxy paths, and the database connection. Keep the Vercel deployment protected until these checks pass.

Run the following after Vercel supplies its deployment URL:

```bash
SENTRA_BASE_URL="https://your-vercel-domain.vercel.app" ./verify-demo.sh
```

Also manually run **Valid Action**, **Changed Request**, **Replay Attempt**, proof export, proof copy, email draft, reset, and the ntfy outcome-only alert. The expected behavior remains one state change for the valid action and no protected state change for all refusal paths.

## Important architecture limitation

The Vercel adapter is appropriate for the bounded final-round demonstration. It is not evidence that the full managed-environment integration is production-ready on Vercel. In particular, an external production rollout needs user-owned OAuth, Vercel-compatible secret and storage providers, database network controls, deployment monitoring, and a full security review.

## References

[1]: https://vercel.com/docs/frameworks/backend/express "Vercel — Express on Vercel"

[2]: https://vercel.com/docs/project-configuration/vercel-json "Vercel — Static Configuration with vercel.json"
