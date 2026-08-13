# Sentra Managed Environment Note

This repository intentionally contains **no `.env` or `.env.example` file**. In this managed project, database, session, and platform integration values are injected by the runtime and must not be committed as example values or copied into source control.

For a separate local deployment, the operator must provision a non-production database connection and an HMAC/session secret through that environment’s secret manager. Those values are deployment-specific and are outside this repository’s release packet.

> Never place a real database URL, session secret, API key, or signing secret in a committed file, proof export, screenshot, or presentation.
