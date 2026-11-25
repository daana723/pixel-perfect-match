import { useId, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loadCities, searchCities, type City } from './cities';

export function CityPicker({ label, value, onChange, onSelect }: { label: string; value: string; onChange: (value: string) => void; onSelect: (city: City) => void }) {
  const id = useId();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const results = useMemo(() => searchCities(cities, value), [cities, value]);
  async function start() {
    setOpen(true);
    if (cities.length || loading) return;
    setLoading(true); setError('');
    try { setCities(await loadCities()); }
    catch (e) { setError(e instanceof Error ? e.message : 'City search is unavailable. Enter coordinates manually.'); }
    finally { setLoading(false); }
  }
  function select(city: City) { onSelect(city); setOpen(false); setActive(-1); }
  const expanded = open && value.trim().length >= 2;
  return <div className="field field-wide city-picker" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>{label}</label>
    <div className="city-search-input"><Search size={15} /><Input id={id} role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-list`} aria-activedescendant={expanded && active >= 0 && results[active] ? `${id}-option-${active}` : undefined} placeholder="City, region or country" value={value} onFocus={() => void start()} onChange={e => { onChange(e.target.value); setOpen(true); setActive(-1); }} onKeyDown={e => {
      if (e.key === 'Escape') { setOpen(false); setActive(-1); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setActive(previous => results.length ? (previous + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length : -1); }
      if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); const city = results[active]; if (city) select(city); }
    }} /></div>
    {expanded && <div className="city-results" id={`${id}-list`} role="listbox" aria-label={`${label} matches`}>
      {loading ? <p role="status">Loading city directory…</p> : error ? <p role="status">{error}</p> : results.length ? results.map((city, index) => <Button type="button" variant="ghost" key={city.id} id={`${id}-option-${index}`} role="option" aria-selected={active === index} className="city-option" onMouseDown={e => e.preventDefault()} onClick={() => select(city)}><MapPin size={15} /><span><strong>{city.name}</strong><small>{[city.region, city.country].filter(Boolean).join(' · ')}</small></span></Button>) : <p role="status">No matching city. Enter the place and coordinates manually.</p>}
    </div>}
    <small className="city-attribution"><a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> · City-centre coordinates · CC BY 4.0</small>
  </div>;
}