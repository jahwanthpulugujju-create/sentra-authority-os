import { createSentraApp } from "./app";

// This module exists solely as the Vercel bundle entry. The exported app is
// constructed from the same factory as the managed runtime without listening
// on a port, which is required for a serverless function.
const app = createSentraApp();

export default app;
