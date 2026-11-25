import { useState } from 'react';
import { Columns2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading } from './shared';
import { ChartWheel } from './chart-wheel';
import { ChartSummary } from './chart-summary';
import { planetGlyphs } from './astronomy-results';
import type { DisplayChart } from './browser-astronomy';
import { orientations } from './cases';
import { angularSeparation, formatAngularGap, formatZodiac, houseForLongitude, minuteDifference } from './astrology-display';
import { ResultImport, useResults } from './results-provider';
import { BrowserCalculator } from './browser-calculator';
import { ReportDownload } from './report-download';

const wheelPoints = (chart: DisplayChart) => chart.points.map(p => ({ name: p.name, label: planetGlyphs[p.name] ?? p.name, longitude: p.longitude }));
export function CalculatedComparison() {
  const { result, selected, select } = useResults();
  const [mode, setMode] = useState('side');
  const [orientation, setOrientation] = useState<string>(orientations[0]);
  const candidate = selected === null ? undefined : result?.candidates[selected];
  const natal = candidate?.natal ?? result?.natal;
  const prenatal = candidate?.prenatal ?? result?.prenatal;
  const activeOrientation = candidate?.orientation ?? orientation;
  const [nAxis, pAxis] = activeOrientation.split(' / ');
  const natalHorizon = nAxis === 'DSC' ? natal?.descendant : natal?.ascendant;
  const prenatalHorizon = pAxis === 'DSC' ? prenatal?.descendant : prenatal?.ascendant;
  const natalMoon = natal?.points.find(p => p.name === 'Moon')?.longitude;
  const prenatalMoon = prenatal?.points.find(p => p.name === 'Moon')?.longitude;
  return <><PageHeading eyebrow="HERMES TRUTINE · CHART STUDY" title="Chart Comparison" description="Ascendant, Moon and planetary positions in zodiac signs." />
    <div className="calculation-notice"><p><strong>{candidate ? 'Experimental candidate — not a verified rectification.' : 'Selected time — not a rectified birth time.'}</strong> The prenatal epoch uses your duration assumption; no classical Trutine rule has been applied.</p></div>
    <BrowserCalculator /><ResultImport />
    <div className="filter-bar"><Button variant={mode === 'side' ? 'secondary' : 'outline'} onClick={() => setMode('side')}><Columns2 />Side by side</Button><Button variant={mode === 'overlay' ? 'secondary' : 'outline'} onClick={() => setMode('overlay')}><Layers />Overlay</Button><ReportDownload />{candidate && result && <><span className="local-status">{minuteDifference(candidate.utc, result.natal.utc) > 0 ? '+' : ''}{minuteDifference(candidate.utc, result.natal.utc).toFixed(2)} min from selected time</span><Button variant="outline" onClick={() => select(null)}>Return to selected time</Button></>}</div>
    {mode === 'side' ? <div className="comparison-blank">{([{ title: 'Natal chart', chart: natal, status: candidate ? 'Experimental candidate time' : 'Selected birth time' }, { title: 'Prenatal chart', chart: prenatal, status: 'Assumed prenatal epoch' }]).map(({ title, chart, status }) => <section className="comparison-pane" key={title}>
      <h2>{title}</h2>{chart && result && <ChartSummary chart={chart} timezone={result.civil.timezone} status={status} />}
      <ChartWheel title={chart ? title : `${title} — awaiting calculation`} {...(chart ? { points: wheelPoints(chart), ascendant: chart.ascendant, mc: chart.mc, cusps: chart.cusps } : {})} />{!chart && <p>No calculated data</p>}
    </section>)}</div> : <section className="comparison-pane"><h2>Natal / prenatal overlay</h2>{natal && result && <ChartSummary chart={natal} timezone={result.civil.timezone} status={candidate ? 'Experimental candidate time' : 'Selected birth time'} />}<ChartWheel title="Natal / prenatal overlay" {...(natal && prenatal ? { points: wheelPoints(natal), overlayPoints: wheelPoints(prenatal), ascendant: natal.ascendant, mc: natal.mc, cusps: natal.cusps } : {})} /><p>Natal <span className="text-foreground">●</span> · Prenatal <span className="text-success">●</span>{natal ? ' · Natal house frame' : ' · No calculated data'}</p></section>}
    {result && natal && prenatal && <>
      <section className="article-section"><h2>Reciprocal comparison</h2><div className="filter-bar"><label>Horizon pairing<select value={activeOrientation} disabled={Boolean(candidate)} onChange={e => setOrientation(e.target.value)}>{orientations.map(o => <option key={o}>{o}</option>)}</select></label></div>
        <div className="astronomy-table-wrap"><table className="astronomy-table"><thead><tr><th>Natal position</th><th>Prenatal position</th><th>Angular difference</th></tr></thead><tbody>
          <tr><td>{nAxis} · {formatZodiac(natalHorizon)}</td><td>Moon · {formatZodiac(prenatalMoon)}</td><td>{natalHorizon !== undefined && prenatalMoon !== undefined ? formatAngularGap(angularSeparation(natalHorizon, prenatalMoon)) : '—'}</td></tr>
          <tr><td>Moon · {formatZodiac(natalMoon)}</td><td>{pAxis} · {formatZodiac(prenatalHorizon)}</td><td>{natalMoon !== undefined && prenatalHorizon !== undefined ? formatAngularGap(angularSeparation(natalMoon, prenatalHorizon)) : '—'}</td></tr>
        </tbody></table></div><p className="mt-3">These are measured differences, not proof of the birth time or a biological conception date. Prenatal clock times use {result.civil.timezone}.</p>
      </section>
      <section className="article-section"><h2>Planetary positions</h2><div className="astronomy-table-wrap"><table className="astronomy-table"><thead><tr><th>Planet</th><th>Natal position</th><th>House</th><th>Prenatal position</th><th>House</th></tr></thead><tbody>
        {natal.points.map(p => { const prenatalPoint = prenatal.points.find(v => v.name === p.name); return <tr key={p.name}><th>{planetGlyphs[p.name]} {p.name}</th><td>{formatZodiac(p.longitude)}</td><td>{houseForLongitude(p.longitude, natal.cusps) ?? '—'}</td><td>{formatZodiac(prenatalPoint?.longitude)}</td><td>{prenatalPoint ? houseForLongitude(prenatalPoint.longitude, prenatal.cusps) ?? '—' : '—'}</td></tr>; })}
      </tbody></table></div><h3>Angles and house cusps</h3><p>{({ E: 'Equal', W: 'Whole sign', P: 'Placidus', R: 'Regiomontanus' })[natal.house_system]} houses · tropical zodiac. MC is calculated independently of the tenth-house cusp.</p><div className="astronomy-table-wrap"><table className="astronomy-table"><thead><tr><th>Angle / cusp</th><th>Natal</th><th>Prenatal</th></tr></thead><tbody>
        {(['ascendant', 'descendant', 'mc', 'ic'] as const).map(key => <tr key={key}><th>{({ ascendant: 'Ascendant (ASC)', descendant: 'Descendant (DSC)', mc: 'Midheaven (MC)', ic: 'Imum Coeli (IC)' })[key]}</th><td>{formatZodiac(natal[key])}</td><td>{formatZodiac(prenatal[key])}</td></tr>)}
        {natal.cusps.map((c,i) => <tr key={`house-${i}`}><th>House {i + 1}</th><td>{formatZodiac(c)}</td><td>{formatZodiac(prenatal.cusps[i])}</td></tr>)}
      </tbody></table></div></section>
      <details className="result-details"><summary>Calculation settings and technical record</summary><p>{result.input_record.city}, {result.input_record.country} · latitude {result.input_record.latitude} · longitude {result.input_record.longitude}. Your birth data stays on this device.</p><p>{result.profile === 'browser-geocentric' ? 'Astronomy Engine 2.1.19 · browser geocentric' : 'pyswisseph 2.10.3.2 · private offline astronomy'}. {result.assumption.approximate ? `Approximately ${result.assumption.days / 7} weeks · ` : ''}{result.assumption.days} days + {result.assumption.hours} hours · {result.assumption.convention}.</p><p>Natal UTC: {natal.utc} · JD UT {natal.jd_ut.toFixed(8)}<br />Prenatal UTC: {prenatal.utc} · JD UT {prenatal.jd_ut.toFixed(8)}</p><p>ΔT: {natal.delta_t_seconds.toFixed(6)} seconds. UTC is used as UT1 without DUT1 correction. Zodiac positions are rounded to the nearest arcminute; displayed clock resolution does not establish birth-time accuracy.</p>{candidate && <p>Experimental {candidate.orientation} · RMS {candidate.rms.toFixed(4)}° · residuals {candidate.r1.toFixed(4)}°, {candidate.r2.toFixed(4)}°.</p>}<p className="calculation-hash">{result.profile === 'browser-geocentric' ? 'Browser model-based positions; not equivalent to Swiss Ephemeris precision. Browser timezone data version is not exposed.' : `Input SHA-256: ${result.input_sha256}`}</p></details>
    </>}
  </>;
}
