import { z } from 'zod';
import { normalizeCivilTime } from './form-inputs';

export const methodSchema = z.enum(['classical', 'modern', 'comparison']);
export const orientations = ['ASC / ASC', 'ASC / DSC', 'DSC / ASC', 'DSC / DSC'] as const;
export function validTimezone(value: string) {
  if (!value.trim()) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return true; } catch { return false; }
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}
const coordinate = (min: number, max: number) => z.number().finite().min(min).max(max);
export const assumptionSchema = z.object({
  days: z.number().finite().positive().max(500),
  hours: z.number().finite().min(0).lt(24),
  convention: z.enum(['conception', 'lmp', 'custom']),
  approximate: z.boolean().optional(),
});
const civilTimeSchema = (message: string) => z.string().transform(normalizeCivilTime).pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, message));
export const caseInputSchema = z.object({
  name: z.string().trim().min(1, 'A case name is required.').max(120),
  birthDate: z.string().refine(validDate, 'Enter a valid birth date.'),
  earliestTime: civilTimeSchema('Enter the earliest time, e.g. 09:30 or 9:30 AM.'),
  latestTime: civilTimeSchema('Enter the latest time, e.g. 17:30 or 5:30 PM.'),
  city: z.string().trim().min(1, 'Enter a birth city.').max(160),
  country: z.string().trim().min(1, 'Enter a country.').max(100),
  latitude: coordinate(-90, 90),
  longitude: coordinate(-180, 180),
  altitude: z.number().finite().min(-500).max(10000),
  timezone: z.string().refine(validTimezone, 'Enter a valid IANA timezone, e.g. Europe/London.'),
  ambiguity: z.enum(['reject', 'earlier', 'later']),
  uncertainty: z.string().max(500),
  assumptions: z.array(assumptionSchema).min(1, 'Add an explicit prenatal duration.').max(20),
  sameLocation: z.boolean(),
  prenatalCity: z.string().max(160),
  prenatalLatitude: coordinate(-90, 90),
  prenatalLongitude: coordinate(-180, 180),
  prenatalAltitude: z.number().finite().min(-500).max(10000),
  conceptionDate: z.string().refine(v => v === '' || validDate(v), 'Enter a valid conception date.'),
  method: methodSchema,
  houseSystem: z.enum(['P', 'E', 'W', 'R']),
  notes: z.string().max(20000),
  verification: z.enum(['unverified', 'documentary-evidence', 'independently-verified']),
});
export const savedCaseSchema = caseInputSchema.extend({ id: z.string(), createdAt: z.string().datetime(), updatedAt: z.string().datetime() });
export const caseArchiveSchema = z.object({ format: z.literal('hermes-trutine'), version: z.literal(1), cases: z.array(savedCaseSchema).max(1000) });
export type CaseInput = z.infer<typeof caseInputSchema>;
export type SavedCase = z.infer<typeof savedCaseSchema>;
export type Method = z.infer<typeof methodSchema>;
export const methodNames: Record<Method, string> = { classical: 'Classical Trutine', modern: 'Experimental research', comparison: 'Compare both engines' };
export function crossesMidnight(earliest: string, latest: string) { return Boolean(earliest && latest) && normalizeCivilTime(latest) < normalizeCivilTime(earliest); }
export function prenatalHours(days: number, hours: number) { return days * 24 + hours; }
export function archive(cases: SavedCase[]) { return { format: 'hermes-trutine', version: 1, cases }; }
export function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function casesCsv(cases: SavedCase[]) {
  const header = ['Case name', 'Birth date', 'Earliest local time', 'Latest local time', 'Timezone', 'City', 'Country', 'Latitude', 'Longitude', 'Method', 'Prenatal assumptions', 'Verification', 'Notes'];
  return [header.map(csvCell).join(','), ...cases.map(c => [c.name, c.birthDate, c.earliestTime, c.latestTime, c.timezone, c.city, c.country, c.latitude, c.longitude, c.method, JSON.stringify(c.assumptions), c.verification, c.notes].map(csvCell).join(','))].join('\r\n');
}
export function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
