export const DASHBOARD_CACHE_KEY = "sentra-dashboard-snapshot-v1";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type DashboardSnapshot<T> = { data: T; savedAt?: number };

export function readDashboardSnapshot<T>(storage?: StorageLike | null): DashboardSnapshot<T> | undefined {
  try {
    const raw = storage?.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as DashboardSnapshot<T> | T;
    if (typeof parsed === "object" && parsed !== null && "data" in parsed && "savedAt" in parsed) {
      return parsed as DashboardSnapshot<T>;
    }
    // Preserve any cache written by the earlier offline-view release.
    return { data: parsed as T };
  } catch {
    return undefined;
  }
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
