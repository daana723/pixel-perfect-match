import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResults } from './results-provider';

export function ReportDownload() {
  const { result, selected } = useResults();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setBlob(null); setError(''); }, [result, selected]);
  async function prepare() {
    if (!result) return;
    setBusy(true); setError('');
    try { const { createReport } = await import('./pdf-report'); setBlob(createReport(result, selected)); }
    catch { setError('The report could not be prepared. Please try again.'); }
    finally { setBusy(false); }
  }
  function download() {
    if (!blob) return;
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'hermes-trutine-report.pdf'; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  return <><Button variant="outline" disabled={!result || busy} onClick={blob ? download : prepare}>{blob ? <Download /> : <FileText />}{busy ? 'Preparing report…' : blob ? 'Download PDF report' : 'Prepare PDF report'}</Button>{error && <span role="alert" className="text-destructive text-sm">{error}</span>}</>;
}