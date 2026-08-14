import { describe, expect, it } from "vitest";
import { hashReviewerCode, sha256 } from "./authority";
import { validateMobileReviewResolution } from "./mobileReview";

describe("mobile review authorization gate", () => {
  const token = "review-link-token-123456";
  const reviewerCode = "A1B2C3D4";
  const future = new Date("2026-08-14T03:00:00.000Z");
  const pending = { tokenHash: sha256(token), reviewerCodeHash: hashReviewerCode(reviewerCode), status: "PENDING" as const, expiresAt: future };

  it("requires both the phone link token and separately held reviewer code", () => {
    expect(validateMobileReviewResolution(pending, token, reviewerCode, Date.parse("2026-08-14T02:00:00.000Z"))).toEqual({ valid: true, reason: "VERIFIED" });
    expect(validateMobileReviewResolution(pending, token, "00000000", Date.parse("2026-08-14T02:00:00.000Z"))).toEqual({ valid: false, reason: "REVIEWER_CODE_REJECTED" });
    expect(validateMobileReviewResolution(pending, "wrong-link-token", reviewerCode, Date.parse("2026-08-14T02:00:00.000Z"))).toEqual({ valid: false, reason: "INVALID_LINK" });
  });

  it("refuses a replayed or expired review before any decision is written", () => {
    expect(validateMobileReviewResolution({ ...pending, status: "DENIED" }, token, reviewerCode, Date.parse("2026-08-14T02:00:00.000Z"))).toEqual({ valid: false, reason: "REVIEW_ALREADY_RESOLVED" });
    expect(validateMobileReviewResolution({ ...pending, expiresAt: new Date("2026-08-14T01:00:00.000Z") }, token, reviewerCode, Date.parse("2026-08-14T02:00:00.000Z"))).toEqual({ valid: false, reason: "REVIEW_EXPIRED" });
  });
});
