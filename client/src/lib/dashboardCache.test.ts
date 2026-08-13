import { describe, expect, it } from "vitest";
import { DASHBOARD_CACHE_KEY, readDashboardSnapshot, writeDashboardSnapshot } from "./dashboardCache";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("dashboardCache", () => {
  it("persists and restores the last loaded dashboard snapshot", () => {
    const storage = createMemoryStorage();
    const snapshot = { metrics: { totalEvents: 6 }, events: [{ eventId: "evt-1" }] };

    writeDashboardSnapshot(snapshot, storage);

    expect(storage.getItem(DASHBOARD_CACHE_KEY)).toContain("evt-1");
    expect(readDashboardSnapshot<typeof snapshot>(storage)).toEqual(snapshot);
  });

  it("ignores malformed cached data", () => {
    const storage = createMemoryStorage();
    storage.setItem(DASHBOARD_CACHE_KEY, "not-json");

    expect(readDashboardSnapshot(storage)).toBeUndefined();
  });
});
