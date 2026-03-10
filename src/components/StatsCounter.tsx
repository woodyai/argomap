import { useEffect, useState, useRef } from 'react';

interface StatItemProps {
  icon: string;
  value: number;
  label: string;
  delay: number;
}

function StatItem({ icon, value, label, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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
        gap: '8px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '36px',
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
          fontSize: '13px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.5px',
          marginTop: '4px',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function StatsCounter() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        padding: '16px 40px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <StatItem icon="🌍" value={12} label="Countries" delay={200} />
      <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />
      <StatItem icon="🏙️" value={47} label="Cities" delay={400} />
      <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />
      <StatItem icon="📍" value={156} label="Locations" delay={600} />
    </div>
  );
}
