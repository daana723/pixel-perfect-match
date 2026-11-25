import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { birthCityFields, decodeCities, prenatalCityFields, searchCities } from './cities';
import { validTimezone } from './cases';

const directory = decodeCities(JSON.parse(readFileSync('public/data/cities.json', 'utf8')));
describe('Private city lookup', () => {
  it('fills a selected city with its actual coordinates, country and IANA timezone', () => {
    const london = searchCities(directory, 'London UK')[0];
    if (!london) throw new Error('London is missing');
    expect(birthCityFields(london)).toEqual({ city: 'London', country: 'United Kingdom', latitude: '51.50853', longitude: '-0.12574', timezone: 'Europe/London' });
  });
  it('distinguishes same-name cities by country instead of silently selecting one', () => {
    const london = searchCities(directory, 'London Canada')[0];
    expect(london?.country).toBe('Canada');
    expect(london?.timezone).toBe('America/Toronto');
    expect(searchCities(directory, 'London').length).toBeGreaterThan(1);
  });
  it('supports accents and ASCII spelling', () => {
    const accented = searchCities(directory, 'São Paulo')[0];
    expect(accented?.id).toBe(3448439);
    expect(searchCities(directory, 'Sao Paulo')[0]?.id).toBe(accented?.id);
  });
  it('fills prenatal coordinates without replacing the birth timezone', () => {
    const paris = searchCities(directory, 'Paris France')[0];
    if (!paris) throw new Error('Paris is missing');
    expect(prenatalCityFields(paris)).toEqual({ prenatalCity: 'Paris, France', prenatalLatitude: '48.85341', prenatalLongitude: '2.3488' });
    expect(prenatalCityFields(paris)).not.toHaveProperty('timezone');
  });
  it('leaves unknown places and short queries unresolved', () => {
    expect(searchCities(directory, 'xyznotarealcity')).toEqual([]);
    expect(searchCities(directory, 'L')).toEqual([]);
  });
  it('validates all coordinates and timezones in the downloaded directory', () => {
    expect(directory.length).toBe(34246);
    expect(directory.filter(city => !validTimezone(city.timezone))).toEqual([]);
    expect(() => decodeCities([[1, 'Bad', 'Bad', 'GB', '', 91, 0, 'Europe/London', 1]])).toThrow();
  });
});