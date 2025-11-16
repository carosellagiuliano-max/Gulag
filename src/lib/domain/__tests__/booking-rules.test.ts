import { describe, expect, it } from "vitest";

import { validateBookingRules } from "../booking-rules";

const openingHours = [
  { dayOfWeek: 1, opensAt: "09:00", closesAt: "18:00" },
  { dayOfWeek: 2, opensAt: "09:00", closesAt: "18:00" },
  { dayOfWeek: 3, opensAt: "09:00", closesAt: "18:00" },
];

describe("validateBookingRules", () => {
  it("accepts a valid slot within opening hours and horizon", () => {
    const now = new Date("2024-03-04T08:00:00Z");
    const requestedStart = new Date("2024-03-04T10:00:00Z");
    const result = validateBookingRules({
      requestedStart,
      durationMinutes: 45,
      openingHours,
      now,
      minLeadMinutes: 30,
      horizonDays: 7,
    });

    expect(result.ok).toBe(true);
    expect(result.reasons).toHaveLength(0);
    expect(result.projectedEnd?.toISOString()).toBe("2024-03-04T10:45:00.000Z");
  });

  it("rejects slots outside the booking horizon", () => {
    const now = new Date("2024-03-01T08:00:00Z");
    const requestedStart = new Date("2024-04-15T10:00:00Z");
    const result = validateBookingRules({
      requestedStart,
      durationMinutes: 30,
      openingHours,
      now,
      horizonDays: 7,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("Slot liegt ausserhalb des Buchungshorizonts");
  });

  it("rejects slots that exceed closing time", () => {
    const now = new Date("2024-03-04T08:00:00Z");
    const requestedStart = new Date("2024-03-04T17:45:00Z");
    const result = validateBookingRules({
      requestedStart,
      durationMinutes: 30,
      bufferMinutes: 10,
      openingHours,
      now,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("Service überschreitet die Schliesszeit");
  });
});
