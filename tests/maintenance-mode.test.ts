import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";

const {
  DEFAULT_MAINTENANCE_MESSAGE,
  isMaintenanceActive,
  normaliseMaintenanceConfig,
} = await import("../server/maintenance");

test("maintenance is inactive when disabled", () => {
  const config = normaliseMaintenanceConfig({
    enabled: false,
    message: "Planned work",
  });

  assert.equal(isMaintenanceActive(config, new Date("2026-09-04T12:00:00Z")), false);
});

test("maintenance follows its scheduled UTC window", () => {
  const config = normaliseMaintenanceConfig({
    enabled: true,
    message: "Planned work",
    scheduledStart: "2026-09-03T09:07:00Z",
    scheduledEnd: "2026-09-17T09:07:00Z",
  });

  assert.equal(isMaintenanceActive(config, new Date("2026-09-03T09:06:59Z")), false);
  assert.equal(isMaintenanceActive(config, new Date("2026-09-03T09:07:00Z")), true);
  assert.equal(isMaintenanceActive(config, new Date("2026-09-17T09:06:59Z")), true);
  assert.equal(isMaintenanceActive(config, new Date("2026-09-17T09:07:00Z")), false);
});

test("maintenance config normalises dates and supplies a safe message", () => {
  const config = normaliseMaintenanceConfig({
    enabled: true,
    message: "   ",
    scheduledStart: "not-a-date",
  });

  assert.equal(config.message, DEFAULT_MAINTENANCE_MESSAGE);
  assert.equal(config.scheduledStart, null);
  assert.equal(config.scheduledEnd, null);
});
