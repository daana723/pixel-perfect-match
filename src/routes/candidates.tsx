import { createFileRoute } from '@tanstack/react-router';
import { CandidateExplorer, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/candidates')({ head: () => metadata('Candidate Explorer', 'Compare experimental local birth-time candidates, Ascendant zodiac degrees and reciprocal angular differences without claiming verified rectification.'), component: CandidateExplorer });
