export type BookingOpeningHour = {
  dayOfWeek: number; // 1 = Monday ... 7 = Sunday
  opensAt: string;
  closesAt: string;
};

export type BookingRuleInput = {
  requestedStart: Date;
  durationMinutes: number;
  bufferMinutes?: number;
  openingHours: BookingOpeningHour[];
  horizonDays?: number;
  minLeadMinutes?: number;
  now?: Date;
};

export type BookingRuleResult = {
  ok: boolean;
  reasons: string[];
  projectedEnd?: Date;
};

function parseTime(base: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const copy = new Date(base);
  copy.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return copy;
}

export function validateBookingRules(input: BookingRuleInput): BookingRuleResult {
  const {
    requestedStart,
    durationMinutes,
    bufferMinutes = 0,
    openingHours,
    horizonDays = 30,
    minLeadMinutes = 60,
  } = input;

  const now = input.now ?? new Date();
  const reasons: string[] = [];

  if (requestedStart.getTime() < now.getTime() + minLeadMinutes * 60000) {
    reasons.push("Slot liegt zu nahe in der Zukunft");
  }

  const maxDate = new Date(now);
  maxDate.setDate(now.getDate() + horizonDays);
  if (requestedStart > maxDate) {
    reasons.push("Slot liegt ausserhalb des Buchungshorizonts");
  }

  const weekday = requestedStart.getDay() === 0 ? 7 : requestedStart.getDay();
  const opening = openingHours.find((entry) => entry.dayOfWeek === weekday);
  if (!opening || opening.opensAt === "geschlossen" || opening.closesAt === "geschlossen") {
    reasons.push("Kein Öffnungseintrag für diesen Tag");
    return { ok: false, reasons };
  }

  const openDate = parseTime(requestedStart, opening.opensAt);
  const closeDate = parseTime(requestedStart, opening.closesAt);
  const projectedEnd = new Date(requestedStart.getTime() + (durationMinutes + bufferMinutes) * 60000);

  if (requestedStart < openDate) {
    reasons.push("Slot liegt vor Öffnung");
  }
  if (projectedEnd > closeDate) {
    reasons.push("Service überschreitet die Schliesszeit");
  }

  return { ok: reasons.length === 0, reasons, projectedEnd };
}
