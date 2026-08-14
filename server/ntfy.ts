import { randomBytes } from "node:crypto";

const NTFY_SERVER = "https://ntfy.sh";
const DEMO_TOPIC = `sentra-demo-${randomBytes(10).toString("hex")}`;

export type NtfyDemoStatus = {
  server: string;
  topic: string;
  subscribeUrl: string;
  scope: string;
};

export function getNtfyDemoStatus(): NtfyDemoStatus {
  return {
    server: NTFY_SERVER,
    topic: DEMO_TOPIC,
    subscribeUrl: `${NTFY_SERVER}/${DEMO_TOPIC}`,
    scope: "Ephemeral public demo channel. It receives only a high-level authority outcome; canonical requests, proof JSON, hashes, identities, and limits remain in Sentra.",
  };
}

export async function publishNtfyDemoAlert(input: { outcome: string; reasonCode: string | null; eventId: string }): Promise<{ delivered: boolean; status: number; topic: string }> {
  const status = getNtfyDemoStatus();
  const response = await fetch(`${status.server}/${status.topic}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Title": `Sentra demo · ${input.outcome}`,
      "Priority": input.outcome === "ALLOW" ? "default" : "high",
      "Tags": input.outcome === "ALLOW" ? "white_check_mark,shield" : "warning,shield",
    },
    body: `Local Sentra authority event ${input.eventId} completed with ${input.outcome}${input.reasonCode ? ` (${input.reasonCode})` : ""}. Open the Sentra demo to inspect the local proof record.`,
  });
  return { delivered: response.ok, status: response.status, topic: status.topic };
}
