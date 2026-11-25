import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, CirclePlus, FolderOpen, ListFilter, Orbit, BookOpen, Settings2, ShieldCheck, ArrowUpRight, PanelLeftClose, Menu, Sparkles, Heart } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { CaseProvider } from './case-provider';
import { ResultsProvider } from './results-provider';
import { SUPPORT_URL, SUPPORT_LABEL } from './support';
const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/new-rectification', label: 'New Rectification', icon: CirclePlus },
  { to: '/cases', label: 'My Cases', icon: FolderOpen },
  { to: '/candidates', label: 'Candidate Explorer', icon: ListFilter },
  { to: '/comparison', label: 'Chart Comparison', icon: Orbit },
  { to: '/methodology', label: 'Methodology', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings2 },
] as const;
export function LaboratoryShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: state => state.location.pathname });
  const [open, setOpen] = useState(false);
  const current = navigation.find(n => n.to === path)?.label ?? 'Laboratory';
  return <CaseProvider><ResultsProvider><div className="laboratory">
    {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">☿</span><span><strong>HERMES TRUTINE</strong><span>BIRTH TIME RECTIFICATION</span></span></Link>
      <div className="sidebar-label">RESEARCH WORKSPACE</div>
      <nav aria-label="Main navigation">{navigation.map(({ to, label, icon: Icon }) => <Button asChild variant="navigation" key={to}><Link to={to} onClick={() => setOpen(false)} data-active={path === to}><Icon size={18} /><span>{label}</span>{path === to && <span className="active-dot" />}</Link></Button>)}</nav>
      <div className="sidebar-bottom"><div className="privacy-mini"><ShieldCheck size={20} /><div><strong>Private by design</strong><p>Your cases stay on this device.</p></div></div><div className="sidebar-version"><span><Sparkles size={13} /> Research edition</span><span>v0.1</span></div></div>
      <Button className="sidebar-mobile-close" variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setOpen(false)}><PanelLeftClose /></Button>
    </aside>
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><Button variant="ghost" size="icon" className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu /></Button><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{current}</strong></div><div className="topbar-actions"><span className="local-status"><span />Local workspace</span><Button asChild variant="ghost" size="sm"><Link to="/methodology">Research notes <ArrowUpRight /></Link></Button><span className="workspace-avatar" title="Private local workspace">H</span></div></header>
    <main className="main-content">{children}</main><footer className="workspace-footer"><span>Hermes Trutine · Birth Time Rectification <span className="footer-dot">·</span> A timeless method. A precise inquiry.</span><span>{SUPPORT_URL && <a className="support-link" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"><Heart size={13} /> {SUPPORT_LABEL}</a>}<ShieldCheck size={13} /> No account required</span></footer></div>
  </div></ResultsProvider></CaseProvider>;
}
