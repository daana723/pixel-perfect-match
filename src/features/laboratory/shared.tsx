import { Link } from '@tanstack/react-router';
import { ArrowRight, CirclePlus, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>;
}
export function NewCaseButton({ label = 'New rectification' }: { label?: string }) { return <Button asChild><Link to="/new-rectification"><CirclePlus />{label}</Link></Button>; }
export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) { return <div className="section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>; }
export function CalculationNotice() { return <div className="calculation-notice"><LockKeyhole size={17} /><p><strong>Public calculations are disabled.</strong> Cases stay local. Private Swiss Ephemeris testing is available separately; classical Trutine rules remain unresolved.</p></div>; }
export function MethodLink() { return <Button asChild variant="link"><Link to="/methodology">Read methodology <ArrowRight /></Link></Button>; }
export function metadata(title: string, description: string) { return { meta: [{ title: `${title} | Hermes Trutine Laboratory` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} | Hermes Trutine Laboratory` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }; }
