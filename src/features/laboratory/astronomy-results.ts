import { z } from 'zod';
import { assumptionSchema, orientations, savedCaseSchema } from './cases';

const angle = z.number().finite().min(0).lt(360);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const instant = z.string().datetime({ offset: true });
export const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
export const planetGlyphs: Record<string, string> = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇' };
const chartSchema = z.object({
  utc: instant, jd_ut: z.number().finite().min(2378496.5).lt(2597641.5), jd_tt: z.number().finite(), delta_t_seconds: z.number().finite(),
  observer: z.object({ latitude: z.number().finite().gt(-90).lt(90), longitude: z.number().finite().min(-180).max(180), altitude: z.number().finite().min(-500).max(10000) }),
  topocentric: z.boolean(), house_system: z.enum(['P', 'E', 'W', 'R']),
  points: z.array(z.object({ name: z.enum(planetNames), longitude: angle, latitude: z.number().finite().min(-90).max(90), distance_au: z.number().finite().positive(), speed_deg_day: z.number().finite(), returned_flags: z.number().int() })).length(10),
  ascendant: angle, descendant: angle, mc: angle, ic: angle, cusps: z.array(angle).length(12),
  settings: z.object({ binding: z.literal('pyswisseph'), binding_version: z.literal('2.10.3.2'), core_version: z.literal('2.10.03'), files: z.object({
    'sepl_18.se1': z.literal('9f057b316b1890a7f9340d0bf92db96edbab4939dbcc54762b62f6a70a059eb0'),
    'semo_18.se1': z.literal('1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7'),
  }), requested_flags: z.number().int(), zodiac: z.literal('tropical'), coordinates: z.literal('apparent ecliptic of date'), calendar: z.literal('Gregorian'), ut_policy: z.string(), delta_t: z.string(), calculated_at: instant }),
}).superRefine((chart, ctx) => {
  if (new Set(chart.points.map(p => p.name)).size !== 10) ctx.addIssue({ code: 'custom', message: 'Duplicate or missing planets.' });
  const flags = chart.topocentric ? 33026 : 258;
  if (chart.settings.requested_flags !== flags || chart.points.some(p => p.returned_flags !== flags)) ctx.addIssue({ code: 'custom', message: 'Unapproved ephemeris flags or fallback.' });
  if (Math.abs((chart.ascendant + 180) % 360 - chart.descendant) > 1e-7 || Math.abs((chart.mc + 180) % 360 - chart.ic) > 1e-7) ctx.addIssue({ code: 'custom', message: 'Inconsistent horizon axes.' });
  const jd = Date.parse(chart.utc) / 86400000 + 2440587.5;
  if (Math.abs(jd - chart.jd_ut) > 1e-7 || Math.abs(chart.jd_tt - chart.jd_ut - chart.delta_t_seconds / 86400) > 1e-7) ctx.addIssue({ code: 'custom', message: 'Inconsistent epochs or time scales.' });
});
const residual = z.number().finite().min(-180).lt(180);
const candidateSchema = z.object({ orientation: z.enum(orientations), utc: instant, r1: residual, r2: residual, rms: z.number().finite().min(0), natal: chartSchema, prenatal: chartSchema });
export const astronomyResultSchema = z.object({
  format: z.literal('hermes-astronomy'), version: z.literal(1), case_name: z.string().min(1).max(120), input_sha256: hash, input_record: savedCaseSchema,
  profile: z.enum(['astronomy-geocentric', 'experimental-topocentric']), historical_status: z.literal('unresolved'),
  assumption_index: z.number().int().min(0).max(19), assumption: assumptionSchema.refine(a => a.convention !== 'lmp', 'LMP is not a conception epoch.'),
  civil: z.object({ local: z.string(), timezone: z.string(), fold_policy: z.enum(['reject', 'earlier', 'later']), fold_applied: z.union([z.literal(0), z.literal(1), z.null()]), utc_offset_seconds: z.number().int(), timezone_file_sha256: hash, tzdb_version: z.string(), offset_transition_samples: z.array(instant) }),
  runtime: z.object({ python: z.string(), engine: z.literal('private-astronomy-1'), source_sha256: z.record(z.string(), hash) }),
  natal: chartSchema, prenatal: chartSchema, candidates: z.array(candidateSchema).max(500),
  search: z.object({ rule_id: z.literal('experimental-fixed-duration-reciprocal-rms-v1'), objective: z.string(), r1: z.string(), r2: z.string(),
    start_utc: instant, end_utc: instant, step_seconds: z.number().min(30).max(120), refinement_seconds: z.literal(0.5), deduplication_seconds: z.literal(1),
    orientations: z.array(z.enum(orientations)).length(4), assumption_index: z.number().int(), completeness: z.string(),
    traces: z.array(z.object({ orientation: z.enum(orientations), evaluations: z.array(z.object({ utc: instant, r1: residual, r2: residual, rms: z.number().finite().min(0) })).max(10000) })).length(4),
  }).optional(),
}).superRefine((result, ctx) => {
  const topo = result.profile === 'experimental-topocentric';
  if (result.case_name !== result.input_record.name || result.civil.timezone !== result.input_record.timezone) ctx.addIssue({ code: 'custom', message: 'Inconsistent case identity or timezone.' });
  if ([result.natal, result.prenatal, ...result.candidates.flatMap(c => [c.natal, c.prenatal])].some(c => c.topocentric !== topo || c.house_system !== result.natal.house_system)) ctx.addIssue({ code: 'custom', message: 'Mixed calculation settings.' });
  const duration = (result.assumption.days * 24 + result.assumption.hours) * 3600000;
  if (Math.abs(Date.parse(result.natal.utc) - Date.parse(result.prenatal.utc) - duration) > 1) ctx.addIssue({ code: 'custom', message: 'Inconsistent duration assumption.' });
  if (result.candidates.length && (!result.search || !topo)) ctx.addIssue({ code: 'custom', message: 'Candidates need an explicit experimental search trace.' });
  for (const c of result.candidates) {
    if (Math.abs(Math.hypot(c.r1, c.r2) / Math.sqrt(2) - c.rms) > 1e-7 || c.utc !== c.natal.utc || Math.abs(Date.parse(c.natal.utc) - Date.parse(c.prenatal.utc) - duration) > 1) ctx.addIssue({ code: 'custom', message: 'Inconsistent candidate residuals or epoch.' });
  }
});
export type AstronomyResult = z.infer<typeof astronomyResultSchema>;
export type CalculatedChart = z.infer<typeof chartSchema>;
export function parseAstronomyResult(text: string): AstronomyResult { return astronomyResultSchema.parse(JSON.parse(text)); }