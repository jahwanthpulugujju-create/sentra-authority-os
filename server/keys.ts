export type KeyStatus = "ACTIVE" | "RETIRED" | "REVOKED";

type InternalKeyRecord = {
  keyId: string;
  version: string;
  status: KeyStatus;
  activatedAt: string;
  rotationDueAt: string;
  description: string;
  material?: string;
};

export type KeyLifecycleRecord = Omit<InternalKeyRecord, "material">;

const activeKeyMaterial = process.env.JWT_SECRET || "sentra-demo-signing-key";

const keyRegistry: readonly InternalKeyRecord[] = [
  {
    keyId: "sentra-hmac-k2026-08",
    version: "2026.08",
    status: "ACTIVE",
    activatedAt: "2026-08-13T00:00:00.000Z",
    rotationDueAt: "2026-11-13T00:00:00.000Z",
    description: "Current demo HMAC signing key. It is a shared-secret MAC verifier, not a public-key signature.",
    material: activeKeyMaterial,
  },
  {
    keyId: "sentra-hmac-k2026-07",
    version: "2026.07",
    status: "RETIRED",
    activatedAt: "2026-07-01T00:00:00.000Z",
    rotationDueAt: "2026-08-13T00:00:00.000Z",
    description: "Retired pre-demo key retained only as lifecycle metadata; it cannot verify or issue new authority.",
  },
  {
    keyId: "sentra-hmac-revoked-demo",
    version: "fault-injection",
    status: "REVOKED",
    activatedAt: "2026-08-13T00:00:00.000Z",
    rotationDueAt: "2026-08-13T00:00:00.000Z",
    description: "Demo-safe fault-injection key identifier. Any capability carrying it is rejected before a tool call.",
  },
];

export function getActiveSigningKey(): InternalKeyRecord {
  const active = keyRegistry.find(key => key.status === "ACTIVE" && key.material);
  if (!active) throw new Error("No active Sentra HMAC signing key is available.");
  return active;
}

export function getKeyRecord(keyId: string): InternalKeyRecord | undefined {
  return keyRegistry.find(key => key.keyId === keyId);
}

export function getKeyAvailabilityReason(keyId: string): "KEY_AVAILABLE" | "UNKNOWN_KEY" | "KEY_RETIRED" | "KEY_REVOKED" {
  const key = getKeyRecord(keyId);
  if (!key) return "UNKNOWN_KEY";
  if (key.status === "RETIRED") return "KEY_RETIRED";
  if (key.status === "REVOKED") return "KEY_REVOKED";
  return "KEY_AVAILABLE";
}

export function getHmacMaterialForActiveKey(keyId: string): string {
  const key = getKeyRecord(keyId);
  if (!key || key.status !== "ACTIVE" || !key.material) throw new Error(`Sentra cannot sign with unavailable key ${keyId}.`);
  return key.material;
}

export function listKeyHistory(): KeyLifecycleRecord[] {
  return keyRegistry.map(({ material: _material, ...key }) => ({ ...key }));
}
