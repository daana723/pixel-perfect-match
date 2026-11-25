// Civil time input is deliberately independent of the browser's segmented time control.
export function normalizeCivilTime(value: string) {
  const raw = value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\b([ap])\.?\s?m\.?$/, '$1m');
  let match = raw.match(/^(\d{1,2})\s?[:.,h]\s?([0-5]\d)(?:[:.]([0-5]\d))?\s?(am|pm)?$/);
  if (!match) { const m = raw.match(/^(\d{1,2})\s?(am|pm|h)?$/); if (m) match = [raw, m[1]!, '00', undefined, m[2] === 'h' ? undefined : m[2]] as unknown as RegExpMatchArray; }
  if (!match) { const m = raw.match(/^(\d{2})([0-5]\d)\s?(am|pm)?$/); if (m) match = [raw, m[1]!, m[2]!, undefined, m[3]] as unknown as RegExpMatchArray; }
  if (!match) return value.trim();
  let hour = Number(match[1]);
  const period = match[4]?.toLowerCase();
  if (period) {
    if (hour < 1 || hour > 12) return value.trim();
    hour = hour % 12 + (period === 'pm' ? 12 : 0);
  }
  if (hour > 23) return value.trim();
  const seconds = match[3] && match[3] !== '00' ? `:${match[3]}` : '';
  return `${String(hour).padStart(2, '0')}:${match[2]}${seconds}`;
}

export type DurationInput = {
  days: string; hours: string; weeks: string; unit: 'weeks' | 'days';
  convention: 'conception' | 'lmp' | 'custom';
};

export function durationFromInput(input: DurationInput) {
  const number = (value: string) => value.trim() === '' ? NaN : Number(value);
  if (input.unit === 'days') return { days: number(input.days), hours: number(input.hours), convention: input.convention };
  return { days: number(input.weeks) * 7, hours: 0, convention: input.convention, approximate: true };
}

/** Builds an earliest/latest window around one approximate time (minutes either side). */
export function windowAround(time: string, plusMinusMinutes: number) {
  const t = normalizeCivilTime(time);
  const m = t.match(/^(\d{2}):(\d{2})/);
  if (!m) return null;
  const centre = Number(m[1]) * 60 + Number(m[2]);
  const fmt = (x: number) => { const v = ((x % 1440) + 1440) % 1440; return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`; };
  return { earliest: fmt(centre - plusMinusMinutes), latest: fmt(centre + plusMinusMinutes) };
}
