import { useEffect, useState } from 'react';
import type { CityData } from '../types';
import Globe from './Globe';
import ArgoDotGlobe from './ArgoDotGlobe';
import StatsCounter from './StatsCounter';
import MemoriesPanel from './MemoriesPanel';
import ErrorBoundary from './ErrorBoundary';
import { strings, type Lang } from '../i18n/strings';

type GlobeMode = 'argo' | 'memory';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

function useGlobeMode(initial: GlobeMode = 'argo') {
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

interface MapExperienceProps {
  cities: CityData[];
  stats: { countries: number; cities: number; locations: number };
  lang?: Lang;
  initialCityId?: string;
}

const PANEL_WIDTH = 400;
const NAV_HEIGHT = 56;

function getCopy(lang: Lang) {
  return strings[lang];
}

function Hero({ copy, align = 'center' }: { copy: ReturnType<typeof getCopy>; align?: 'center' | 'left' }) {
  return (
    <div
      style={{
        textAlign: align,
        animation: 'argoFadeUp 0.9s ease both',
        fontFamily: 'var(--argo-fui)',
      }}
    >
      <div
        style={{
          fontSize: '9.5px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--argo-accent)',
          fontWeight: 500,
          marginBottom: '9px',
          opacity: 0.85,
        }}
      >
        {copy.heroEyebrow}
      </div>
      <h1
        style={{
          fontSize: 'clamp(24px, 3vw, 40px)',
          fontWeight: 300,
          letterSpacing: '-0.045em',
          color: 'var(--argo-t1)',
          lineHeight: 1.08,
          margin: 0,
        }}
      >
        {copy.heroLineA}
        <br />
        <strong style={{ fontWeight: 700 }}>{copy.heroLineB}</strong>
      </h1>
      <p
        style={{
          marginTop: '10px',
          fontSize: '12.5px',
          color: 'var(--argo-t2)',
          maxWidth: '300px',
          marginLeft: align === 'center' ? 'auto' : 0,
          marginRight: align === 'center' ? 'auto' : 0,
          lineHeight: 1.65,
        }}
      >
        {copy.heroLead}
      </p>
    </div>
  );
}

export default function MapExperience({ cities, stats, lang = 'en', initialCityId }: MapExperienceProps) {
  const initialId = cities.find((c) => c.id === initialCityId)?.id || cities[0]?.id || '';
  const [selectedCityId, setSelectedCityId] = useState(initialId);
  const globeMode = useGlobeMode('argo');
  const selectedCity = cities.find((c) => c.id === selectedCityId) || cities[0];
  const isMobile = useIsMobile();
  const copy = getCopy(lang);

  // Hide SSR fallback once mounted
  useEffect(() => {
    const fallback = document.getElementById('ssr-fallback');
    if (fallback) fallback.style.display = 'none';
  }, []);

  if (isMobile) {
    return (
      <div
        className="hide-scrollbar"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          paddingTop: `${NAV_HEIGHT + 12}px`,
          paddingBottom: '32px',
          overflowY: 'auto',
          gap: '14px',
          color: 'var(--argo-t1)',
        }}
      >
        <div style={{ padding: '0 18px', width: '100%' }}>
          <Hero copy={copy} align="center" />
        </div>

        <div style={{ width: '300px', height: '300px', flexShrink: 0, position: 'relative', marginTop: '8px' }}>
          <ErrorBoundary title="Globe failed to load">
            {globeMode === 'memory' ? (
              <Globe
                cities={cities}
                selectedCityId={selectedCityId}
                onCityClick={setSelectedCityId}
              />
            ) : (
              <ArgoDotGlobe
                cities={cities}
                selectedCityId={selectedCityId}
                onCityClick={setSelectedCityId}
                size={300}
                lang={lang}
              />
            )}
          </ErrorBoundary>
        </div>

        <div
          style={{
            fontSize: '9.5px',
            color: 'var(--argo-t3)',
            letterSpacing: '0.07em',
            fontFamily: 'var(--argo-fui)',
          }}
        >
          {copy.globeHint}
        </div>

        <div style={{ marginTop: '4px' }}>
          <StatsCounter
            countries={stats.countries}
            cities={stats.cities}
            locations={stats.locations}
            lang={lang}
          />
        </div>

        <div style={{ width: '100%', padding: '0 16px', marginTop: '4px' }}>
          {selectedCity && <MemoriesPanel city={selectedCity} lang={lang} fullWidth />}
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div
      style={{
        position: 'fixed',
        top: NAV_HEIGHT,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        zIndex: 10,
        color: 'var(--argo-t1)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          minWidth: 0,
          position: 'relative',
          gap: '14px',
        }}
      >
        <Hero copy={copy} align="center" />

        <div style={{ position: 'relative' }}>
          <div style={{ width: '480px', height: '480px', position: 'relative' }}>
            <ErrorBoundary title="Globe failed to load">
              {globeMode === 'memory' ? (
                <Globe
                  cities={cities}
                  selectedCityId={selectedCityId}
                  onCityClick={setSelectedCityId}
                />
              ) : (
                <ArgoDotGlobe
                  cities={cities}
                  selectedCityId={selectedCityId}
                  onCityClick={setSelectedCityId}
                  size={480}
                  lang={lang}
                />
              )}
            </ErrorBoundary>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-22px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '9.5px',
              color: 'var(--argo-t3)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.07em',
              fontFamily: 'var(--argo-fui)',
            }}
          >
            {copy.globeHint}
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <StatsCounter
            countries={stats.countries}
            cities={stats.cities}
            locations={stats.locations}
            lang={lang}
          />
        </div>
      </div>

      <div style={{ width: PANEL_WIDTH, height: '100%', flexShrink: 0 }}>
        {selectedCity && <MemoriesPanel city={selectedCity} lang={lang} />}
      </div>
    </div>
  );
}
