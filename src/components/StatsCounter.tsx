import { useEffect, useState } from 'react';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

interface StatItemProps {
  icon: string;
  value: number;
  label: string;
  delay: number;
  compact?: boolean;
}

function StatItem({ icon, value, label, delay, compact }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [visible, value]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '4px' : '8px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ fontSize: compact ? '16px' : '24px' }}>{icon}</span>
      <span
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: compact ? '22px' : '36px',
          fontWeight: 900,
          color: '#ffffff',
          textShadow: '0 0 20px rgba(255,255,255,0.3)',
          lineHeight: 1,
        }}
      >
        {count}
      </span>
      <span
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: compact ? '11px' : '13px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.5px',
          marginTop: compact ? '2px' : '4px',
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
}

export default function StatsCounter({ countries, cities, locations }: StatsCounterProps) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '16px' : '40px',
        padding: isMobile ? '10px 16px' : '16px 40px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        borderRadius: isMobile ? '16px' : '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <StatItem icon="🌍" value={countries} label="Countries" delay={200} compact={isMobile} />
      <div style={{ width: '1px', height: isMobile ? '24px' : '36px', background: 'rgba(255,255,255,0.1)' }} />
      <StatItem icon="🏙️" value={cities} label="Cities" delay={400} compact={isMobile} />
      <div style={{ width: '1px', height: isMobile ? '24px' : '36px', background: 'rgba(255,255,255,0.1)' }} />
      <StatItem icon="📍" value={locations} label="Locations" delay={600} compact={isMobile} />
    </div>
  );
}
