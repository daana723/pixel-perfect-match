import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, Upload, Download, Copy, Trash2, ArrowRight, FolderOpen, CircleDot } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCases } from './case-provider';
import { archive, download, methodNames, type SavedCase } from './cases';
import { PageHeading, NewCaseButton } from './shared';
export function CaseList() {
  const { cases, ready, error, remove, duplicate, importCases } = useCases();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState<SavedCase | null>(null);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const filtered = cases.filter(c => `${c.name} ${c.city} ${c.country}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || c.method === filter));
  async function importFile(selected?: File) {
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) { toast.error('Import must be smaller than 10 MB.'); return; }
    try { const count = await importCases(await selected.text()); toast.success(`${count} case${count === 1 ? '' : 's'} imported privately.`); }
    catch { toast.error('Import failed. Select a valid Hermes Trutine case archive (version 1).'); }
  }
  function exportCase(c: SavedCase) { download(JSON.stringify(archive([c]), null, 2), 'hermes-case.json', 'application/json'); }
  return <><PageHeading eyebrow="PRIVATE CASE ARCHIVE" title="Your research cases" description={`${ready ? cases.length : '—'} saved cases. Stored on this device, entirely under your control.`} actions={<><Button variant="outline" onClick={() => file.current?.click()}><Upload />Import cases</Button><NewCaseButton /></>} /><input ref={file} type="file" accept=".json,application/json" hidden aria-label="Import case archive" onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ''; }} />
  {error && <div className="error-banner" role="alert">{error}</div>}
  <div className="cases-toolbar"><div className="search-field"><Search /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search cases or locations" aria-label="Search cases" /></div><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter cases by method"><option value="all">All calculation profiles</option><option value="classical">Classical Trutine</option><option value="modern">Modern corrected</option><option value="comparison">Compare both</option></select></div>
  {!ready ? <div className="empty-view"><p>Opening your private case archive…</p></div> : filtered.length === 0 ? <div className="empty-view"><span className="empty-icon"><FolderOpen size={28} /></span><h2>{cases.length ? 'No matching cases' : 'An archive of your own'}</h2><p>{cases.length ? 'No cases match the selected search and profile.' : 'Your research records will appear here. Create a new inquiry or import a previously exported case archive.'}</p>{cases.length ? <Button variant="outline" onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</Button> : <NewCaseButton label="Create your first case" />}</div> : <div className="cases-list">{filtered.map(c => <article className="case-card" key={c.id}><div className="case-card-top"><div><h2>{c.name}</h2><p className="case-date">{c.birthDate} · {c.city}, {c.country}</p></div><span className="status-badge"><CircleDot size={11} />Not calculated</span></div><div className="case-card-data"><strong>{c.earliestTime} – {c.latestTime}</strong> · {c.timezone}<br />{methodNames[c.method]} · {c.assumptions.length} prenatal assumption{c.assumptions.length === 1 ? '' : 's'}<br />Verification: {c.verification.replaceAll('-', ' ')}</div><div className="case-card-bottom"><Button asChild variant="link" className="p-0"><Link to="/new-rectification" search={{ caseId: c.id }}>Open case <ArrowRight /></Link></Button><div><Button variant="ghost" size="icon" aria-label={`Export ${c.name}`} title="Export JSON" onClick={() => exportCase(c)}><Download /></Button><Button variant="ghost" size="icon" aria-label={`Duplicate ${c.name}`} title="Duplicate case" onClick={() => { void duplicate(c).catch(() => toast.error('Case could not be duplicated.')); }}><Copy /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} title="Delete case" onClick={() => setDeleting(c)}><Trash2 /></Button></div></div></article>)}</div>}
  {deleting && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-heading"><h2 id="delete-heading">Delete this case?</h2><p>“{deleting.name}” will be permanently removed from this device. Export a backup first if you want to retain it.</p><div className="modal-actions"><Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await remove(deleting.id); setDeleting(null); } catch { toast.error('Case could not be deleted.'); } finally { setBusy(false); } }}><Trash2 />Delete case</Button></div></section></div>}
  </>;
}
