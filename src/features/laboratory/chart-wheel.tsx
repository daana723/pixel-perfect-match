const signs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
export type WheelPoint = { label: string; longitude: number; name?: string };
type Props = { title: string; points?: WheelPoint[]; ascendant?: number; mc?: number; cusps?: number[]; overlayPoints?: WheelPoint[] };
// Renders only positions supplied by the calculation service; never synthesizes data.
export function ChartWheel({ title, points = [], ascendant, mc, cusps = [], overlayPoints = [] }: Props) {
  const rotation = ascendant === undefined ? 0 : -ascendant;
  const polar = (lon: number, r: number) => { const a = ((lon + rotation) * Math.PI) / 180; return { x: 100 - r * Math.cos(a), y: 100 + r * Math.sin(a) }; };
  const empty = points.length === 0;
  return <figure className="chart-wheel" aria-label={empty ? `${title}: no calculated positions` : title}>
    <svg viewBox="0 0 200 200" role="img">
      <circle cx="100" cy="100" r="95" className="wheel-ring" /><circle cx="100" cy="100" r="78" className="wheel-ring" /><circle cx="100" cy="100" r="40" className="wheel-ring" />
      {signs.map((s, i) => { const l1 = polar(i * 30, 78), l2 = polar(i * 30, 95), t = polar(i * 30 + 15, 86.5); return <g key={s}><line x1={l1.x} y1={l1.y} x2={l2.x} y2={l2.y} className="wheel-line" /><text x={t.x} y={t.y} className="wheel-sign" textAnchor="middle" dominantBaseline="central">{s}</text></g>; })}
      {ascendant !== undefined && (() => { const a = polar(ascendant, 78), d = polar(ascendant + 180, 78); return <line x1={a.x} y1={a.y} x2={d.x} y2={d.y} className="wheel-axis" />; })()}
      {cusps.map((lon, i) => { const a = polar(lon, 40), b = polar(lon, 78); const next = cusps[(i + 1) % 12] ?? lon; const c = polar(lon + ((next - lon + 360) % 360) / 2, 34); return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="wheel-line" /><text x={c.x} y={c.y} className="wheel-house" textAnchor="middle" dominantBaseline="central">{i + 1}</text></g>; })}
      {mc !== undefined && (() => { const a = polar(mc, 78), b = polar(mc + 180, 78); return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="wheel-mc" />; })()}
      {[points, overlayPoints].map((group, layer) => [...group].sort((a,b) => a.longitude - b.longitude).map((p, i) => { const c = polar(p.longitude, (layer ? 22 : 46) + (i % 4) * 8), anchor = polar(p.longitude, layer ? 40 : 76); return <g key={`${layer}-${p.name ?? p.label}`} className={layer ? 'wheel-overlay' : ''}><title>{`${layer ? 'Prenatal · ' : ''}${p.name ?? p.label} ${p.longitude.toFixed(6)}°`}</title><line x1={anchor.x} y1={anchor.y} x2={c.x} y2={c.y} className="wheel-point-line" /><circle cx={anchor.x} cy={anchor.y} r=".8" className="wheel-marker" /><text x={c.x} y={c.y} className="wheel-point" textAnchor="middle" dominantBaseline="central">{p.label}</text></g>; }))}
      {empty && <text x="100" y="100" className="wheel-empty" textAnchor="middle" dominantBaseline="central">No data</text>}
    </svg>
    <figcaption>{title}</figcaption>
  </figure>;
}
