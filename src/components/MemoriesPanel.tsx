import { useState, useEffect } from 'react';

const memoriesData = {
  city: 'PARIS',
  icon: '🗼',
  diary: {
    title: 'Diary (日记)',
    emoji: '📔',
    contentEn: 'The crêpes were amazing!',
    contentZh: '可丽饼太好吃了！',
  },
  photos: {
    title: 'Photo Gallery (照片墙)',
    emoji: '🌅',
    images: [
      { id: 1, color: '#e8d5b7', label: 'Crepes' },
      { id: 2, color: '#7eb8c9', label: 'Eiffel' },
      { id: 3, color: '#c9a87c', label: 'Pastry' },
      { id: 4, color: '#6b9e7a', label: 'Park' },
      { id: 5, color: '#8ba5c4', label: 'Family' },
      { id: 6, color: '#d4a574', label: 'Food' },
    ],
  },
  mood: {
    title: 'Mood Tracker (情绪记录)',
    emoji: '🤩',
    moods: ['😀', '🤩', '😋', '🤔'],
  },
  topPicks: {
    title: 'Top Picks (热门推荐)',
    emoji: '⭐',
    picks: [
      { name: 'Best Ice Cream', icon: '🍦' },
      { name: 'Coolest Park', icon: '🌳' },
    ],
  },
};

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

export default function MemoriesPanel() {
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
          MEMORIES: {memoriesData.city} {memoriesData.icon}
        </h2>
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
          {memoriesData.diary.emoji} {memoriesData.diary.title}
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
          {memoriesData.diary.contentEn}
          <br />
          {memoriesData.diary.contentZh}
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
          {memoriesData.photos.emoji} {memoriesData.photos.title}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          {memoriesData.photos.images.map((img) => (
            <div
              key={img.id}
              style={{
                aspectRatio: '1',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${img.color}, ${img.color}dd)`,
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
              {/* Placeholder pattern */}
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
                {img.label}
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
          {memoriesData.mood.emoji} {memoriesData.mood.title}
        </h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
          {memoriesData.mood.moods.map((mood, i) => (
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
          {memoriesData.topPicks.emoji} {memoriesData.topPicks.title}
        </h3>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start' }}>
          {memoriesData.topPicks.picks.map((pick) => (
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
