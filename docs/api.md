# Authority API

The Express application mounts the tRPC router at `/api/trpc`. The router in `server/routers.ts` is the source of truth for procedure names and Zod input schemas. The React client consumes its inferred TypeScript types through `client/src/lib/trpc.ts`.

## Queries

- `authority.dashboard` returns the protected resource, metrics, proof integrity, policy history, key metadata, and recent events. It also expires stale capabilities.
- `authority.proofExport` returns the local proof package with chronological evidence and verification status.
- `authority.ntfyStatus` reports the notification integration status.
- `authority.mobileReview` accepts an event ID and review token, validates the link, and returns review status and expiry.
- `auth.me` returns the current authenticated user from the request context.

## Mutations

- `authority.runScenario` accepts one of the six scenario labels and an optional idempotency key. It evaluates policy, verifies authority, and persists the result.
- `authority.refreshContext` updates the reference resource's context score.
- `authority.resetDemo` resets the demonstration baseline. Restrict its use to isolated demonstration data.
- `authority.resolveMobileReview` accepts an event ID, review token, reviewer code, and an `APPROVED` or `DENIED` decision. It closes the review and records evidence; the original untrusted action remains blocked. A later execution requires a fresh trusted request.
- `auth.logout` clears the session cookie.

## Access boundary

The current authority procedures use `publicProcedure`. Review tokens and reviewer codes protect the mobile-review path, but they do not establish production-wide tenant authorization. Deployment identity and access controls must be designed before exposing these procedures to operational users.

## Verification

`verify-demo.sh` demonstrates the HTTP request format, idempotency behavior, six scenario outcomes, and proof-export assertions. It mutates and resets demonstration state. Run it only against a configured, isolated environment.
