import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, Info, Check, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCases } from './case-provider';
import { caseInputSchema, crossesMidnight, orientations, methodNames, type CaseInput, type Method } from './cases';
import { PageHeading, CalculationNotice } from './shared';
import { CelestialInstrument } from './celestial-instrument';

type Fields = { name: string; birthDate: string; earliestTime: string; latestTime: string; city: string; country: string; latitude: string; longitude: string; altitude: string; timezone: string; ambiguity: CaseInput['ambiguity']; uncertainty: string; prenatalCity: string; prenatalLatitude: string; prenatalLongitude: string; prenatalAltitude: string; conceptionDate: string; notes: string; verification: CaseInput['verification']; houseSystem: CaseInput['houseSystem'] };
type Duration = { days: string; hours: string; convention: 'conception' | 'lmp' | 'custom' };
const initialFields: Fields = { name: '', birthDate: '', earliestTime: '', latestTime: '', city: '', country: '', latitude: '', longitude: '', altitude: '0', timezone: '', ambiguity: 'reject', uncertainty: '', prenatalCity: '', prenatalLatitude: '', prenatalLongitude: '', prenatalAltitude: '0', conceptionDate: '', notes: '', verification: 'unverified', houseSystem: 'P' };
const steps = ['Birth record', 'Prenatal assumptions', 'Calculation method', 'Review & save'];
function Field({ label, children, wide = false, hint }: { label: string; children: ReactNode; wide?: boolean; hint?: string }) { return <label className={`field ${wide ? 'field-wide' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
export function RectificationForm({ caseId }: { caseId?: string }) {
  const { cases, ready, error: storageError, save } = useCases();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<Fields>(initialFields);
  const [durations, setDurations] = useState<Duration[]>([{ days: '', hours: '0', convention: 'conception' }]);
  const [sameLocation, setSameLocation] = useState(true);
  const [method, setMethod] = useState<Method>('classical');
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const record = cases.find(c => c.id === caseId);
    if (!record) return;
    setFields({ ...record, latitude: String(record.latitude), longitude: String(record.longitude), altitude: String(record.altitude), prenatalLatitude: String(record.prenatalLatitude), prenatalLongitude: String(record.prenatalLongitude), prenatalAltitude: String(record.prenatalAltitude) });
    setDurations(record.assumptions.map(d => ({ ...d, days: String(d.days), hours: String(d.hours) })));
    setSameLocation(record.sameLocation); setMethod(record.method);
  }, [caseId, cases]);
  function update<K extends keyof Fields>(key: K, value: Fields[K]) { setFields(previous => ({ ...previous, [key]: value })); }
  function input(key: keyof Fields, type = 'text', placeholder = '') { return <Input type={type} value={fields[key]} onChange={event => update(key, event.target.value as Fields[typeof key])} placeholder={placeholder} step={type === 'number' ? 'any' : undefined} />; }
  function updateDuration(index: number, patch: Partial<Duration>) { setDurations(previous => previous.map((d, i) => i === index ? { ...d, ...patch } : d)); }
  function data() {
    const number = (v: string) => v.trim() === '' ? NaN : Number(v);
    return { ...fields, latitude: number(fields.latitude), longitude: number(fields.longitude), altitude: number(fields.altitude), sameLocation, prenatalLatitude: number(sameLocation ? fields.latitude : fields.prenatalLatitude), prenatalLongitude: number(sameLocation ? fields.longitude : fields.prenatalLongitude), prenatalAltitude: number(sameLocation ? fields.altitude : fields.prenatalAltitude), prenatalCity: sameLocation ? fields.city : fields.prenatalCity, assumptions: durations.map(d => ({ ...d, days: number(d.days), hours: number(d.hours) })), method };
  }
  async function handleSave() {
    const result = caseInputSchema.safeParse(data());
    if (!result.success) { setErrors(result.error.issues.map(i => `${i.path.join(' → ')}: ${i.message}`)); return; }
    setSaving(true); setErrors([]);
    try { await save(result.data, caseId); toast.success('Case saved privately on this device.'); await navigate({ to: '/cases' }); }
    catch (e) { setErrors([e instanceof Error ? e.message : 'Case could not be saved.']); }
    finally { setSaving(false); }
  }
  if (caseId && ready && !cases.some(c => c.id === caseId)) return <><PageHeading eyebrow="CASE RECORD" title="Case not found" description="This case may have been deleted or is stored on another device." /><Button asChild variant="outline"><a href="/cases">Return to cases</a></Button></>;
  return <>
    <PageHeading eyebrow="BIRTH-TIME RECTIFICATION" title={caseId ? 'Continue your inquiry' : 'Begin a new inquiry'} description="Define the birth record, preserve your assumptions, and prepare a reproducible investigation." />
    <CalculationNotice />
    <div className="workflow-steps" aria-label="Rectification steps">{steps.map((label, index) => <Button key={label} variant="ghost" className="workflow-step" data-active={step === index} onClick={() => { setStep(index); setErrors([]); }}><span className="step-number">{index + 1}</span>{label}</Button>)}</div>
    <div className="form-layout"><div>
      {step === 0 && <section className="form-section"><h2>The birth record</h2><p>Local civil times are retained exactly as entered. No timezone is assumed.</p><div className="field-grid">
        <Field label="Case name" wide>{input('name', 'text', 'A private reference for this inquiry')}</Field>
        <Field label="Birth date">{input('birthDate', 'date')}</Field><Field label="Time uncertainty (optional)">{input('uncertainty', 'text', 'e.g. Family recollection, ±30 minutes')}</Field>
        <Field label="Earliest possible birth time">{input('earliestTime', 'time')}</Field><Field label="Latest possible birth time">{input('latestTime', 'time')}</Field>
        {crossesMidnight(fields.earliestTime, fields.latestTime) && fields.latestTime && <div className="form-info field-wide"><Info size={15} />This interval crosses midnight. The latest time is on the following calendar day.</div>}
        <Field label="Birth city">{input('city', 'text', 'City or locality')}</Field><Field label="Country">{input('country', 'text', 'Country')}</Field>
        <Field label="Latitude (decimal degrees)">{input('latitude', 'number', '−90 to 90')}</Field><Field label="Longitude (decimal degrees)">{input('longitude', 'number', '−180 to 180')}</Field>
        <Field label="Historical IANA timezone" hint="Required. Historical UTC offset and DST resolution belong to the calculation service.">{input('timezone', 'text', 'e.g. Europe/London')}</Field><Field label="Altitude (metres)">{input('altitude', 'number')}</Field>
        <Field label="Ambiguous local-time policy" wide><select value={fields.ambiguity} onChange={e => update('ambiguity', e.target.value as Fields['ambiguity'])}><option value="reject">Require clarification if the time occurs twice</option><option value="earlier">Use the earlier occurrence</option><option value="later">Use the later occurrence</option></select></Field>
      </div><div className="form-info"><Info size={15} />Location search is not configured. Enter coordinates manually. Nonexistent local times must be rejected by the calculation service.</div></section>}
      {step === 1 && <section className="form-section"><h2>Prenatal assumptions</h2><p>Record explicit durations. Different conventions are not interchangeable.</p>{durations.map((d, i) => <div className="duration-row" key={i}><Field label={`Assumption ${i + 1} · Days`}><Input type="number" min="0" max="500" step="any" placeholder="Required" value={d.days} onChange={e => updateDuration(i, { days: e.target.value })} /></Field><Field label="Additional hours"><Input type="number" min="0" max="23.999" step="any" value={d.hours} onChange={e => updateDuration(i, { hours: e.target.value })} /></Field><label className="field convention-field"><span>Duration convention</span><select value={d.convention} onChange={e => updateDuration(i, { convention: e.target.value as Duration['convention'] })}><option value="conception">Conception to birth</option><option value="lmp">Last menstrual period to birth</option><option value="custom">Custom prenatal interval</option></select></label><Button variant="ghost" size="icon" aria-label={`Remove assumption ${i + 1}`} disabled={durations.length === 1} onClick={() => setDurations(previous => previous.filter((_, index) => index !== i))}><Trash2 /></Button></div>)}<Button variant="outline" size="sm" disabled={durations.length >= 20} onClick={() => setDurations(previous => [...previous, { days: '', hours: '0', convention: 'custom' }])}><Plus />Add duration assumption</Button>
      <label className="check-field"><input type="checkbox" checked={sameLocation} onChange={e => setSameLocation(e.target.checked)} />Prenatal location is the same as birth location</label>
      {!sameLocation && <div className="field-grid"><Field label="Prenatal city" wide>{input('prenatalCity')}</Field><Field label="Prenatal latitude">{input('prenatalLatitude', 'number')}</Field><Field label="Prenatal longitude">{input('prenatalLongitude', 'number')}</Field><Field label="Prenatal altitude (metres)">{input('prenatalAltitude', 'number')}</Field></div>}
      <div className="field-grid" style={undefined}><Field label="Known conception date (optional)" wide>{input('conceptionDate', 'date')}</Field></div><div className="form-info"><Info size={15} />No universal prenatal duration is assumed. Conventions and a known date are preserved as assumptions; their interpretation awaits the calculation specification.</div></section>}
      {step === 2 && <section className="form-section"><h2>Choose an investigation profile</h2><p>Profiles remain separately identifiable. Selecting one does not run a calculation.</p><div className="method-options">{([
        ['classical', 'Classical Trutine of Hermes', 'Geocentric Moon–horizon reciprocity with a source-approved historical rule.', 'Historical source selection required'],
        ['modern', 'Modern corrected calculation', 'Experimental topocentric lunar positions with explicit observer and axis assumptions.', 'Experimental · not yet implemented'],
        ['comparison', 'Compare both engines', 'Identical birth records and prenatal assumptions; separately recorded outcomes.', 'Comparison awaits both validated engines'],
      ] as const).map(([key, title, description, status]) => <label className="method-option" key={key} data-selected={method === key}><input type="radio" name="calculation-method" value={key} checked={method === key} onChange={() => setMethod(key)} /><div><h3>{title}</h3><p>{description}</p><small>{status}</small></div></label>)}</div><h2 className="mt-8">Exploratory axis orientations</h2><p>All four pairings are preserved for the future candidate search.</p><div className="axis-list">{orientations.map(o => <span className="axis-item" key={o}><Check size={12} />{o}</span>)}</div><div className="field-grid mt-6"><Field label="House system"><select value={fields.houseSystem} onChange={e => update('houseSystem', e.target.value as Fields['houseSystem'])}><option value="P">Placidus</option><option value="E">Equal houses</option><option value="W">Whole sign</option><option value="R">Regiomontanus</option></select></Field><Field label="Zodiac"><Input readOnly value="Tropical" /></Field></div></section>}
      {step === 3 && <section className="form-section"><h2>Preserve the research record</h2><p>Saving stores your inputs and assumptions, not a calculated or verified birth time.</p><dl className="review-grid">{[
        ['Case', fields.name || 'Not entered'], ['Birth date', fields.birthDate || 'Not entered'], ['Local interval', `${fields.earliestTime || '—'} – ${fields.latestTime || '—'}${crossesMidnight(fields.earliestTime, fields.latestTime) ? ' (+1 day)' : ''}`], ['Historical timezone', fields.timezone || 'Not entered'], ['Birth location', `${fields.city || '—'}, ${fields.country || '—'} · ${fields.latitude || '—'}, ${fields.longitude || '—'}`], ['Method', methodNames[method]], ['Prenatal assumptions', durations.map(d => `${d.days || '—'} days + ${d.hours} hours (${d.convention})`).join('; ')], ['Calculation status', 'Not calculated · no candidate results'],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="field-grid"><Field label="Independent verification status" wide><select value={fields.verification} onChange={e => update('verification', e.target.value as Fields['verification'])}><option value="unverified">Unverified</option><option value="documentary-evidence">Documentary evidence recorded</option><option value="independently-verified">Independently verified by the astrologer</option></select></Field><Field label="Research notes" wide><textarea value={fields.notes} onChange={e => update('notes', e.target.value)} placeholder="Sources, documentary evidence, uncertainties, and working observations…" /></Field></div></section>}
      {(errors.length > 0 || storageError) && <div className="error-banner" role="alert">{storageError}{errors.map((error, i) => <p key={i}>{error}</p>)}</div>}
      <div className="form-bottom"><Button variant="ghost" disabled={step === 0} onClick={() => { setStep(s => s - 1); setErrors([]); }}><ArrowLeft />Back</Button><div>{step < 3 ? <Button onClick={() => { setStep(s => s + 1); setErrors([]); }}>Continue <ArrowRight /></Button> : <Button disabled={saving || !ready || Boolean(storageError)} onClick={handleSave}><Save />{saving ? 'Saving…' : caseId ? 'Save changes' : 'Save case locally'}</Button>}</div></div>
    </div><aside className="form-aside"><div className="eyebrow">THE LABORATORY STANDARD</div><CelestialInstrument small /><h3>Every assumption matters.</h3><p>The birth interval, observer location, prenatal convention, and selected method form the foundation of a reproducible inquiry.</p><div className="aside-rule" /><div className="form-info"><ShieldCheck size={17} />This record stays in your browser. Export a backup to protect against device loss or cleared browser data.</div></aside></div>
  </>;
}
