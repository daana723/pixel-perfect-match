import { createFileRoute } from '@tanstack/react-router';
import { Methodology, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/methodology')({ head: () => metadata('Methodology', 'Historical source requirements, experimental profile distinctions, astronomical integrity and licensing transparency.'), component: Methodology });
