import { hashReviewerCode, sha256 } from "./authority";

export type MobileReviewGateRecord = {
  tokenHash: string;
  reviewerCodeHash: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  expiresAt: Date;
};

export type MobileReviewGateResult =
  | { valid: true; reason: "VERIFIED" }
  | { valid: false; reason: "INVALID_LINK" | "REVIEWER_CODE_REJECTED" | "REVIEW_ALREADY_RESOLVED" | "REVIEW_EXPIRED" };

export function validateMobileReviewResolution(review: MobileReviewGateRecord, token: string, reviewerCode: string, now = Date.now()): MobileReviewGateResult {
  if (review.tokenHash !== sha256(token)) return { valid: false, reason: "INVALID_LINK" };
  if (review.reviewerCodeHash !== hashReviewerCode(reviewerCode)) return { valid: false, reason: "REVIEWER_CODE_REJECTED" };
  if (review.status !== "PENDING") return { valid: false, reason: "REVIEW_ALREADY_RESOLVED" };
  if (review.expiresAt.getTime() <= now) return { valid: false, reason: "REVIEW_EXPIRED" };
  return { valid: true, reason: "VERIFIED" };
}
