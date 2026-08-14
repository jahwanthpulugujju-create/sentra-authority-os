export function buildProofDownloadName(now = new Date()): string {
  return `sentra-local-proof-${now.toISOString().replace(/[:.]/g, "-")}.json`;
}

export function serializeProofPackage(proofPackage: unknown): string {
  return JSON.stringify(proofPackage, null, 2);
}

type ClipboardWriter = Pick<Clipboard, "writeText">;

export async function copyTextToClipboard(text: string, clipboard?: ClipboardWriter | null): Promise<boolean> {
  const target = clipboard ?? (typeof navigator !== "undefined" ? navigator.clipboard : undefined);
  if (!target?.writeText) return false;
  try {
    await target.writeText(text);
    return true;
  } catch {
    return false;
  }
}

type ShareableProofPackage = {
  exportedAt?: string;
  scope?: string;
  verifier?: { valid?: boolean; checkedEvents?: number };
  eventsChronological?: unknown[];
};

export function buildProofEmailHref(proofPackage: unknown): string {
  const proof = proofPackage as ShareableProofPackage;
  const verified = proof.verifier?.valid ? "VERIFIED" : "NOT VERIFIED";
  const recordCount = proof.verifier?.checkedEvents ?? proof.eventsChronological?.length ?? 0;
  const subject = "Sentra local proof summary";
  const body = [
    "Sentra Authority OS — local proof summary",
    `Verifier status: ${verified}`,
    `Authority records checked: ${recordCount}`,
    `Generated: ${proof.exportedAt || "local session"}`,
    "",
    proof.scope || "Controlled software MVP; local persisted demonstration evidence, not an external audit or production attestation.",
    "",
    "The full JSON evidence package can be exported separately from the Sentra demo.",
  ].join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
