import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Crosshair, Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading } from './shared';
import { orientations } from './cases';
import { ResultImport, useResults } from './results-provider';

export function CalculatedCandidates() {
  const { result, selected, select } = useResults();
  const [orientation, setOrientation] = useState('all');
  const candidates = result?.candidates.map((c,index) => ({ ...c, index })).filter(c => orientation === 'all' || orientation === c.orientation) ?? [];
  return <><PageHeading eyebrow="EXPERIMENTAL FIT · NOT A CONFIDENCE SCORE" title="Candidate Explorer" description="Reciprocal angular residuals under an explicit fixed-duration assumption." />
    <div className="calculation-notice"><p><strong>Classical Trutine remains unresolved.</strong> Experimental RMS minima are neither simultaneous reciprocal roots nor evidence of the true birth time. No historical phase or duration rule is applied.</p></div>
    <ResultImport /><div className="filter-bar"><label>Orientation<select value={orientation} onChange={e => setOrientation(e.target.value)}><option value="all">All orientations</option>{orientations.map(o => <option key={o}>{o}</option>)}</select></label></div>
    {candidates.length ? <div className="astronomy-table-wrap"><table className="astronomy-table"><thead><tr><th>UTC</th><th>Orientation</th><th>Residual 1</th><th>Residual 2</th><th>RMS</th><th>Charts</th></tr></thead><tbody>{candidates.map(c => <tr key={c.index} data-selected={selected === c.index}><th>{c.utc}</th><td>{c.orientation}</td><td>{c.r1.toFixed(4)}°</td><td>{c.r2.toFixed(4)}°</td><td>{c.rms.toFixed(4)}°</td><td><Button asChild size="sm" variant="outline"><Link to="/comparison" onClick={() => select(c.index)}><Orbit />View</Link></Button></td></tr>)}</tbody></table></div> : <div className="empty-view"><span className="empty-icon"><Crosshair size={26} /></span><h2>No calculated candidates</h2><p>{result ? 'This calculation contains no experimental search results.' : 'No experimental search results are loaded.'}</p></div>}
    {result?.search && <section className="article-section"><h2>Search record</h2><p>{result.search.rule_id}. {result.search.step_seconds}-second coarse scan; {result.search.refinement_seconds}-second refinement; {result.search.deduplication_seconds}-second deduplication within each orientation only.</p><p>{result.search.completeness}. All four orientations are retained independently.</p><p>Residual 1 = prenatal Moon − natal selected horizon. Residual 2 = natal Moon − prenatal selected horizon. RMS = √((r1² + r2²) / 2), in degrees.</p><p>{result.search.start_utc} — {result.search.end_utc}</p><details className="mt-4"><summary className="cursor-pointer text-sm text-primary">Full evaluation trace</summary>{result.search.traces.map(trace => <div className="mt-4" key={trace.orientation}><h3>{trace.orientation}</h3><div className="astronomy-trace"><table className="astronomy-table"><thead><tr><th>UTC</th><th>Residual 1</th><th>Residual 2</th><th>RMS</th></tr></thead><tbody>{trace.evaluations.map((e,i) => <tr key={i}><td>{e.utc}</td><td>{e.r1.toFixed(6)}°</td><td>{e.r2.toFixed(6)}°</td><td>{e.rms.toFixed(6)}°</td></tr>)}</tbody></table></div></div>)}</details></section>}
  </>;
}