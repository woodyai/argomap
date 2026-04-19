import { useState, useEffect } from 'react';
import type { Lang } from '../i18n/strings';

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

interface NavbarProps {
  lang?: Lang;
}

export default function Navbar({ lang = 'en' }: NavbarProps) {
  const isMobile = useIsMobile();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '10px 16px' : '16px 40px',
        background: 'linear-gradient(180deg, rgba(7,11,26,0.85) 0%, rgba(7,11,26,0.4) 70%, transparent 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
        <div
          style={{
            width: isMobile ? '32px' : '44px',
            height: isMobile ? '32px' : '44px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #5b9cf5, #1a4fa0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59,130,246,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <svg width={isMobile ? '20' : '28'} height={isMobile ? '20' : '28'} viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            <circle cx="14" cy="14" r="6" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <path d="M14 4 L15.5 10 L14 8 L12.5 10 Z" fill="#F59E0B" />
            <path d="M14 24 L15.5 18 L14 20 L12.5 18 Z" fill="rgba(255,255,255,0.5)" />
            <path d="M24 14 L18 15.5 L20 14 L18 12.5 Z" fill="rgba(255,255,255,0.5)" />
            <path d="M4 14 L10 15.5 L8 14 L10 12.5 Z" fill="rgba(255,255,255,0.5)" />
            <circle cx="14" cy="14" r="2" fill="white" opacity="0.9" />
          </svg>
          {!isMobile && [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: '#F59E0B',
                transform: `rotate(${deg}deg) translateY(-24px)`,
                opacity: deg % 90 === 0 ? 1 : 0.5,
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: isMobile ? '17px' : '22px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ArgoMap
        </span>
      </div>

      {/* Language Switcher (nav links hidden on mobile since only HOME exists) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        <a
          href="/zh"
          style={{
            color: lang === 'zh' ? '#ffffff' : 'rgba(255,255,255,0.5)',
            fontWeight: lang === 'zh' ? 700 : 400,
            cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '13px',
            padding: '4px 6px',
            transition: 'all 0.2s',
            textDecoration: lang === 'zh' ? 'underline' : 'none',
            textUnderlineOffset: '4px',
          }}
        >
          ZH
        </a>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <a
          href="/"
          style={{
            color: lang === 'en' ? '#ffffff' : 'rgba(255,255,255,0.5)',
            fontWeight: lang === 'en' ? 700 : 400,
            textDecoration: lang === 'en' ? 'underline' : 'none',
            textUnderlineOffset: '4px',
            cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '13px',
            padding: '4px 6px',
            transition: 'all 0.2s',
          }}
        >
          EN
        </a>
        {!isMobile && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <button
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                fontSize: '12px',
                padding: '4px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              {lang === 'zh' ? '解锁更多语言！' : 'Unlock new languages!'}
              <span style={{ fontSize: '14px', opacity: 0.8 }}>+</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
