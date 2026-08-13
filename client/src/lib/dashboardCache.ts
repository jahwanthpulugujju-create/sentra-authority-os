export const DASHBOARD_CACHE_KEY = "sentra-dashboard-snapshot-v1";
export const DASHBOARD_CACHE_MAX_AGE_MS = 15 * 60 * 1_000;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type DashboardSnapshot<T> = { data: T; savedAt?: number };

export type DashboardSnapshotLoad<T> = { snapshot?: DashboardSnapshot<T>; expired: boolean };

export function isDashboardSnapshotExpired<T>(snapshot: DashboardSnapshot<T>, now = Date.now(), maxAgeMs = DASHBOARD_CACHE_MAX_AGE_MS) {
  return !snapshot.savedAt || now - snapshot.savedAt >= maxAgeMs;
}

export function loadDashboardSnapshot<T>(storage?: StorageLike | null, now = Date.now(), maxAgeMs = DASHBOARD_CACHE_MAX_AGE_MS): DashboardSnapshotLoad<T> {
  try {
    const raw = storage?.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return { expired: false };
    const parsed = JSON.parse(raw) as DashboardSnapshot<T> | T;
    const snapshot = typeof parsed === "object" && parsed !== null && "data" in parsed && "savedAt" in parsed
      ? parsed as DashboardSnapshot<T>
      : { data: parsed as T };
    if (isDashboardSnapshotExpired(snapshot, now, maxAgeMs)) {
      storage?.removeItem(DASHBOARD_CACHE_KEY);
      return { expired: true };
    }
    return { snapshot, expired: false };
  } catch {
    return { expired: false };
  }
}

export function readDashboardSnapshot<T>(storage?: StorageLike | null, now = Date.now(), maxAgeMs = DASHBOARD_CACHE_MAX_AGE_MS): DashboardSnapshot<T> | undefined {
  return loadDashboardSnapshot<T>(storage, now, maxAgeMs).snapshot;
}

export function writeDashboardSnapshot<T>(value: T, savedAt: number, storage?: StorageLike | null): DashboardSnapshot<T> {
  const snapshot = { data: value, savedAt };
  try {
    storage?.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // A full or unavailable browser storage must not interrupt the authority UI.
  }
  return snapshot;
}

export function clearDashboardSnapshot(storage?: StorageLike | null) {
  try {
    storage?.removeItem(DASHBOARD_CACHE_KEY);
  } catch {
    // A blocked browser storage must not interrupt the authority UI.
  }
}
