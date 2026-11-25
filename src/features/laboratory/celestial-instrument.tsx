const glyphs = ['♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎', '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎'];
const coordinate = (value: number) => Number(value.toFixed(6));
export function CelestialInstrument({ small = false }: { small?: boolean }) {
  return <svg viewBox="0 0 340 340" className={small ? 'celestial-instrument small' : 'celestial-instrument'} role="img" aria-label="Schematic zodiac instrument, not calculated planetary positions">
    <circle cx="170" cy="170" r="151" className="instrument-faint" />
    <circle cx="170" cy="170" r="139" className="instrument-stroke" />
    <circle cx="170" cy="170" r="107" className="instrument-stroke" />
    <circle cx="170" cy="170" r="99" className="instrument-faint" />
    {Array.from({ length: 72 }, (_, i) => { const a = i * Math.PI / 36; const inner = i % 6 === 0 ? 124 : 134; return <line key={i} x1={coordinate(170 + inner * Math.cos(a))} y1={coordinate(170 + inner * Math.sin(a))} x2={coordinate(170 + 139 * Math.cos(a))} y2={coordinate(170 + 139 * Math.sin(a))} className="instrument-stroke" />; })}
    {glyphs.map((glyph, i) => { const a = (i * 30 - 105) * Math.PI / 180; return <text key={glyph} x={coordinate(170 + 121 * Math.cos(a))} y={coordinate(175 + 121 * Math.sin(a))} textAnchor="middle" className="instrument-glyph">{glyph}</text>; })}
    <path d="M65 170H275 M170 65V275 M96 96L244 244 M96 244L244 96" className="instrument-faint" />
    <path d="M96 170L207 102L244 170L133 238Z" className="instrument-stroke" />
    <circle cx="170" cy="170" r="42" className="instrument-faint" />
    <path d="M180 150a23 23 0 1 0 0 40a21 21 0 0 1 0-40Z" className="instrument-moon" />
    <circle cx="96" cy="170" r="3" className="instrument-dot" /><circle cx="244" cy="170" r="3" className="instrument-dot" />
    <text x="170" y="324" textAnchor="middle" className="instrument-caption">RECIPROCAL MOON–HORIZON RELATIONSHIP</text>
  </svg>;
}
