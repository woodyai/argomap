import { useState, useEffect } from 'react';
import type { CityData } from '../types';

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.3s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface MemoriesPanelProps {
  city: CityData;
}

export default function MemoriesPanel({ city }: MemoriesPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: '300px',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px',
        background: 'rgba(10, 15, 40, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h2
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '2px',
            margin: 0,
            color: '#ffffff',
          }}
        >
          MEMORIES: {city.name.toUpperCase()}
        </h2>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: '12px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.4)',
          margin: '4px 0 0 0',
        }}>
          {city.nameZh} · {city.countryZh} · {city.visitDate}
        </p>
      </div>

      {/* Diary */}
      <SectionCard>
        <h3
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: '#ffffff',
          }}
        >
          📔 Diary (日记)
        </h3>
        <p
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '16px',
            margin: 0,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.5,
          }}
        >
          {city.diary.en}
          <br />
          {city.diary.zh}
        </p>
      </SectionCard>

      {/* Photo Gallery */}
      <SectionCard>
        <h3
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            margin: '0 0 10px 0',
            color: '#ffffff',
          }}
        >
          🌅 Photo Gallery (照片墙)
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          {city.photos.map((photo, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${photo.color}, ${photo.color}dd)`,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {photo.label}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Mood Tracker */}
      <SectionCard>
        <h3
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            margin: '0 0 10px 0',
            color: '#ffffff',
          }}
        >
          🤩 Mood Tracker (情绪记录)
        </h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
          {city.mood.map((mood, i) => (
            <span
              key={i}
              style={{
                fontSize: '32px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {mood}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* Top Picks */}
      <SectionCard>
        <h3
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            margin: '0 0 10px 0',
            color: '#ffffff',
          }}
        >
          ⭐ Top Picks (热门推荐)
        </h3>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start' }}>
          {city.topPicks.map((pick) => (
            <div
              key={pick.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '36px' }}>{pick.icon}</span>
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                }}
              >
                {pick.name}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
