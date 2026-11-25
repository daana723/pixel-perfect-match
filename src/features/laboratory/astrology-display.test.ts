import { describe, expect, it } from 'vitest';
import { angularSeparation, houseForLongitude, localClock, minuteDifference, zodiacPosition } from './astrology-display';

describe('Astrological coordinates and local civil time', () => {
  it('converts ecliptic longitude into zodiac sign, degrees and arcminutes', () => {
    expect(zodiacPosition(304.942396)).toMatchObject({ signIndex: 10, degrees: 4, minutes: 57 });
    expect(zodiacPosition(346.936525)).toMatchObject({ signIndex: 11, degrees: 16, minutes: 56 });
    expect(zodiacPosition(38.540446)).toMatchObject({ signIndex: 1, degrees: 8, minutes: 32 });
  });
  it('carries rounded arcminutes through sign and circle boundaries', () => {
    expect(zodiacPosition(29.999)).toMatchObject({ signIndex: 1, degrees: 0, minutes: 0 });
    expect(zodiacPosition(359.999)).toMatchObject({ signIndex: 0, degrees: 0, minutes: 0 });
    expect(zodiacPosition(-1)).toMatchObject({ signIndex: 11, degrees: 29, minutes: 0 });
  });
  it('places a planet at a cusp in the new house, including wraparound', () => {
    const cusps = Array.from({ length: 12 }, (_, i) => (350 + i * 30) % 360);
    expect(houseForLongitude(350, cusps)).toBe(1);
    expect(houseForLongitude(0, cusps)).toBe(1);
    expect(houseForLongitude(20, cusps)).toBe(2);
    expect(houseForLongitude(349.99, cusps)).toBe(12);
    expect(houseForLongitude(10, [])).toBeUndefined();
  });
  it('preserves the 06:33 civil clock minute using the specified historical zone', () => {
    expect(localClock('1973-04-29T04:33:00Z', 'Europe/Bucharest')).toEqual({ date: '1973-04-29', time: '06:33:00' });
    expect(localClock('2000-01-01T23:33:00Z', 'Europe/Bucharest')).toEqual({ date: '2000-01-02', time: '01:33:00' });
  });
  it('calculates angular mismatch around zero, independently of displayed rounding', () => {
    expect(angularSeparation(359.99, 0.01)).toBeCloseTo(0.02, 8);
    expect(angularSeparation(304.942396, 269.679485)).toBeCloseTo(35.262911, 8);
  });
  it('compares candidate times to the entered time without timezone arithmetic', () => {
    expect(minuteDifference('2000-01-01T06:33:00Z', '2000-01-01T06:00:00Z')).toBe(33);
  });
});