import { describe, expect, it } from "vitest";

import { redeemVoucher } from "../vouchers";

describe("redeemVoucher", () => {
  it("applies a percentage voucher respecting caps", () => {
    const now = new Date("2024-02-01T12:00:00Z");
    const result = redeemVoucher(20000, { code: "PERC20", type: "percent", value: 20, active: true }, now);

    expect(result.applied).toBe(true);
    expect(result.discountCents).toBe(4000);
    expect(result.totalAfterDiscount).toBe(16000);
  });

  it("rejects an expired voucher", () => {
    const now = new Date("2024-02-10T12:00:00Z");
    const result = redeemVoucher(15000, {
      code: "NEWYEAR",
      type: "amount",
      value: 3000,
      active: true,
      expiresAt: new Date("2024-02-01T00:00:00Z"),
    }, now);

    expect(result.applied).toBe(false);
    expect(result.reason).toBe("Voucher abgelaufen");
  });

  it("enforces minimum spend", () => {
    const result = redeemVoucher(5000, {
      code: "HIGHMIN",
      type: "amount",
      value: 2000,
      minSpendCents: 10000,
      active: true,
    });

    expect(result.applied).toBe(false);
    expect(result.reason).toBe("Mindestbestellwert nicht erreicht");
  });
});
