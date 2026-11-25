import { jsPDF } from 'jspdf';
import type { AstronomyResult } from './astronomy-results';
import type { BrowserResult, DisplayChart } from './browser-astronomy';

export type ReportResult = AstronomyResult | BrowserResult;
export function createReport(result: ReportResult, selected: number | null) {
  const pdf = new jsPDF();
  const candidate = selected === null ? undefined : result.candidates[selected];
  const natal = candidate?.natal ?? result.natal, prenatal = candidate?.prenatal ?? result.prenatal;
  let y = 22;
  // Built-in PDF fonts cannot display all Unicode. Preserve unsupported characters
  // visibly with escapes instead of silently dropping names or private notes.
  const safe = (s: string) => Array.from(s).map(c => { const code = c.codePointAt(0) ?? 0; return code > 255 ? `[U+${code.toString(16).toUpperCase()}]` : c; }).join('');
  const line = (text: string, size = 10) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(safe(text), 174) as string[];
    for (const row of lines) { if (y > 275) { pdf.addPage(); y = 22; } pdf.text(row, 18, y); y += size * .45 + 2; }
  };
  line('HERMES TRUTINE', 22); line('Birth Time Rectification - Research Report', 14); y += 5;
  line('A timeless method. A precise inquiry.', 11); y += 6;
  line(`Case: ${result.case_name}`, 14);
  line(`Birth record: ${result.input_record.birthDate}, ${result.input_record.earliestTime} - ${result.input_record.latestTime} local; ${result.civil.timezone}`);
  line(`Location: ${result.input_record.city}, ${result.input_record.country}; latitude ${result.input_record.latitude}, longitude ${result.input_record.longitude}`);
  line(`Duration assumption ${result.assumption_index + 1}: ${result.assumption.days} days + ${result.assumption.hours} hours (${result.assumption.convention}).`);
  line(`Engine: ${result.profile === 'browser-geocentric' ? 'Astronomy Engine 2.1.19 (MIT), browser geocentric' : 'pyswisseph 2.10.3.2, private offline calculation'}; tropical; house system ${natal.house_system}.`);
  line('Experimental research only. No source-approved classical Trutine equation is applied. Low RMS is mathematical fit, not proof of a true birth time.');
  if (candidate) line(`Selected sampled candidate: ${candidate.utc}; ${candidate.orientation}; r1 ${candidate.r1.toFixed(4)}, r2 ${candidate.r2.toFixed(4)}, RMS ${candidate.rms.toFixed(4)} degrees.`);
  function wheel(chart: DisplayChart, x: number, cy: number, title: string) {
    const r = 31;
    pdf.setFontSize(10); pdf.text(title, x, cy - 38, { align: 'center' }); pdf.circle(x, cy, r); pdf.circle(x, cy, r - 7);
    const point = (longitude: number, radius: number) => { const a = (longitude - chart.ascendant) * Math.PI / 180; return [x - radius * Math.cos(a), cy + radius * Math.sin(a)] as const; };
    chart.cusps.forEach((lon, i) => { const [px, py] = point(lon, r - 7); pdf.line(x, cy, px, py); const [tx, ty] = point(lon + 15, 17); pdf.setFontSize(6); pdf.text(String(i + 1), tx, ty); });
    chart.points.forEach((p, i) => { const [px, py] = point(p.longitude, r - 8 - i % 3 * 4); pdf.setFontSize(6); pdf.text(p.name.slice(0, 2), px, py); });
  }
  if (y > 175) { pdf.addPage(); y = 25; } y += 45;
  wheel(natal, 62, y, 'Natal chart'); wheel(prenatal, 148, y, 'Prenatal chart'); y += 45;
  line(`Natal UTC: ${natal.utc}; JD UT ${natal.jd_ut.toFixed(8)}.`); line(`Prenatal UTC: ${prenatal.utc}; JD UT ${prenatal.jd_ut.toFixed(8)}.`);
  line('Point                         Natal / Prenatal (degrees)', 12);
  for (const p of natal.points) line(`${p.name}: ${p.longitude.toFixed(6)} / ${prenatal.points.find(v => v.name === p.name)?.longitude.toFixed(6) ?? 'unavailable'}`);
  for (const key of ['ascendant', 'descendant', 'mc', 'ic'] as const) line(`${key.toUpperCase()}: ${natal[key].toFixed(6)} / ${prenatal[key].toFixed(6)}`);
  natal.cusps.forEach((c, i) => line(`House ${i + 1}: ${c.toFixed(6)} / ${prenatal.cusps[i]?.toFixed(6) ?? 'unavailable'}`));
  if (result.search) { line('Experimental scan', 14); line(result.search.completeness); for (const c of result.candidates) line(`${c.utc} | ${c.orientation} | RMS ${c.rms.toFixed(4)} degrees`); }
  line('Sources and limits', 14);
  line('Research starting points: Pseudo-Ptolemy, Centiloquium, Aphorism 51; Abraham Ibn Ezra, Sefer ha-Moladot II 5; Sepharial, The Solar Epoch. Exact passages and executable rules remain unresolved. No quotations or page numbers are claimed.');
  line('Browser positions are model-based astronomy, not equivalent to Swiss Ephemeris precision. UTC is used as UT1; timezone rules depend on the browser runtime. Digits shown do not establish accuracy.');
  if ('input_sha256' in result) line(`Original input SHA-256: ${result.input_sha256}`);
  line(`Recorded verification status: ${result.input_record.verification}. This is the astrologer's record, not application verification.`);
  if (result.input_record.notes) { line('Research notes', 14); line(result.input_record.notes); }
  for (let i = 1; i <= pdf.getNumberOfPages(); i++) { pdf.setPage(i); pdf.setFontSize(8); pdf.text(`Hermes Trutine | Research only | ${i} / ${pdf.getNumberOfPages()}`, 18, 289); }
  return pdf.output('blob');
}