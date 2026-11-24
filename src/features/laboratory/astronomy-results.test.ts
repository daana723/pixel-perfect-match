import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAstronomyResult } from './astronomy-results';

function reference(): Record<string, any> {
  return JSON.parse(readFileSync('calculation-service/tests/references/private-j2000-pair.json', 'utf8'));
}
describe('Private astronomical result validation', () => {
  it('accepts an actual Swiss calculation and retains real longitudes', () => {
    const result = parseAstronomyResult(JSON.stringify(reference()));
    expect(result.natal.jd_ut).toBe(2451545);
    expect(result.natal.points.find(p => p.name === 'Sun')?.longitude).toBeCloseTo(280.36891852, 7);
    expect(result.prenatal.jd_ut).toBe(2451271.75);
  });
  it('rejects fallback flags instead of displaying substitute astronomy', () => {
    const data = reference(); data['natal'].points[0].returned_flags = 260;
    expect(() => parseAstronomyResult(JSON.stringify(data))).toThrow();
  });
  it('rejects a historically established claim in experimental files', () => {
    const data = reference(); data['historical_status'] = 'validated';
    expect(() => parseAstronomyResult(JSON.stringify(data))).toThrow();
  });
  it('rejects silently mixed geocentric and topocentric settings', () => {
    const data = reference(); data['profile'] = 'experimental-topocentric';
    expect(() => parseAstronomyResult(JSON.stringify(data))).toThrow();
  });
  it('rejects an LMP duration masquerading as conception', () => {
    const data = reference(); data['assumption'].convention = 'lmp';
    expect(() => parseAstronomyResult(JSON.stringify(data))).toThrow();
  });
  it('rejects inconsistent prenatal durations', () => {
    const data = reference(); data['assumption'].days = 270;
    expect(() => parseAstronomyResult(JSON.stringify(data))).toThrow();
  });
});