// This entrypoint is deliberately JavaScript: Vercel deploys it as the single
// `/api` function, while the build command creates the adjacent bundled
// application file from the shared TypeScript source.
import app from "./sentra-app.js";

export default app;
