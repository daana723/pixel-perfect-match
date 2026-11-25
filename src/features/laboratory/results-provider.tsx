import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseAstronomyResult, type AstronomyResult } from './astronomy-results';
import type { BrowserResult } from './browser-astronomy';

type ResultContext = { result: AstronomyResult | BrowserResult | null; selected: number | null; select: (index: number | null) => void; load: (text: string) => void; clear: () => void; setBrowserResult: (result: BrowserResult) => void };
const Context = createContext<ResultContext | null>(null);
export function ResultsProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AstronomyResult | BrowserResult | null>(null);
  const [selected, select] = useState<number | null>(null);
  return <Context.Provider value={{ result, selected, select, load: text => { setResult(parseAstronomyResult(text)); select(null); }, setBrowserResult: value => { setResult(value); select(null); }, clear: () => { setResult(null); select(null); } }}>{children}</Context.Provider>;
}
export function useResults() { const context = useContext(Context); if (!context) throw new Error('ResultsProvider is required.'); return context; }
export function ResultImport() {
  const { result, load, clear } = useResults();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <><div className="filter-bar items-center">
    <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}><Upload />{busy ? 'Opening…' : 'Open calculation JSON'}</Button>
    <input ref={input} type="file" accept=".json,application/json" hidden aria-label="Open local calculation file" onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
      setError(''); setBusy(true);
      try { if (file.size > 10 * 1024 * 1024) throw new Error('size'); load(await file.text()); }
      catch { setError('This file is not a supported calculation archive, has inconsistent settings, or exceeds 10 MB.'); }
      finally { setBusy(false); }
    }} />
    {result && <><span className="text-sm text-muted-foreground break-words min-w-0">{result.case_name}</span><Button variant="ghost" size="icon" aria-label="Clear calculation" title="Clear calculation" onClick={clear}><X /></Button></>}
  </div>{error && <div className="error-banner" role="alert">{error}</div>}</>;
}