export function buildProofDownloadName(now = new Date()): string {
  return `sentra-local-proof-${now.toISOString().replace(/[:.]/g, "-")}.json`;
}

export function serializeProofPackage(proofPackage: unknown): string {
  return JSON.stringify(proofPackage, null, 2);
}
