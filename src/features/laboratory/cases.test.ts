import { describe, expect, it } from 'vitest';
import { caseInputSchema, caseArchiveSchema, crossesMidnight, orientations, prenatalHours, validDate, validTimezone, csvCell } from './cases';
// Explicit fixture assumptions, not a universal duration or an astronomical reference chart.
const input = { name: 'Test inquiry', birthDate: '1990-06-15', earliestTime: '23:30', latestTime: '00:30', city: 'London', country: 'United Kingdom', latitude: 51.5, longitude: -0.12, altitude: 0, timezone: 'Europe/London', ambiguity: 'reject', uncertainty: '', assumptions: [{ days: 270, hours: 6, convention: 'custom' }], sameLocation: true, prenatalCity: 'London', prenatalLatitude: 51.5, prenatalLongitude: -0.12, prenatalAltitude: 0, conceptionDate: '', method: 'classical', houseSystem: 'P', notes: '', verification: 'unverified' };
describe('Research input rules', () => {
  it('requires an explicit historical timezone rather than assuming UTC', () => { expect(caseInputSchema.safeParse({ ...input, timezone: '' }).success).toBe(false); expect(validTimezone('Europe/London')).toBe(true); expect(validTimezone('Not/A_Zone')).toBe(false); });
  it('requires explicit prenatal assumptions with no universal duration', () => { expect(caseInputSchema.safeParse({ ...input, assumptions: [] }).success).toBe(false); expect(caseInputSchema.safeParse(input).success).toBe(true); });
  it('preserves all four exploratory axis combinations', () => { expect(orientations).toEqual(['ASC / ASC', 'ASC / DSC', 'DSC / ASC', 'DSC / DSC']); });
  it('recognizes midnight crossing while leaving civil times unchanged', () => { expect(crossesMidnight('23:30', '00:30')).toBe(true); expect(crossesMidnight('08:00', '10:00')).toBe(false); expect(caseInputSchema.parse(input).latestTime).toBe('00:30'); });
  it('rejects impossible leap dates', () => { expect(validDate('1900-02-29')).toBe(false); expect(validDate('2000-02-29')).toBe(true); });
  it('keeps duration hours independently representable', () => { expect(prenatalHours(270, 6)).toBe(6486); });
  it('rejects invalid observer coordinates', () => { expect(caseInputSchema.safeParse({ ...input, latitude: 91 }).success).toBe(false); expect(caseInputSchema.safeParse({ ...input, longitude: -181 }).success).toBe(false); });
  it('rejects unversioned foreign case archives', () => { expect(caseArchiveSchema.safeParse({ cases: [] }).success).toBe(false); expect(caseArchiveSchema.safeParse({ format: 'hermes-trutine', version: 1, cases: [] }).success).toBe(true); });
  it('neutralizes spreadsheet formulas in CSV exports', () => { expect(csvCell('=1+1')).toBe('"\'=1+1"'); expect(csvCell('Private "case"')).toBe('"Private ""case"""'); });
});
