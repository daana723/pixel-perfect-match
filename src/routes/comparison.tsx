import { createFileRoute } from '@tanstack/react-router';
import { ChartComparison, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/comparison')({ head: () => metadata('Chart Comparison', 'Calculate private browser natal and prenatal charts, inspect offline Swiss results and download a research PDF; classical Trutine remains unresolved.'), component: ChartComparison });
