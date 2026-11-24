import { createFileRoute } from '@tanstack/react-router';
import { Settings, metadata } from '@/features/laboratory/research-views';
export const Route = createFileRoute('/settings')({ head: () => metadata('Settings & Privacy', 'Control local case backups and inspect calculation-service, cloud synchronization and privacy status.'), component: Settings });
