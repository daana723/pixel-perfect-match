import { createFileRoute } from '@tanstack/react-router';
import { CaseList } from '@/features/laboratory/case-list';
import { metadata } from '@/features/laboratory/shared';
export const Route = createFileRoute('/cases')({ head: () => metadata('My Cases', 'Manage, edit, duplicate, export and import your private on-device rectification research cases.'), component: CaseList });
