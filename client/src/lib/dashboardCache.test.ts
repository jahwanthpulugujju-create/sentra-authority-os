import { describe, expect, it } from "vitest";
import { clearDashboardSnapshot, dashboardCacheRetentionToMs, DASHBOARD_CACHE_KEY, DASHBOARD_CACHE_RETENTION_KEY, getDashboardCacheRetentionMinutes, loadDashboardSnapshot, readDashboardSnapshot, setDashboardCacheRetentionMinutes, writeDashboardSnapshot } from "./dashboardCache";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("dashboardCache", () => {
  it("persists and restores the last loaded dashboard snapshot", () => {
    const storage = createMemoryStorage();
    const snapshot = { metrics: { totalEvents: 6 }, events: [{ eventId: "evt-1" }] };

    writeDashboardSnapshot(snapshot, 1_786_641_830_000, storage);

    expect(storage.getItem(DASHBOARD_CACHE_KEY)).toContain("evt-1");
    expect(readDashboardSnapshot<typeof snapshot>(storage, 1_786_641_830_100)).toEqual({ data: snapshot, savedAt: 1_786_641_830_000 });
  });

  it("ignores malformed cached data", () => {
    const storage = createMemoryStorage();
    storage.setItem(DASHBOARD_CACHE_KEY, "not-json");

    expect(readDashboardSnapshot(storage)).toBeUndefined();
  });

  it("removes a saved snapshot when the user clears offline data", () => {
    const storage = createMemoryStorage();
    writeDashboardSnapshot({ events: [] }, 1_786_641_830_000, storage);

    clearDashboardSnapshot(storage);

    expect(storage.getItem(DASHBOARD_CACHE_KEY)).toBeNull();
    expect(readDashboardSnapshot(storage)).toBeUndefined();
  });

  it("expires a stale saved snapshot and removes it from storage", () => {
    const storage = createMemoryStorage();
    writeDashboardSnapshot({ events: [{ eventId: "expired" }] }, 1_000, storage);

    const loaded = loadDashboardSnapshot(storage, 1_901, 900);

    expect(loaded).toEqual({ expired: true });
    expect(storage.getItem(DASHBOARD_CACHE_KEY)).toBeNull();
  });

  it("persists only supported user-selected retention durations", () => {
    const storage = createMemoryStorage();

    expect(setDashboardCacheRetentionMinutes(60, storage)).toBe(60);
    expect(getDashboardCacheRetentionMinutes(storage)).toBe(60);
    expect(storage.getItem(DASHBOARD_CACHE_RETENTION_KEY)).toBe("60");
    expect(setDashboardCacheRetentionMinutes(7, storage)).toBe(15);
    expect(getDashboardCacheRetentionMinutes(storage)).toBe(15);
  });

  it("applies a newly reduced user retention window to an existing snapshot", () => {
    const storage = createMemoryStorage();
    writeDashboardSnapshot({ events: [{ eventId: "retention-case" }] }, 0, storage);

    setDashboardCacheRetentionMinutes(60, storage);
    expect(loadDashboardSnapshot(storage, 6 * 60 * 1_000, dashboardCacheRetentionToMs(getDashboardCacheRetentionMinutes(storage))).snapshot).toBeDefined();

    setDashboardCacheRetentionMinutes(5, storage);
    expect(loadDashboardSnapshot(storage, 6 * 60 * 1_000, dashboardCacheRetentionToMs(getDashboardCacheRetentionMinutes(storage)))).toEqual({ expired: true });
    expect(storage.getItem(DASHBOARD_CACHE_KEY)).toBeNull();
  });
});
