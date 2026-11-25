import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAstronomyResult } from './astronomy-results';
import { browserChart, calculateBrowser, civilInstant, civilInterval, horizon, residual } from './browser-astronomy';
import { orientations, type CaseInput } from './cases';
import { durationFromInput } from './form-inputs';

export function browserCase(): CaseInput {
  const source = parseAstronomyResult(readFileSync('calculation-service/tests/references/private-j2000-pair.json', 'utf8')).input_record;
  return { ...source, birthDate: '2000-01-01', earliestTime: '12:00', latestTime: '12:10', timezone: 'Europe/London', latitude: 51.5, longitude: -0.12, houseSystem: 'E', conceptionDate: '', assumptions: [{ days: 273, hours: 6, convention: 'conception' }] };
}
describe('Browser astronomy: limited J2000 references, not historical validation', () => {
  const references = [['Sun', 280.3689092], ['Moon', 223.323786], ['Mercury', 271.8892699], ['Jupiter', 25.2530685], ['Saturn', 40.3956366], ['Neptune', 303.1930007]] as const;
  it.each(references)('compares %s with recorded JPL Horizons quantity 31 at J2000 within one arcminute', (name, expected) => {
    const chart = browserChart(Date.UTC(2000, 0, 1, 12), 51.5, -0.12, 'E');
    const point = chart.points.find(p => p.name === name);
    expect(point).toBeDefined();
    if (!point) throw new Error('Missing planet');
    expect(Math.abs(residual(point.longitude - expected))).toBeLessThan(1 / 60);
    expect(chart.jd_ut).toBe(2451545);
  });
  it('compares ASC and MC with native Swiss J2000 geometry, within 0.001 degree', () => {
    const axes = horizon(Date.UTC(2000, 0, 1, 12), 51.5, -0.12);
    expect(Math.abs(axes.ascendant - 24.0246647)).toBeLessThan(0.001);
    expect(Math.abs(axes.mc - 279.5004184)).toBeLessThan(0.001);
    expect(residual(axes.descendant - axes.ascendant)).toBe(-180);
  });
  it('uses explicit Equal and Whole sign geometry, never a silent Placidus substitute', () => {
    const equal = browserChart(Date.UTC(2000, 0, 1, 12), 51.5, -0.12, 'E');
    expect(equal.cusps[0]).toBe(equal.ascendant);
    expect(equal.cusps[1]).toBeCloseTo(equal.ascendant + 30, 8);
    expect(browserChart(Date.UTC(2000, 0, 1, 12), 51.5, -0.12, 'W').cusps[0]).toBe(0);
    expect(() => browserChart(Date.UTC(2000, 0, 1, 12), 51.5, -0.12, 'P')).toThrow(/Equal or Whole sign/);
  });
  it('rejects DST gaps for every ambiguity policy', () => {
    for (const policy of ['reject', 'earlier', 'later'] as const) expect(() => civilInstant('2024-03-31', '01:30', 'Europe/London', policy)).toThrow();
  });
  it('rejects unresolved folds and resolves earlier/later occurrences exactly one hour apart', () => {
    expect(() => civilInstant('2024-10-27', '01:30', 'Europe/London', 'reject')).toThrow();
    const early = civilInstant('2024-10-27', '01:30', 'Europe/London', 'earlier');
    const late = civilInstant('2024-10-27', '01:30', 'Europe/London', 'later');
    expect(late.milliseconds - early.milliseconds).toBe(3600000);
    expect(early.offset).toBe(3600); expect(late.offset).toBe(0);
  });
  it('keeps overnight end on the following date', () => {
    const span = civilInterval({ ...browserCase(), earliestTime: '23:50', latestTime: '00:10' });
    expect(span.end - span.start).toBe(20 * 60000);
    expect(new Date(span.end).toISOString()).toBe('2000-01-02T00:10:00.000Z');
  });
  it('uses the supplied duration, without inventing a universal conception epoch', async () => {
    const result = await calculateBrowser(browserCase(), '12:00', 0, false);
    expect(Date.parse(result.natal.utc) - Date.parse(result.prenatal.utc)).toBe((273 * 24 + 6) * 3600000);
    const alternative = await calculateBrowser({ ...browserCase(), assumptions: [{ days: 270, hours: 0, convention: 'custom' }] }, '12:00', 0, false);
    expect(Date.parse(alternative.natal.utc) - Date.parse(alternative.prenatal.utc)).toBe(270 * 86400000);
    expect(result.historical_status).toBe('unresolved');
    expect(result.profile).toBe('browser-geocentric');
  });
  it('calculates from entered clock formats and retains an approximate week assumption', async () => {
    const assumption = durationFromInput({ weeks: '38.5', unit: 'weeks', days: '', hours: '', convention: 'custom' });
    const result = await calculateBrowser({ ...browserCase(), earliestTime: '12:00 PM', latestTime: '12:10 PM', assumptions: [assumption] }, '12:00 PM', 0);
    expect(result.natal.utc).toBe('2000-01-01T12:00:00.000Z');
    expect(result.search?.end_utc).toBe('2000-01-01T12:10:00.000Z');
    expect(result.assumption.approximate).toBe(true);
    expect(Date.parse(result.natal.utc) - Date.parse(result.prenatal.utc)).toBe(269.5 * 86400000);
  });
  it('preserves four independent orientations and concrete RMS residuals', async () => {
    const result = await calculateBrowser(browserCase(), '12:00', 0);
    expect(result.search?.traces.map(t => t.orientation)).toEqual([...orientations]);
    expect(result.candidates.length).toBeGreaterThanOrEqual(4);
    for (const c of result.candidates) {
      const n = c.natal.points.find(p => p.name === 'Moon'), p = c.prenatal.points.find(p => p.name === 'Moon');
      if (!n || !p) throw new Error('Missing Moon');
      const [na, pa] = c.orientation.split(' / ');
      expect(c.r1).toBeCloseTo(residual(p.longitude - (na === 'ASC' ? c.natal.ascendant : c.natal.descendant)), 8);
      expect(c.r2).toBeCloseTo(residual(n.longitude - (pa === 'ASC' ? c.prenatal.ascendant : c.prenatal.descendant)), 8);
      expect(c.rms).toBeCloseTo(Math.hypot(c.r1, c.r2) / Math.sqrt(2), 8);
    }
    expect(result.search?.step_seconds).toBe(60);
    expect(result.search?.refinement_seconds).toBe(0);
  });
  it('refuses LMP and unresolved known-conception policies', async () => {
    await expect(calculateBrowser({ ...browserCase(), assumptions: [{ days: 280, hours: 0, convention: 'lmp' }] }, '12:00', 0)).rejects.toThrow(/LMP/);
    await expect(calculateBrowser({ ...browserCase(), conceptionDate: '1999-04-01' }, '12:00', 0)).rejects.toThrow(/known conception/i);
  });
  it('refuses out-of-interval birth selections and unsupported epochs or latitude', async () => {
    await expect(calculateBrowser(browserCase(), '11:59', 0)).rejects.toThrow(/inside/);
    expect(() => horizon(Date.UTC(1800, 0, 1), 51.5, 0)).toThrow(/1900/);
    expect(() => horizon(Date.UTC(2000, 0, 1), 66, 0)).toThrow(/latitude/);
  });
});