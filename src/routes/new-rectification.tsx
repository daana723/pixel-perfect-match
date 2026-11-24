import { createFileRoute } from '@tanstack/react-router';
import { RectificationForm } from '@/features/laboratory/rectification-form';
import { metadata } from '@/features/laboratory/shared';
export const Route = createFileRoute('/new-rectification')({
  validateSearch: (search: Record<string, unknown>): { caseId?: string } => typeof search['caseId'] === 'string' ? { caseId: search['caseId'] } : {},
  head: () => metadata('New Rectification', 'Record birth intervals, historical timezone, prenatal assumptions and distinct calculation profiles privately.'),
  component: Page,
});
function Page() { const { caseId } = Route.useSearch(); return caseId ? <RectificationForm caseId={caseId} /> : <RectificationForm />; }
