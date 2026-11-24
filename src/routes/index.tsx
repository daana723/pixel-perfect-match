import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from '@/features/laboratory/dashboard';
import { metadata } from '@/features/laboratory/shared';
export const Route = createFileRoute("/")({
  head: () => metadata('Research Dashboard', 'Your private workspace for Trutine of Hermes birth-time rectification research and local case management.'),
  component: Dashboard,
});
