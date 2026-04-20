import { useEffect, useState } from 'react';
import { strings, type Lang } from '../i18n/strings';

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

type GlobeMode = 'argo' | 'memory';

interface NavbarProps {
  lang?: Lang;
}

const NAV_HEIGHT = 56;

function useGlobeModeBus(initial: GlobeMode = 'argo') {
  const [mode, setMode] = useState<GlobeMode>(initial);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ mode?: GlobeMode }>).detail;
      if (detail?.mode) setMode(detail.mode);
    };
    window.addEventListener('argomap:globe-mode', handler);
    return () => window.removeEventListener('argomap:globe-mode', handler);
  }, []);
  return mode;
}

function setGlobeMode(mode: GlobeMode) {
  window.dispatchEvent(new CustomEvent('argomap:globe-mode', { detail: { mode } }));
}

export default function Navbar({ lang = 'en' }: NavbarProps) {
  const isMobile = useIsMobile();
  const mode = useGlobeModeBus('argo');
  const isZh = lang === 'zh';
  const copy = strings[lang];

  const ctaLabel = isZh ? '开始记录' : 'Start Mapping';
  const altLangLabel = 'EN / 中文';

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: isMobile ? '0 14px' : '0 22px',
        background: 'rgba(6,9,18,0.55)',
        backdropFilter: 'var(--argo-blur)',
        WebkitBackdropFilter: 'var(--argo-blur)',
        borderBottom: '1px solid var(--argo-border)',
        fontFamily: 'var(--argo-fui)',
      }}
    >
      {/* Soft underline gradient (matches design) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -1,
          height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(91,159,255,0.18) 35%, rgba(245,167,66,0.14) 65%, transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <a
        href={isZh ? '/zh/' : '/'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            flexShrink: 0,
            background: 'radial-gradient(circle at 33% 33%, #3a72d8, #0b1748)',
            border: '1px solid rgba(100,160,255,0.4)',
            boxShadow: '0 0 14px rgba(70,120,255,0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: '18%',
              left: '10%',
              width: '75%',
              height: '28%',
              background: 'rgba(255,255,255,0.13)',
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--argo-t1)',
          }}
        >
          Argo<span style={{ color: 'var(--argo-accent)' }}>Map</span>
        </span>
      </a>

      {/* Centered breadcrumb — globe-mode switcher */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11.5px',
              color: 'var(--argo-t3)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--argo-border)',
              borderRadius: '20px',
              padding: '4px 6px 4px 12px',
            }}
          >
            <button
              type="button"
              onClick={() => setGlobeMode('argo')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                color: mode === 'argo' ? 'var(--argo-accent)' : 'var(--argo-t3)',
                fontWeight: mode === 'argo' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              {copy.navWorld}
            </button>
            <span style={{ opacity: 0.4 }}>›</span>
            <button
              type="button"
              onClick={() => setGlobeMode('memory')}
              style={{
                background: mode === 'memory' ? 'rgba(91,159,255,0.12)' : 'transparent',
                border: '1px solid',
                borderColor: mode === 'memory' ? 'rgba(91,159,255,0.28)' : 'transparent',
                borderRadius: '14px',
                padding: '2px 10px',
                font: 'inherit',
                color: mode === 'memory' ? 'var(--argo-accent)' : 'var(--argo-t2)',
                fontWeight: mode === 'memory' ? 500 : 400,
                cursor: 'pointer',
                transition: '0.18s',
              }}
            >
              {copy.navArgosWorld}
            </button>
          </div>
        </div>
      )}

      {isMobile && <div style={{ flex: 1 }} />}

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a
          href={isZh ? '/' : '/zh/'}
          style={{
            font: '500 11px/1 var(--argo-fui)',
            color: 'var(--argo-t2)',
            background: 'none',
            border: '1px solid var(--argo-border)',
            borderRadius: '8px',
            padding: '5px 11px',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: '0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--argo-border-hi)';
            e.currentTarget.style.color = 'var(--argo-t1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--argo-border)';
            e.currentTarget.style.color = 'var(--argo-t2)';
          }}
        >
          {altLangLabel}
        </a>
        {!isMobile && (
          <button
            type="button"
            style={{
              font: '600 11px/1 var(--argo-fui)',
              color: '#fff',
              background: 'var(--argo-accent)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: 'pointer',
              transition: '0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </nav>
  );
}
