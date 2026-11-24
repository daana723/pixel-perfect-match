import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { liveQuery } from 'dexie';
import { toast } from 'sonner';
import { caseArchiveSchema, caseInputSchema, type CaseInput, type SavedCase } from './cases';
import { getDatabase } from './database';

type CaseContextValue = {
  cases: SavedCase[]; ready: boolean; error: string;
  save: (data: CaseInput, id?: string) => Promise<string>;
  remove: (id: string) => Promise<void>;
  duplicate: (record: SavedCase) => Promise<void>;
  importCases: (text: string) => Promise<number>;
};
const CaseContext = createContext<CaseContextValue | null>(null);
export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const subscription = liveQuery(() => getDatabase().cases.orderBy('updatedAt').reverse().toArray()).subscribe({
      next: records => { setCases(records); setReady(true); },
      error: () => { setError('On-device storage is unavailable. Check your browser storage permissions.'); setReady(true); },
    });
    return () => subscription.unsubscribe();
  }, []);
  async function save(data: CaseInput, id?: string) {
    const validated = caseInputSchema.parse(data);
    const previous = id ? await getDatabase().cases.get(id) : undefined;
    if (id && !previous) throw new Error('This case no longer exists.');
    const key = id ?? crypto.randomUUID();
    const now = new Date().toISOString();
    await getDatabase().cases.put({ ...validated, id: key, createdAt: previous?.createdAt ?? now, updatedAt: now });
    return key;
  }
  async function remove(id: string) { await getDatabase().cases.delete(id); toast.success('Case deleted from this device.'); }
  async function duplicate(record: SavedCase) { await save({ ...record, name: `${record.name.slice(0, 110)} (copy)` }); toast.success('Case duplicated.'); }
  async function importCases(text: string) {
    const parsed = caseArchiveSchema.parse(JSON.parse(text));
    const now = new Date().toISOString();
    await getDatabase().cases.bulkAdd(parsed.cases.map(c => ({ ...c, id: crypto.randomUUID(), updatedAt: now })));
    return parsed.cases.length;
  }
  return <CaseContext.Provider value={{ cases, ready, error, save, remove, duplicate, importCases }}>{children}</CaseContext.Provider>;
}
export function useCases() {
  const context = useContext(CaseContext);
  if (!context) throw new Error('CaseProvider is required.');
  return context;
}
