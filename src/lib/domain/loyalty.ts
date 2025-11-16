export type LoyaltyInput = {
  lifetimeSpendCents: number;
  visits: number;
};

export type LoyaltyResult = {
  tier: "classic" | "silver" | "gold";
  nextThresholdCents?: number;
  bonusMultiplier: number;
};

export function calculateLoyalty({ lifetimeSpendCents, visits }: LoyaltyInput): LoyaltyResult {
  const spend = Math.max(lifetimeSpendCents, 0);
  const repeated = visits > 3;

  if (spend >= 50000 || (spend >= 30000 && repeated)) {
    return { tier: "gold", nextThresholdCents: undefined, bonusMultiplier: 1.5 };
  }
  if (spend >= 20000 || (spend >= 15000 && repeated)) {
    return { tier: "silver", nextThresholdCents: 50000, bonusMultiplier: 1.2 };
  }
  return { tier: "classic", nextThresholdCents: 20000, bonusMultiplier: 1 };
}
