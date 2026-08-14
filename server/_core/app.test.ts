import { describe, expect, it } from "vitest";
import { createSentraApp } from "./app";

describe("shared Sentra Express application", () => {
  it("creates a request handler for both the managed server and a serverless adapter", () => {
    const app = createSentraApp();
    expect(typeof app).toBe("function");
    expect(app._router).toBeDefined();
  });
});
