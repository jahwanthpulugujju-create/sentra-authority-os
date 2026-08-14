import { createSentraApp } from "../server/_core/app";

// Vercel routes every /api/* request to this Express handler. The function
// serves only API routes; the built Vite client is served from dist/public.
const app = createSentraApp();

export default app;
