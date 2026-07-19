const durationPattern = /^(\d+)(m|h|d)$/i;
export function parseDuration(value: string): number | null {
  if (value.toLowerCase() === "off") return null;
  const match = durationPattern.exec(value); if (!match) throw new Error("Duration must use m, h, or d (for example: 30m, 1h, 2d), or off.");
  const multiplier = { m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]!.toLowerCase() as "m" | "h" | "d"];
  return Number(match[1]) * multiplier;
}
export function minutesBetween(start: string | null, now: Date): number { return start ? Math.max(0, (now.getTime() - new Date(start).getTime()) / 60_000) : 0; }
