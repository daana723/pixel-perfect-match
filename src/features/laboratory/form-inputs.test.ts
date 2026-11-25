import { describe, expect, it } from 'vitest';
import { normalizeCivilTime, durationFromInput } from './form-inputs';
import { assumptionSchema } from './cases';

describe('Entered civil times and approximate prenatal duration', () => {
  it('keeps entered earliest/latest times usable in 12-hour and 24-hour formats', () => {
    expect(normalizeCivilTime('9:30 AM')).toBe('09:30');
    expect(normalizeCivilTime('5:30 pm')).toBe('17:30');
    expect(normalizeCivilTime(' 09:30:00 ')).toBe('09:30');
    expect(normalizeCivilTime('12:00 AM')).toBe('00:00');
    expect(normalizeCivilTime('12:00 PM')).toBe('12:00');
  });
  it('allows approximate weeks without requiring exact days or hours', () => {
    const duration = durationFromInput({ weeks: '38.5', unit: 'weeks', days: '', hours: '', convention: 'custom' });
    expect(assumptionSchema.parse(duration)).toEqual({ days: 269.5, hours: 0, convention: 'custom', approximate: true });
  });
  it('does not invent pregnancy length when no estimate is entered', () => {
    expect(assumptionSchema.safeParse(durationFromInput({ weeks: '', unit: 'weeks', days: '', hours: '0', convention: 'custom' })).success).toBe(false);
  });
  it('keeps an explicitly chosen LMP convention rather than silently converting to conception', () => {
    expect(durationFromInput({ weeks: '40', unit: 'weeks', days: '', hours: '0', convention: 'lmp' })).toEqual({ days: 280, hours: 0, convention: 'lmp', approximate: true });
  });
});