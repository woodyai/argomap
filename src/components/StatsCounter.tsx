import { useEffect, useState } from 'react';
import { strings, type Lang } from '../i18n/strings';

interface StatItemProps {
  value: number;
  label: string;
  delay: number;
}

function useCountUp(value: number, delay: number, duration = 1100) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let raf = 0;
    const timer = window.setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(eased * value));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [value, delay, duration]);
  return count;
}

function StatItem({ value, label, delay }: StatItemProps) {
  const count = useCountUp(value, delay);
  return (
    <div style={{ textAlign: 'center', fontFamily: 'var(--argo-fui)' }}>
      <span
        style={{
          fontSize: '21px',
          fontWeight: 600,
          letterSpacing: '-0.04em',
          display: 'block',
          color: 'var(--argo-t1)',
          lineHeight: 1,
        }}
      >
        {count}
      </span>
      <span
        style={{
          fontSize: '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--argo-t3)',
          display: 'block',
          marginTop: '4px',
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface StatsCounterProps {
  countries: number;
  cities: number;
  locations: number;
  lang?: Lang;
}

export default function StatsCounter({ countries, cities, locations, lang = 'en' }: StatsCounterProps) {
  const copy = strings[lang];
  const sep = (
    <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--argo-border)' }} />
  );
  return (
    <div
      style={{
        display: 'flex',
        gap: '28px',
        alignItems: 'stretch',
        animation: 'argoFadeUp 0.9s 0.2s ease both',
      }}
    >
      <StatItem value={countries} label={copy.statCountries} delay={250} />
      {sep}
      <StatItem value={cities} label={copy.statCities} delay={420} />
      {sep}
      <StatItem value={locations} label={copy.statPlaces} delay={580} />
    </div>
  );
}
