import { createFileRoute } from '@tanstack/react-router';
import { CandidateExplorer, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/candidates')({ head: () => metadata('Candidate Explorer', 'Review candidate research readiness and distinguish mathematical fit from historical verification.'), component: CandidateExplorer });
