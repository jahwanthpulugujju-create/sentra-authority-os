export function formatEvidenceScope(canonicalRequest: unknown) {
  const request = canonicalRequest && typeof canonicalRequest === "object" ? canonicalRequest as Record<string, unknown> : {};
  const action = typeof request.action === "string" && request.action ? request.action : "MOBILE_REVIEW";
  const resource = typeof request.resource === "string" && request.resource ? request.resource : "review evidence";
  const resourceLabel = resource.split("/").filter(Boolean).pop() || resource;
  return { action, resource, resourceLabel };
}
