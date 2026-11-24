import { createFileRoute } from '@tanstack/react-router';
import { ChartComparison, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/comparison')({ head: () => metadata('Chart Comparison', 'A workspace for future Swiss Ephemeris natal and prenatal chart comparison, without fabricated positions.'), component: ChartComparison });
