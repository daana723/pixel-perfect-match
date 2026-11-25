import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Calculator, CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCases } from './case-provider';
import { useResults } from './results-provider';

export function BrowserCalculator() {
  const { cases, ready } = useCases();
  const { setBrowserResult } = useResults();
  const [id, setId] = useState('');
  const [time, setTime] = useState('');
  const [assumption, setAssumption] = useState(0);
  const [search, setSearch] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const record = cases.find(c => c.id === id);
  useEffect(() => { if (!id && cases[0]) { setId(cases[0].id); setTime(cases[0].earliestTime); } }, [cases, id]);
  async function calculate() {
    if (!record) return;
    setBusy(true); setError(''); setProgress(0);
    try { const { calculateBrowser } = await import('./browser-astronomy'); setBrowserResult(await calculateBrowser(record, time, assumption, search, setProgress)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Calculation could not be completed.'); }
    finally { setBusy(false); }
  }
  return <section className="article-section"><h2>Calculate a birth record</h2><p>Experimental geocentric astronomy · Equal or Whole sign houses · explicit prenatal duration. Classical Trutine rules remain unresolved.</p>
    {cases.length ? <><div className="field-grid mt-5">
      <label className="field"><span>Saved case</span><select disabled={busy} value={id} onChange={e => { const c = cases.find(v => v.id === e.target.value); setId(e.target.value); setTime(c?.earliestTime ?? ''); setAssumption(0); setError(''); }}>{cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="field"><span>Selected local birth time</span><Input type="text" placeholder="09:30 or 9:30 AM" disabled={busy} value={time} onChange={e => setTime(e.target.value)} /></label>
      <label className="field field-wide"><span>Prenatal duration</span><select disabled={busy} value={assumption} onChange={e => setAssumption(Number(e.target.value))}>{record?.assumptions.map((a, i) => <option key={i} value={i}>{a.approximate ? `Approximately ${a.days / 7} weeks` : `${a.days} days + ${a.hours} hours`} · {a.convention}</option>)}</select></label>
    </div><label className="check-field"><input type="checkbox" checked={search} disabled={busy} onChange={e => setSearch(e.target.checked)} />Include experimental candidate scan</label>
    <div className="filter-bar"><Button disabled={busy || !record || !time} onClick={calculate}><Calculator />{busy ? `Calculating… ${progress}%` : 'Calculate charts'}</Button>{record && <Button asChild variant="outline"><Link to="/new-rectification" search={{ caseId: record.id }}>Edit birth record</Link></Button>}</div></> : <Button asChild className="mt-5" disabled={!ready}><Link to="/new-rectification"><CirclePlus />New birth record</Link></Button>}
    {error && <div role="alert" className="error-banner">{error}</div>}
  </section>;
}