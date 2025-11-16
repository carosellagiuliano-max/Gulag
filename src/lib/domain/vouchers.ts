export type Voucher = {
  code: string;
  type: "amount" | "percent";
  value: number; // cents for amount, percent for percent
  minSpendCents?: number;
  expiresAt?: Date;
  remainingUses?: number;
  active?: boolean;
};

export type VoucherRedemption = {
  applied: boolean;
  discountCents: number;
  totalAfterDiscount: number;
  reason?: string;
};

export function redeemVoucher(totalCents: number, voucher: Voucher, now = new Date()): VoucherRedemption {
  if (!voucher.active && voucher.active !== undefined) {
    return { applied: false, discountCents: 0, totalAfterDiscount: totalCents, reason: "Voucher inaktiv" };
  }

  if (voucher.expiresAt && now > voucher.expiresAt) {
    return { applied: false, discountCents: 0, totalAfterDiscount: totalCents, reason: "Voucher abgelaufen" };
  }

  if (voucher.remainingUses !== undefined && voucher.remainingUses <= 0) {
    return { applied: false, discountCents: 0, totalAfterDiscount: totalCents, reason: "Keine Einlösungen mehr verfügbar" };
  }

  if (voucher.minSpendCents && totalCents < voucher.minSpendCents) {
    return { applied: false, discountCents: 0, totalAfterDiscount: totalCents, reason: "Mindestbestellwert nicht erreicht" };
  }

  const cappedPercent = voucher.type === "percent" ? Math.min(voucher.value, 100) : voucher.value;
  const rawDiscount = voucher.type === "percent" ? Math.floor((totalCents * cappedPercent) / 100) : cappedPercent;
  const discountCents = Math.min(rawDiscount, totalCents);

  return {
    applied: true,
    discountCents,
    totalAfterDiscount: totalCents - discountCents,
  };
}
