import { describe, expect, it } from "vitest";
import { clearDashboardSnapshot, DASHBOARD_CACHE_KEY, readDashboardSnapshot, writeDashboardSnapshot } from "./dashboardCache";

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
    expect(readDashboardSnapshot<typeof snapshot>(storage)).toEqual({ data: snapshot, savedAt: 1_786_641_830_000 });
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
});
