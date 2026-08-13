export function isTransientNetworkError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return ["failed to fetch", "networkerror", "network request failed", "load failed"].some(fragment => message.includes(fragment));
}
