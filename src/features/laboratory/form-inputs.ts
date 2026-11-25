// Civil time input is deliberately independent of the browser's segmented time control.
export function normalizeCivilTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s*(am|pm)?$/i);
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