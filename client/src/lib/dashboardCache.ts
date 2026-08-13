export const DASHBOARD_CACHE_KEY = "sentra-dashboard-snapshot-v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readDashboardSnapshot<T>(storage?: StorageLike | null): T | undefined {
  try {
    const raw = storage?.getItem(DASHBOARD_CACHE_KEY);
    return raw ? JSON.parse(raw) as T : undefined;
  } catch {
    return undefined;
  }
}

export function writeDashboardSnapshot<T>(value: T, storage?: StorageLike | null) {
  try {
    storage?.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(value));
  } catch {
    // A full or unavailable browser storage must not interrupt the authority UI.
  }
}
