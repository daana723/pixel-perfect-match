const signs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
export type WheelPoint = { label: string; longitude: number };
type Props = { title: string; points?: WheelPoint[]; ascendant?: number };
// Renders only positions supplied by the calculation service; never synthesizes data.
export function ChartWheel({ title, points = [], ascendant }: Props) {
  const rotation = ascendant === undefined ? 0 : 180 - ascendant;
  const polar = (lon: number, r: number) => { const a = ((lon + rotation) * Math.PI) / 180; return { x: 100 - r * Math.cos(a), y: 100 + r * Math.sin(a) }; };
  const empty = points.length === 0;
  return <figure className="chart-wheel" aria-label={empty ? `${title}: no calculated positions` : title}>
    <svg viewBox="0 0 200 200" role="img">
      <circle cx="100" cy="100" r="95" className="wheel-ring" /><circle cx="100" cy="100" r="78" className="wheel-ring" /><circle cx="100" cy="100" r="40" className="wheel-ring" />
      {signs.map((s, i) => { const l1 = polar(i * 30, 78), l2 = polar(i * 30, 95), t = polar(i * 30 + 15, 86.5); return <g key={s}><line x1={l1.x} y1={l1.y} x2={l2.x} y2={l2.y} className="wheel-line" /><text x={t.x} y={t.y} className="wheel-sign" textAnchor="middle" dominantBaseline="central">{s}</text></g>; })}
      {ascendant !== undefined && (() => { const a = polar(ascendant, 78), d = polar(ascendant + 180, 78); return <line x1={a.x} y1={a.y} x2={d.x} y2={d.y} className="wheel-axis" />; })()}
      {points.map(p => { const c = polar(p.longitude, 62); return <text key={p.label} x={c.x} y={c.y} className="wheel-point" textAnchor="middle" dominantBaseline="central"><title>{`${p.label} ${p.longitude.toFixed(2)}°`}</title>{p.label}</text>; })}
      {empty && <text x="100" y="100" className="wheel-empty" textAnchor="middle" dominantBaseline="central">No data</text>}
    </svg>
    <figcaption>{title}</figcaption>
  </figure>;
}
