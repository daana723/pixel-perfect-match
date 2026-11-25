// Browser-safe presentation helpers shared by charts and local PDF reports.
export const zodiacSigns = [
  { name: 'Aries', glyph: '♈' }, { name: 'Taurus', glyph: '♉' },
  { name: 'Gemini', glyph: '♊' }, { name: 'Cancer', glyph: '♋' },
  { name: 'Leo', glyph: '♌' }, { name: 'Virgo', glyph: '♍' },
  { name: 'Libra', glyph: '♎' }, { name: 'Scorpio', glyph: '♏' },
  { name: 'Sagittarius', glyph: '♐' }, { name: 'Capricorn', glyph: '♑' },
  { name: 'Aquarius', glyph: '♒' }, { name: 'Pisces', glyph: '♓' },
] as const;
const wrap = (value: number) => ((value % 360) + 360) % 360;
export function zodiacPosition(longitude: number) {
  if (!Number.isFinite(longitude)) throw new Error('Invalid longitude');
  // Round the whole circle before splitting, carrying minutes into the next sign.
  const total = Math.round(wrap(longitude) * 60) % 21600;
  const signIndex = Math.floor(total / 1800);
  const sign = zodiacSigns[signIndex];
  if (!sign) throw new Error('Invalid zodiac sign');
  return { signIndex, sign: sign.name, glyph: sign.glyph, degrees: Math.floor((total % 1800) / 60), minutes: total % 60 };
}
export function formatZodiac(longitude: number | undefined, glyph = true) {
  if (longitude === undefined) return '—';
  const position = zodiacPosition(longitude);
  return `${position.degrees}° ${String(position.minutes).padStart(2, '0')}' ${glyph ? `${position.glyph} ` : ''}${position.sign}`;
}
export function houseForLongitude(longitude: number, cusps: number[]) {
  if (!Number.isFinite(longitude) || cusps.length !== 12 || cusps.some(c => !Number.isFinite(c))) return undefined;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i], end = cusps[(i + 1) % 12];
    if (start === undefined || end === undefined) return undefined;
    if (wrap(longitude - start) < wrap(end - start)) return i + 1;
  }
  return undefined;
}
export function localClock(utc: string, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(utc));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? '';
  return { date: `${value('year')}-${value('month')}-${value('day')}`, time: `${value('hour')}:${value('minute')}:${value('second')}` };
}
export function formatLocalEpoch(utc: string, timezone: string) {
  const clock = localClock(utc, timezone);
  return `${clock.date} · ${clock.time}`;
}
export function angularSeparation(first: number, second: number) {
  return Math.abs(wrap(first - second + 180) - 180);
}
export function formatAngularGap(degrees: number) {
  const total = Math.round(Math.abs(degrees) * 3600);
  return `${Math.floor(total / 3600)}° ${String(Math.floor(total / 60) % 60).padStart(2, '0')}' ${String(total % 60).padStart(2, '0')}"`;
}
export function minuteDifference(utc: string, reference: string) {
  return (Date.parse(utc) - Date.parse(reference)) / 60000;
}