import { useState } from 'react';
import { Columns2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading } from './shared';
import { ChartWheel } from './chart-wheel';
import { planetGlyphs } from './astronomy-results';
import type { DisplayChart } from './browser-astronomy';
import { ResultImport, useResults } from './results-provider';
import { BrowserCalculator } from './browser-calculator';
import { ReportDownload } from './report-download';

const wheelPoints = (chart: DisplayChart) => chart.points.map(p => ({ name: p.name, label: planetGlyphs[p.name] ?? p.name, longitude: p.longitude }));
export function CalculatedComparison() {
  const { result, selected } = useResults();
  const [mode, setMode] = useState('side');
  const candidate = selected === null ? undefined : result?.candidates[selected];
  const natal = candidate?.natal ?? result?.natal;
  const prenatal = candidate?.prenatal ?? result?.prenatal;
  return <><PageHeading eyebrow="REAL ASTRONOMY · HISTORICAL RULES UNRESOLVED" title="Chart Comparison" description="Natal and prenatal planetary positions, horizon axes, and houses." />
    <div className="calculation-notice"><p><strong>Your birth data stays on this device.</strong> {result ? `${result.profile === 'browser-geocentric' ? 'Browser geocentric · Astronomy Engine 2.1.19' : `${result.profile === 'experimental-topocentric' ? 'Experimental topocentric' : 'Geocentric astronomy'} · pyswisseph 2.10.3.2`} · tropical · ${result.natal.house_system} houses. No classical Trutine rule has been applied.` : 'No calculated positions are loaded.'}</p></div>
    <BrowserCalculator />
    <ResultImport />
    <div className="filter-bar"><Button variant={mode === 'side' ? 'secondary' : 'outline'} onClick={() => setMode('side')}><Columns2 />Side by side</Button><Button variant={mode === 'overlay' ? 'secondary' : 'outline'} onClick={() => setMode('overlay')}><Layers />Overlay</Button><ReportDownload />{candidate && <span className="local-status">{candidate.orientation} · RMS {candidate.rms.toFixed(4)}°</span>}</div>
    {mode === 'side' ? <div className="comparison-blank">{[['Natal chart', natal], ['Prenatal chart', prenatal]].map(([label, value]) => {
      const chart = typeof value === 'object' ? value : undefined; const title = String(label);
      return <section className="comparison-pane" key={title}><h2>{title}</h2><ChartWheel title={chart ? title : `${title} — awaiting calculation`} {...(chart ? { points: wheelPoints(chart), ascendant: chart.ascendant, mc: chart.mc, cusps: chart.cusps } : {})} />{chart ? <p className="chart-epoch">{chart.utc}<br />JD UT {chart.jd_ut.toFixed(8)}</p> : <p>No calculated data</p>}</section>;
    })}</div> : <section className="comparison-pane"><h2>Natal / prenatal overlay</h2><ChartWheel title="Natal / prenatal overlay" {...(natal && prenatal ? { points: wheelPoints(natal), overlayPoints: wheelPoints(prenatal), ascendant: natal.ascendant, mc: natal.mc, cusps: natal.cusps } : {})} /><p>Natal <span className="text-foreground">●</span> · Prenatal <span className="text-success">●</span>{natal ? ' · Natal house frame' : ' · No calculated data'}</p></section>}
    {result && natal && prenatal && <section className="article-section"><h2>Exact longitudes</h2><div className="astronomy-table-wrap"><table className="astronomy-table"><thead><tr><th>Point</th><th>Natal</th><th>Prenatal</th></tr></thead><tbody>
      {natal.points.map(p => <tr key={p.name}><th>{planetGlyphs[p.name]} {p.name}</th><td>{p.longitude.toFixed(6)}°</td><td>{prenatal.points.find(v => v.name === p.name)?.longitude.toFixed(6)}°</td></tr>)}
      {(['ascendant', 'descendant', 'mc', 'ic'] as const).map(key => <tr key={key}><th>{key.toUpperCase()}</th><td>{natal[key].toFixed(6)}°</td><td>{prenatal[key].toFixed(6)}°</td></tr>)}
      {natal.cusps.map((c,i) => <tr key={`house-${i}`}><th>House {i + 1}</th><td>{c.toFixed(6)}°</td><td>{prenatal.cusps[i]?.toFixed(6)}°</td></tr>)}
    </tbody></table></div><h3>Calculation record</h3><p>{result.assumption.days} days + {result.assumption.hours} hours · {result.assumption.convention} · {result.civil.timezone} · offset {result.civil.utc_offset_seconds} seconds · fold {result.civil.fold_policy}.</p><p>ΔT: {natal.delta_t_seconds.toFixed(6)} seconds. UTC is used as UT1 without DUT1 correction. Digits shown are not a claim of birth-time accuracy.</p><p className="calculation-hash">{result.profile === 'browser-geocentric' ? 'Browser model-based positions; not equivalent to Swiss Ephemeris precision. Browser timezone data version is not exposed.' : `Input SHA-256: ${result.input_sha256}`}</p></section>}
  </>;
}