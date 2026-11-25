import type { DisplayChart } from './browser-astronomy';
import { formatZodiac, localClock } from './astrology-display';

export function ChartSummary({ chart, timezone, status }: { chart: DisplayChart; timezone: string; status: string }) {
  const clock = localClock(chart.utc, timezone);
  const moon = chart.points.find(p => p.name === 'Moon');
  return <div className="chart-summary">
    <span className="eyebrow">{status}</span>
    <time dateTime={chart.utc} className="chart-local-time">{clock.time}</time>
    <p className="chart-local-date">{clock.date} · {timezone}</p>
    <dl className="chart-key-positions">
      <div><dt>Ascendant</dt><dd>{formatZodiac(chart.ascendant)}</dd></div>
      <div><dt>Midheaven</dt><dd>{formatZodiac(chart.mc)}</dd></div>
      <div><dt>Moon</dt><dd>{formatZodiac(moon?.longitude)}</dd></div>
    </dl>
  </div>;
}