import { describe, expect, it } from "vitest";
import { isTransientNetworkError } from "./apiReliability";

describe("isTransientNetworkError", () => {
  it("recognizes browser transport failures that are safe to retry for queries", () => {
    expect(isTransientNetworkError(new Error("Failed to fetch"))).toBe(true);
    expect(isTransientNetworkError(new Error("NetworkError when attempting to fetch resource."))).toBe(true);
  });

  it("does not treat authorization or policy failures as transport failures", () => {
    expect(isTransientNetworkError(new Error("FORBIDDEN"))).toBe(false);
    expect(isTransientNetworkError({ message: "Failed to fetch" })).toBe(false);
  });
});
