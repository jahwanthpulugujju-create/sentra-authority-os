const NTFY_SERVER = "https://ntfy.sh";
// This high-entropy topic is delivery-only: it carries no proof payload and cannot authorize a review.
// Keeping it stable lets the designated phone stay subscribed through normal dev-server restarts.
const DEMO_TOPIC = process.env.SENTRA_NTFY_TOPIC?.trim() || "sentra-demo-b3457500d095decaf168";

export type NtfyDemoStatus = {
  enabled: boolean;
  server: string;
  topic: string;
  subscribeUrl: string;
  scope: string;
};

export function shouldNotifyPhoneForOutcome(outcome: string) {
  return outcome === "ESCALATE";
}

export function getNtfyDemoStatus(): NtfyDemoStatus {
  const enabled = process.env.SENTRA_NOTIFICATIONS_ENABLED === "true" && Boolean(process.env.SENTRA_NTFY_TOPIC?.trim());
  return {
    enabled,
    server: NTFY_SERVER,
    topic: DEMO_TOPIC,
    subscribeUrl: `${NTFY_SERVER}/${DEMO_TOPIC}`,
    scope: `${enabled ? "Notification delivery enabled." : "Notification delivery disabled; configure an explicit topic and opt in to enable it."} This controlled-demo channel receives only a high-level authority outcome; canonical requests, proof JSON, hashes, identities, and limits remain in Sentra. The separate dashboard-held reviewer code is required for any phone resolution.`,
  };
}

export async function publishNtfyDemoAlert(input: { outcome: string; reviewUrl?: string }): Promise<{ delivered: boolean; status: number; topic: string; skipped: boolean }> {
  const status = getNtfyDemoStatus();
  if (!status.enabled || !shouldNotifyPhoneForOutcome(input.outcome)) {
    return { delivered: false, status: 0, topic: status.topic, skipped: true };
  }
  const response = await fetch(`${status.server}/${status.topic}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Title": "Sentra escalation · human review required",
      "Priority": "high",
      "Tags": "warning,shield",
      ...(input.reviewUrl ? { Click: input.reviewUrl } : {}),
    },
    body: "Sentra escalated an untrusted instruction for human review. Open the Sentra demo to inspect the local proof record.",
  });
  return { delivered: response.ok, status: response.status, topic: status.topic, skipped: false };
}
