import { createSentraApp } from "../server/_core/app";

// Vercel's stable API index entrypoint receives all authority API paths via
// the rewrite in vercel.json. Keeping the application factory shared avoids a
// second server implementation or any divergence from managed runtime logic.
const app = createSentraApp();

export default app;
