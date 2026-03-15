import { useState, useEffect } from 'react';
import type { CityData } from '../types';
import Globe from './Globe';
import StatsCounter from './StatsCounter';
import MemoriesPanel from './MemoriesPanel';

function useIsMobile(breakpoint = 768) {
  // Initialize with actual window width (client:only guarantees window exists)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

interface MapExperienceProps {
  cities: CityData[];
  stats: { countries: number; cities: number; locations: number };
}

export default function MapExperience({ cities, stats }: MapExperienceProps) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id || '');
  const selectedCity = cities.find(c => c.id === selectedCityId) || cities[0];
  const isMobile = useIsMobile();

  // Hide SSR fallback once this component mounts
  useEffect(() => {
    const fallback = document.getElementById('ssr-fallback');
    if (fallback) fallback.style.display = 'none';
  }, []);

  if (isMobile) {
    return (
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        paddingTop: '64px',
        paddingBottom: '32px',
        overflowY: 'auto',
        gap: '8px',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <h1 style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '24px',
            fontWeight: 900,
            letterSpacing: '3px',
            margin: 0,
            color: '#ffffff',
            textShadow: '0 0 60px rgba(59,130,246,0.25), 0 2px 10px rgba(0,0,0,0.5)',
          }}>
            EXPLORE ARGO'S MAP
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.45)',
            margin: '4px 0 0 0',
            letterSpacing: '2px',
          }}>
            A journey of growth and exploration
          </p>
        </div>

        {/* Globe */}
        <div style={{ width: '300px', height: '300px', flexShrink: 0 }}>
          <Globe
            cities={cities}
            selectedCityId={selectedCityId}
            onCityClick={setSelectedCityId}
          />
        </div>

        {/* Stats Counter */}
        <div style={{ flexShrink: 0, marginTop: '-8px' }}>
          <StatsCounter
            countries={stats.countries}
            cities={stats.cities}
            locations={stats.locations}
          />
        </div>

        {/* Memories Panel - inline below globe */}
        <div style={{ width: '100%', maxWidth: '360px', padding: '0 16px', marginTop: '8px' }}>
          {selectedCity && <MemoriesPanel city={selectedCity} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', height: '100vh', paddingTop: '56px' }}>
      {/* Center Column - Globe and Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingRight: '320px', height: '100%', gap: 0 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 20, flexShrink: 0 }}>
          <h1 style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '40px',
            fontWeight: 900,
            letterSpacing: '5px',
            margin: 0,
            color: '#ffffff',
            textShadow: '0 0 60px rgba(59,130,246,0.25), 0 2px 10px rgba(0,0,0,0.5)',
          }}>
            EXPLORE ARGO'S MAP
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.45)',
            margin: '6px 0 0 0',
            letterSpacing: '3px',
          }}>
            A journey of growth and exploration
          </p>
        </div>

        {/* Globe */}
        <div style={{ width: '480px', height: '480px', position: 'relative', flexShrink: 0, margin: '-8px 0' }}>
          <Globe
            cities={cities}
            selectedCityId={selectedCityId}
            onCityClick={setSelectedCityId}
          />
        </div>

        {/* Stats Counter */}
        <div style={{ position: 'relative', zIndex: 20, flexShrink: 0, marginTop: '-16px' }}>
          <StatsCounter
            countries={stats.countries}
            cities={stats.cities}
            locations={stats.locations}
          />
        </div>
      </div>

      {/* Right Panel - Memories */}
      <div style={{ position: 'fixed', right: '20px', top: '72px', bottom: '12px', zIndex: 50, display: 'flex', alignItems: 'flex-start' }}>
        {selectedCity && <MemoriesPanel city={selectedCity} />}
      </div>
    </div>
  );
}
