import { Temporal } from '@js-temporal/polyfill';
import { AstroTime, Body, Ecliptic, GeoVector, RotateVector, Rotation_EQD_ECT, SiderealTime, Vector } from 'astronomy-engine';
import { caseInputSchema, orientations, type CaseInput } from './cases';
import type { CalculatedChart } from './astronomy-results';
import { normalizeCivilTime } from './form-inputs';

export type DisplayChart = Pick<CalculatedChart, 'utc' | 'jd_ut' | 'jd_tt' | 'delta_t_seconds' | 'ascendant' | 'descendant' | 'mc' | 'ic' | 'cusps' | 'house_system'> & {
  points: { name: string; longitude: number }[];
};
type Evaluation = { utc: string; r1: number; r2: number; rms: number };
type Candidate = Evaluation & { orientation: typeof orientations[number]; natal: DisplayChart; prenatal: DisplayChart };
export type BrowserResult = {
  profile: 'browser-geocentric'; historical_status: 'unresolved'; case_name: string; input_record: CaseInput;
  assumption_index: number; assumption: CaseInput['assumptions'][number];
  civil: { timezone: string; utc_offset_seconds: number; fold_policy: CaseInput['ambiguity'] };
  natal: DisplayChart; prenatal: DisplayChart; candidates: Candidate[];
  search?: { rule_id: string; step_seconds: number; refinement_seconds: number; deduplication_seconds: number; completeness: string; start_utc: string; end_utc: string; traces: { orientation: typeof orientations[number]; evaluations: Evaluation[] }[] };
};
export const normalize = (a: number) => ((a % 360) + 360) % 360;
export const residual = (a: number) => normalize(a + 180) - 180;

export function civilInstant(date: string, time: string, timezone: string, policy: CaseInput['ambiguity']) {
  const plain = Temporal.PlainDateTime.from(`${date}T${time}`);
  const zoned = plain.toZonedDateTime(timezone, { disambiguation: policy === 'reject' ? 'reject' : policy });
  if (!zoned.toPlainDateTime().equals(plain)) throw new Error('This local time does not exist because the clock moved forward.');
  return { milliseconds: zoned.epochMilliseconds, offset: zoned.offsetNanoseconds / 1e9 };
}
export function civilInterval(record: CaseInput) {
  const endDate = record.latestTime < record.earliestTime ? Temporal.PlainDate.from(record.birthDate).add({ days: 1 }).toString() : record.birthDate;
  const start = civilInstant(record.birthDate, record.earliestTime, record.timezone, record.ambiguity).milliseconds;
  const end = civilInstant(endDate, record.latestTime, record.timezone, record.ambiguity).milliseconds;
  if (end < start) throw new Error('The resolved interval ends before it starts.');
  if (end - start > 25 * 3600000) throw new Error('Choose a birth interval of at most 25 hours.');
  return { start, end };
}
function checkEpoch(ms: number) {
  if (ms < Date.UTC(1900, 0, 1) || ms >= Date.UTC(2101, 0, 1)) throw new Error('The browser edition currently supports epochs from 1900 through 2100.');
}
export function horizon(ms: number, latitude: number, longitude: number) {
  checkEpoch(ms);
  if (Math.abs(latitude) >= 66) throw new Error('The browser horizon calculation is limited to latitudes between 66° south and 66° north.');
  const t = new AstroTime(new Date(ms));
  const pole = RotateVector(Rotation_EQD_ECT(t), new Vector(0, 0, 1, t));
  const epsilon = Math.acos(pole.z);
  const theta = normalize(SiderealTime(t) * 15 + longitude) * Math.PI / 180;
  const phi = latitude * Math.PI / 180;
  const ascendant = normalize(Math.atan2(-Math.cos(theta), Math.sin(theta) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon)) * 180 / Math.PI + 180);
  const mc = normalize(Math.atan2(Math.sin(theta), Math.cos(theta) * Math.cos(epsilon)) * 180 / Math.PI);
  return { ascendant, descendant: normalize(ascendant + 180), mc, ic: normalize(mc + 180) };
}
const bodies = [Body.Sun, Body.Moon, Body.Mercury, Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Pluto];
export function browserChart(ms: number, latitude: number, longitude: number, houses: CaseInput['houseSystem']): DisplayChart {
  if (houses !== 'E' && houses !== 'W') throw new Error('Select Equal or Whole sign houses for browser calculations. Placidus and Regiomontanus remain available in the original Python edition.');
  const axes = horizon(ms, latitude, longitude);
  const t = new AstroTime(new Date(ms));
  const first = houses === 'E' ? axes.ascendant : Math.floor(axes.ascendant / 30) * 30;
  return { utc: new Date(ms).toISOString(), jd_ut: t.ut + 2451545, jd_tt: t.tt + 2451545, delta_t_seconds: (t.tt - t.ut) * 86400,
    ...axes, house_system: houses, cusps: Array.from({ length: 12 }, (_, i) => normalize(first + i * 30)),
    points: bodies.map(body => ({ name: body, longitude: Ecliptic(GeoVector(body, t, true)).elon })) };
}
export async function calculateBrowser(input: CaseInput, localTime: string, assumptionIndex: number, search = true, progress?: (percentage: number) => void): Promise<BrowserResult> {
  const record = caseInputSchema.parse(input);
  localTime = normalizeCivilTime(localTime);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(localTime)) throw new Error('Enter a local birth time, e.g. 09:30 or 9:30 AM.');
  const assumption = record.assumptions[assumptionIndex];
  if (!assumption) throw new Error('Choose an existing duration assumption.');
  if (assumption.convention === 'lmp') throw new Error('LMP is not a conception epoch. Choose an explicit conception or custom duration.');
  if (record.conceptionDate) throw new Error('A known conception date needs an agreed time and precedence rule. Clear it to use an explicit duration.');
  const { start, end } = civilInterval(record);
  const selectedDate = record.latestTime < record.earliestTime && localTime <= record.latestTime ? Temporal.PlainDate.from(record.birthDate).add({ days: 1 }).toString() : record.birthDate;
  const instant = civilInstant(selectedDate, localTime, record.timezone, record.ambiguity);
  if (instant.milliseconds < start || instant.milliseconds > end) throw new Error('Choose a local time inside the saved birth interval.');
  const duration = (assumption.days * 24 + assumption.hours) * 3600000;
  const prenatalLat = record.sameLocation ? record.latitude : record.prenatalLatitude;
  const prenatalLon = record.sameLocation ? record.longitude : record.prenatalLongitude;
  const charts = (ms: number) => ({ natal: browserChart(ms, record.latitude, record.longitude, record.houseSystem), prenatal: browserChart(ms - duration, prenatalLat, prenatalLon, record.houseSystem) });
  const result: BrowserResult = { profile: 'browser-geocentric', historical_status: 'unresolved', case_name: record.name, input_record: record, assumption_index: assumptionIndex, assumption,
    civil: { timezone: record.timezone, utc_offset_seconds: instant.offset, fold_policy: record.ambiguity }, ...charts(instant.milliseconds), candidates: [] };
  if (!search) return result;
  const traces = orientations.map(orientation => ({ orientation, evaluations: [] as Evaluation[] }));
  const count = Math.ceil((end - start) / 60000);
  for (let i = 0; i <= count; i++) {
    const ms = Math.min(start + i * 60000, end);
    const n = horizon(ms, record.latitude, record.longitude), p = horizon(ms - duration, prenatalLat, prenatalLon);
    const moonN = Ecliptic(GeoVector(Body.Moon, new Date(ms), true)).elon;
    const moonP = Ecliptic(GeoVector(Body.Moon, new Date(ms - duration), true)).elon;
    for (const trace of traces) {
      const [nAxis, pAxis] = trace.orientation.split(' / ');
      const r1 = residual(moonP - (nAxis === 'ASC' ? n.ascendant : n.descendant));
      const r2 = residual(moonN - (pAxis === 'ASC' ? p.ascendant : p.descendant));
      trace.evaluations.push({ utc: new Date(ms).toISOString(), r1, r2, rms: Math.hypot(r1, r2) / Math.sqrt(2) });
    }
    if (i % 30 === 0) { progress?.(Math.round(i / Math.max(count, 1) * 100)); await new Promise(resolve => setTimeout(resolve, 0)); }
  }
  for (const trace of traces) {
    const minima = trace.evaluations.filter((e, i, all) => e.rms <= (all[i - 1]?.rms ?? Infinity) && e.rms <= (all[i + 1]?.rms ?? Infinity)).sort((a, b) => a.rms - b.rms).slice(0, 5);
    for (const minimum of minima) result.candidates.push({ ...minimum, orientation: trace.orientation, ...charts(Date.parse(minimum.utc)) });
  }
  result.candidates.sort((a, b) => a.rms - b.rms);
  result.search = { rule_id: 'browser-fixed-duration-reciprocal-rms-grid-v1', step_seconds: 60, refinement_seconds: 0, deduplication_seconds: 0,
    completeness: 'One-minute sampled minima, including interval endpoints; at most five per orientation. No refinement, exhaustive-root or historical-validation claim.', start_utc: new Date(start).toISOString(), end_utc: new Date(end).toISOString(), traces };
  progress?.(100);
  return result;
}