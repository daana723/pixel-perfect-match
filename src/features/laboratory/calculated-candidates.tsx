import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Crosshair, Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading } from './shared';
import { orientations } from './cases';
import { ResultImport, useResults } from './results-provider';
import { BrowserCalculator } from './browser-calculator';
import { formatAngularGap, formatLocalEpoch, formatZodiac, minuteDifference } from './astrology-display';

export function CalculatedCandidates() {
  const { result, selected, select } = useResults();
  const [orientation, setOrientation] = useState('all');
  const candidates = result?.candidates.map((c,index) => ({ ...c, index })).filter(c => orientation === 'all' || orientation === c.orientation) ?? [];
  return <><PageHeading eyebrow="EXPERIMENTAL · NOT VERIFIED RECTIFICATION" title="Candidate Explorer" description="Local candidate times, Ascendant degrees and natal/prenatal differences." />
    <div className="calculation-notice"><p><strong>These are experimental candidates, not rectified birth times.</strong> They use your fixed duration assumption, not a classical Trutine duration rule. A smaller angular difference does not establish the true birth minute.</p></div>
    <BrowserCalculator /><ResultImport /><div className="filter-bar"><label>Orientation<select value={orientation} onChange={e => setOrientation(e.target.value)}><option value="all">All orientations</option>{orientations.map(o => <option key={o}>{o}</option>)}</select></label></div>
    {candidates.length && result ? <><p className="mb-4 text-sm text-muted-foreground">Local times: {result.civil.timezone} · changes measured from the selected birth time</p><div className="astronomy-table-wrap"><table className="astronomy-table"><thead><tr><th>Local candidate time</th><th>Change</th><th>Ascendant</th><th>Pairing</th><th>Prenatal Moon ↔ natal horizon</th><th>Natal Moon ↔ prenatal horizon</th><th>Charts</th></tr></thead><tbody>{candidates.map(c => { const change = minuteDifference(c.utc, result.natal.utc); return <tr key={c.index} data-selected={selected === c.index}><th>{formatLocalEpoch(c.utc, result.civil.timezone)}</th><td>{change > 0 ? '+' : ''}{change.toFixed(2)} min</td><td>{formatZodiac(c.natal.ascendant)}</td><td>{c.orientation}</td><td>{formatAngularGap(c.r1)}</td><td>{formatAngularGap(c.r2)}</td><td><Button asChild size="sm" variant="outline"><Link to="/comparison" onClick={() => select(c.index)}><Orbit />View</Link></Button></td></tr>; })}</tbody></table></div></> : <div className="empty-view"><span className="empty-icon"><Crosshair size={26} /></span><h2>No calculated candidates</h2><p>{result ? 'This calculation contains no experimental search results.' : 'No experimental search results are loaded.'}</p></div>}
    {result?.search && <details className="result-details"><summary>Technical search record and evaluation trace</summary><p>{result.search.rule_id}. {result.search.step_seconds}-second coarse scan; {result.search.refinement_seconds}-second refinement; {result.search.deduplication_seconds}-second deduplication within each orientation only.</p><p>{result.search.completeness}. All four orientations are retained independently.</p><p>Residual 1 = prenatal Moon − natal selected horizon. Residual 2 = natal Moon − prenatal selected horizon. RMS = √((r1² + r2²) / 2), in degrees.</p><p>{result.search.start_utc} — {result.search.end_utc}</p>{result.search.traces.map(trace => <div className="mt-4" key={trace.orientation}><h3>{trace.orientation}</h3><div className="astronomy-trace"><table className="astronomy-table"><thead><tr><th>UTC</th><th>Residual 1</th><th>Residual 2</th><th>RMS</th></tr></thead><tbody>{trace.evaluations.map((e,i) => <tr key={i}><td>{e.utc}</td><td>{e.r1.toFixed(6)}°</td><td>{e.r2.toFixed(6)}°</td><td>{e.rms.toFixed(6)}°</td></tr>)}</tbody></table></div></div>)}</details>}
  </>;
}
