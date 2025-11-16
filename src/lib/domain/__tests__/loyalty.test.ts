import { describe, expect, it } from "vitest";

import { calculateLoyalty } from "../loyalty";

describe("calculateLoyalty", () => {
  it("defaults to classic tier", () => {
    const result = calculateLoyalty({ lifetimeSpendCents: 5000, visits: 1 });

    expect(result.tier).toBe("classic");
    expect(result.nextThresholdCents).toBe(20000);
    expect(result.bonusMultiplier).toBe(1);
  });

  it("upgrades to silver with repeated visits and mid spend", () => {
    const result = calculateLoyalty({ lifetimeSpendCents: 16000, visits: 5 });

    expect(result.tier).toBe("silver");
    expect(result.nextThresholdCents).toBe(50000);
    expect(result.bonusMultiplier).toBe(1.2);
  });

  it("awards gold for high spend", () => {
    const result = calculateLoyalty({ lifetimeSpendCents: 52000, visits: 2 });

    expect(result.tier).toBe("gold");
    expect(result.nextThresholdCents).toBeUndefined();
    expect(result.bonusMultiplier).toBe(1.5);
  });
});
