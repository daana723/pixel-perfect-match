import { z } from 'zod';

const cityRow = z.tuple([z.number().int(), z.string(), z.string(), z.string(), z.string(), z.number().min(-90).max(90), z.number().min(-180).max(180), z.string(), z.number()]);
export type City = { id: number; name: string; country: string; region: string; latitude: number; longitude: number; timezone: string; population: number; search: string; names: string[] };
export function normalizeCity(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
export function decodeCities(data: unknown): City[] {
  const countries = new Intl.DisplayNames(['en'], { type: 'region' });
  return z.array(cityRow).parse(data).map(([id, name, ascii, code, region, latitude, longitude, timezone, population]) => {
    const country = countries.of(code) ?? code;
    return { id, name, country, region, latitude, longitude, timezone, population,
      names: [normalizeCity(name), normalizeCity(ascii)], search: normalizeCity(`${name} ${ascii} ${country} ${code} ${region}`) };
  });
}
export function searchCities(cities: City[], query: string, limit = 8): City[] {
  const normalized = normalizeCity(query);
  if (normalized.length < 2) return [];
  const aliases: Record<string, string> = { uk: 'gb', usa: 'us', uae: 'ae' };
  const words = normalized.split(' ').map(word => aliases[word] ?? word);
  const score = (city: City) => city.names.includes(normalized) ? 0 : city.names.some(name => name.startsWith(normalized)) ? 1 : 2;
  return cities.filter(city => words.every(word => city.search.includes(word)))
    .sort((a, b) => score(a) - score(b) || b.population - a.population).slice(0, limit);
}
let cached: Promise<City[]> | undefined;
export function loadCities() {
  cached ??= fetch('/data/cities.json').then(response => {
    if (!response.ok) throw new Error('The city directory could not be loaded. You can still enter the location manually.');
    return response.json();
  }).then(decodeCities).catch(error => { cached = undefined; throw error; });
  return cached;
}

export function birthCityFields(city: City) {
  return { city: city.name, country: city.country, latitude: String(city.latitude), longitude: String(city.longitude), timezone: city.timezone };
}
export function prenatalCityFields(city: City) {
  return { prenatalCity: `${city.name}, ${city.country}`, prenatalLatitude: String(city.latitude), prenatalLongitude: String(city.longitude) };
}