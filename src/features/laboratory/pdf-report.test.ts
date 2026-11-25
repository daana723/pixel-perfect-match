import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { calculateBrowser } from './browser-astronomy';
import { parseAstronomyResult } from './astronomy-results';
import { createReport } from './pdf-report';

describe('Local research PDF', () => {
  it('generates an actual PDF from calculated chart data without a network request', async () => {
    const source = parseAstronomyResult(readFileSync('calculation-service/tests/references/private-j2000-pair.json', 'utf8')).input_record;
    const result = await calculateBrowser({ ...source, earliestTime: '12:00', latestTime: '12:10', houseSystem: 'E' }, '12:00', 0, false);
    const blob = createReport(result, null);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(5000);
    const text = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blob); });
    expect(text.slice(0, 5)).toBe('%PDF-');
  });
});