import { randomBytes } from "node:crypto";

const NTFY_SERVER = "https://ntfy.sh";
const DEMO_TOPIC = `sentra-demo-${randomBytes(10).toString("hex")}`;

export type NtfyDemoStatus = {
  server: string;
  topic: string;
  subscribeUrl: string;
  scope: string;
};

export function shouldNotifyPhoneForOutcome(outcome: string) {
  return outcome === "ESCALATE";
}

export function getNtfyDemoStatus(): NtfyDemoStatus {
  return {
    server: NTFY_SERVER,
    topic: DEMO_TOPIC,
    subscribeUrl: `${NTFY_SERVER}/${DEMO_TOPIC}`,
    scope: "Ephemeral public demo channel. It receives only a high-level authority outcome; canonical requests, proof JSON, hashes, identities, and limits remain in Sentra.",
  };
}

export async function publishNtfyDemoAlert(input: { outcome: string; reviewUrl?: string }): Promise<{ delivered: boolean; status: number; topic: string; skipped: boolean }> {
  const status = getNtfyDemoStatus();
  if (!shouldNotifyPhoneForOutcome(input.outcome)) {
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
