import { createFileRoute } from '@tanstack/react-router';
import { ChartComparison, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/comparison')({ head: () => metadata('Chart Comparison', 'Inspect privately calculated Swiss Ephemeris natal and prenatal planets, horizon axes and houses; classical Trutine remains unresolved.'), component: ChartComparison });
