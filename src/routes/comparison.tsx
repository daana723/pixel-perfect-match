import { createFileRoute } from '@tanstack/react-router';
import { ChartComparison, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/comparison')({ head: () => metadata('Chart Comparison', 'Study local birth times, Ascendant degrees, planetary zodiac positions and natal/prenatal correspondences privately; download an explicitly experimental research report.'), component: ChartComparison });
