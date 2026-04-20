import { useEffect, useMemo, useRef, useState } from 'react';
import type { CityData } from '../types';
import { strings, type Lang } from '../i18n/strings';
import GeoExplorerPanel from './GeoExplorerPanel';

type TabKey = 'diary' | 'photos' | 'mood' | 'places' | 'explore';

interface MemoriesPanelProps {
  city: CityData;
  lang: Lang;
  fullWidth?: boolean;
}

/** Maps common emoji glyphs to mood labels (English + Chinese). Unknowns fall back to generics. */
const EMOJI_MOOD_MAP: Record<string, { en: string; zh: string }> = {
  '🎢': { en: 'Thrill', zh: '刺激' },
  '🎡': { en: 'Wonder', zh: '奇幻' },
  '🎠': { en: 'Whimsy', zh: '童趣' },
  '🤩': { en: 'Joy', zh: '惊喜' },
  '😆': { en: 'Laughter', zh: '欢乐' },
  '😄': { en: 'Bright', zh: '明亮' },
  '😊': { en: 'Warmth', zh: '温暖' },
  '😍': { en: 'Love', zh: '心动' },
  '🥰': { en: 'Affection', zh: '柔软' },
  '✨': { en: 'Wonder', zh: '梦幻' },
  '🌟': { en: 'Sparkle', zh: '闪耀' },
  '🌅': { en: 'Calm', zh: '宁静' },
  '🌊': { en: 'Freedom', zh: '自由' },
  '🍜': { en: 'Comfort', zh: '满足' },
  '🍣': { en: 'Delight', zh: '细致' },
  '🏯': { en: 'Reverence', zh: '敬意' },
  '⛩️': { en: 'Stillness', zh: '宁定' },
  '🌸': { en: 'Beauty', zh: '美感' },
  '🍁': { en: 'Nostalgia', zh: '怀念' },
  '🌃': { en: 'Mystery', zh: '夜色' },
  '🏙️': { en: 'Energy', zh: '活力' },
  '🦦': { en: 'Curiosity', zh: '好奇' },
  '🦘': { en: 'Freedom', zh: '自由' },
};

const FALLBACK_MOODS: Array<{ en: string; zh: string }> = [
  { en: 'Vibe', zh: '氛围' },
  { en: 'Feel', zh: '感受' },
  { en: 'Pulse', zh: '律动' },
  { en: 'Echo', zh: '余韵' },
];

const MOOD_PALETTE = ['#5b9fff', '#9b72ff', '#f5a742', '#3fcfa0'];

const TAB_HEIGHT = 36;

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministically derive 4 mood bars from a city's emoji array + id. */
function deriveMoodBars(city: CityData, lang: Lang) {
  const baseValues = [0.92, 0.78, 0.62, 0.46];
  const seed = hashString(city.id);
  const moods = (city.mood.length ? city.mood : ['✨']).slice(0, 4);
  while (moods.length < 4) moods.push('✨');

  return moods.map((emoji, i) => {
    const map = EMOJI_MOOD_MAP[emoji];
    const fallback = FALLBACK_MOODS[i] || FALLBACK_MOODS[0];
    const labelObj = map || fallback;
    const label = lang === 'zh' ? labelObj.zh : labelObj.en;
    const wobble = ((seed >> (i * 2)) & 0xf) / 0xf - 0.5; // -0.5..0.5
    const v = Math.max(0.18, Math.min(0.98, baseValues[i] + wobble * 0.16));
    return {
      label,
      value: v,
      color: MOOD_PALETTE[i % MOOD_PALETTE.length],
      emoji,
    };
  });
}

function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: TabKey;
  label: string;
  active: boolean;
  onClick: (id: TabKey) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      style={{
        font: '500 10px/1 var(--argo-fui)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: active ? 'var(--argo-accent)' : 'var(--argo-t3)',
        padding: '11px 13px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        border: 'none',
        background: 'none',
        borderBottom: `2px solid ${active ? 'var(--argo-accent)' : 'transparent'}`,
        transition: '0.18s',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--argo-t2)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--argo-t3)';
      }}
    >
      {label}
    </button>
  );
}

function DiaryPane({ city, lang }: { city: CityData; lang: Lang }) {
  const copy = strings[lang];
  const text = lang === 'zh' ? city.diary.zh : city.diary.en;
  const dateLabel = city.visitDate === 'Home 🏠' ? copy.homeVisit : city.visitDate;
  return (
    <div style={{ padding: '16px 20px' }}>
      <div
        style={{
          fontSize: '9.5px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--argo-t3)',
          marginBottom: '10px',
        }}
      >
        {dateLabel}
      </div>
      <div
        style={{
          fontFamily: 'var(--argo-fser)',
          fontSize: '14.5px',
          lineHeight: 1.8,
          color: 'var(--argo-t2)',
          fontStyle: 'italic',
          padding: '14px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '14px',
          borderLeft: '2px solid var(--argo-accent-warm)',
          marginBottom: '12px',
        }}
      >
        {text}
      </div>
      <div
        style={{
          fontSize: '11.5px',
          color: 'var(--argo-t3)',
          background: 'rgba(255,255,255,0.025)',
          border: '1px dashed rgba(75,125,255,0.18)',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'text',
          transition: '0.2s',
          fontFamily: 'var(--argo-fui)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--argo-border-hi)';
          e.currentTarget.style.color = 'var(--argo-t2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(75,125,255,0.18)';
          e.currentTarget.style.color = 'var(--argo-t3)';
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        {copy.diaryAdd}
      </div>
    </div>
  );
}

function PhotosPane({ city, lang }: { city: CityData; lang: Lang }) {
  const copy = strings[lang];
  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '12px' }}>
        {city.photos.map((p, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '4 / 3',
              borderRadius: '8px',
              border: '1px solid var(--argo-border)',
              background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: '0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.borderColor = 'var(--argo-border-hi)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'var(--argo-border)';
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '5px 7px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                fontSize: '9.5px',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '0.04em',
                fontFamily: 'var(--argo-fui)',
              }}
            >
              {p.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: '11.5px',
          color: 'var(--argo-t3)',
          background: 'rgba(255,255,255,0.025)',
          border: '1px dashed rgba(75,125,255,0.18)',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontFamily: 'var(--argo-fui)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        {copy.photosAdd}
      </div>
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: '9px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--argo-t3)',
        fontWeight: 600,
        marginBottom: '10px',
        fontFamily: 'var(--argo-fui)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MoodPane({ city, lang, runId }: { city: CityData; lang: Lang; runId: number }) {
  const copy = strings[lang];
  const bars = useMemo(() => deriveMoodBars(city, lang), [city, lang]);
  const note = lang === 'zh' ? city.weatherTheme.zh : city.weatherTheme.en;

  return (
    <div style={{ padding: '16px 20px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '24px',
          opacity: 0.95,
        }}
      >
        {city.mood.map((e, i) => (
          <span key={`${e}-${i}`}>{e}</span>
        ))}
      </div>

      <SectionLabel>{copy.sectionMoodLabel}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '18px' }}>
        {bars.map((m, i) => (
          <div key={`${runId}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--argo-t2)',
                width: '76px',
                flexShrink: 0,
                fontFamily: 'var(--argo-fui)',
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                flex: 1,
                height: '2.5px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.round(m.value * 100)}%`,
                  background: m.color,
                  borderRadius: '2px',
                  animation: 'argoMoodFill 0.7s cubic-bezier(0.4,0,0.2,1) both',
                  transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '9.5px',
                color: 'var(--argo-t3)',
                width: '24px',
                textAlign: 'right',
                fontFamily: 'var(--argo-fui)',
              }}
            >
              {Math.round(m.value * 100)}
            </div>
          </div>
        ))}
      </div>

      <SectionLabel style={{ marginTop: '4px' }}>{copy.sectionMoodOverall}</SectionLabel>
      <div
        style={{
          fontFamily: 'var(--argo-fser)',
          fontStyle: 'italic',
          fontSize: '13px',
          lineHeight: 1.7,
          color: 'var(--argo-t2)',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid var(--argo-border)',
          borderRadius: '14px',
        }}
      >
        {note}
      </div>
    </div>
  );
}

function PlacesPane({ city, lang }: { city: CityData; lang: Lang }) {
  const copy = strings[lang];
  return (
    <div style={{ padding: '16px 20px' }}>
      <SectionLabel>{copy.sectionPlacesTop}</SectionLabel>
      <div>
        {city.places.map((p, i) => (
          <div
            key={`${p.name}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 11px',
              background: 'var(--argo-surface-2)',
              border: '1px solid var(--argo-border)',
              borderRadius: '14px',
              marginBottom: '7px',
              cursor: 'pointer',
              transition: '0.18s',
              fontFamily: 'var(--argo-fui)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--argo-border-hi)';
              e.currentTarget.style.background = 'rgba(18,28,68,0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--argo-border)';
              e.currentTarget.style.background = 'var(--argo-surface-2)';
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                flexShrink: 0,
                background: 'rgba(91,159,255,0.09)',
                border: '1px solid rgba(91,159,255,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
              }}
            >
              {p.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--argo-t1)' }}>
                {lang === 'zh' ? p.nameZh : p.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--argo-t3)', marginTop: '1px' }}>
                {p.category}
              </div>
            </div>
            <div style={{ color: 'var(--argo-t3)', fontSize: '14px' }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExplorePane({ city, lang }: { city: CityData; lang: Lang }) {
  return (
    <div style={{ padding: '16px 20px' }}>
      <GeoExplorerPanel city={city} lang={lang} />
    </div>
  );
}

const TABS: TabKey[] = ['diary', 'photos', 'mood', 'places', 'explore'];

export default function MemoriesPanel({ city, lang, fullWidth }: MemoriesPanelProps) {
  const copy = strings[lang];
  const [tab, setTab] = useState<TabKey>('diary');
  // moodRun forces the mood bars to re-animate when city or tab changes.
  const moodRunRef = useRef(0);
  const [moodRun, setMoodRun] = useState(0);
  useEffect(() => {
    moodRunRef.current += 1;
    setMoodRun(moodRunRef.current);
  }, [city.id, tab]);

  // Broadcast to navbar breadcrumb
  useEffect(() => {
    const cityName = lang === 'zh' ? city.nameZh : city.name;
    window.dispatchEvent(new CustomEvent('argomap:breadcrumb', { detail: { city: cityName } }));
  }, [city.id, lang]);

  const cityName = lang === 'zh' ? city.nameZh : city.name;
  const countryName = lang === 'zh' ? city.countryZh : city.country;
  const visitDate = city.visitDate === 'Home 🏠' ? copy.homeVisit : city.visitDate;

  const tabLabels: Record<TabKey, string> = {
    diary: copy.tabDiary,
    photos: copy.tabPhotos,
    mood: copy.tabMood,
    places: copy.tabPlaces,
    explore: copy.tabExplore,
  };

  return (
    <aside
      className="hide-scrollbar"
      style={{
        width: fullWidth ? '100%' : '400px',
        flexShrink: 0,
        height: fullWidth ? 'auto' : '100%',
        maxHeight: fullWidth ? undefined : '100%',
        borderLeft: fullWidth ? 'none' : '1px solid var(--argo-border)',
        borderTop: fullWidth ? '1px solid var(--argo-border)' : 'none',
        background: 'var(--argo-surface)',
        backdropFilter: 'var(--argo-blur)',
        WebkitBackdropFilter: 'var(--argo-blur)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'argoSlideInRight 0.5s ease both',
        fontFamily: 'var(--argo-fui)',
        color: 'var(--argo-t1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--argo-border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              flexShrink: 0,
              background: `radial-gradient(circle at 33% 33%, ${city.markerColor}, rgba(15,20,50,0.9))`,
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: `0 0 12px ${city.markerColor}55`,
              marginTop: '1px',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '21px',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
              }}
            >
              {cityName}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                marginTop: '4px',
                fontSize: '11.5px',
                color: 'var(--argo-t2)',
              }}
            >
              <span>{countryName}</span>
              {city.places.length > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'rgba(91,159,255,0.1)',
                    border: '1px solid rgba(91,159,255,0.2)',
                    borderRadius: '20px',
                    padding: '1px 8px',
                    fontSize: '9.5px',
                    color: 'var(--argo-accent)',
                    fontWeight: 500,
                  }}
                >
                  {city.places.length} {lang === 'zh' ? '处地点' : 'places'}
                </span>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '7px',
                fontSize: '10.5px',
                color: 'var(--argo-t3)',
              }}
            >
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--argo-accent-warm)',
                  flexShrink: 0,
                }}
              />
              <span>
                {copy.panelPeriodPrefix} {visitDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="hide-scrollbar"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--argo-border)',
          flexShrink: 0,
          overflowX: 'auto',
          height: TAB_HEIGHT,
        }}
      >
        {TABS.map((t) => (
          <TabButton key={t} id={t} label={tabLabels[t]} active={tab === t} onClick={setTab} />
        ))}
      </div>

      {/* Body */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {tab === 'diary' && <DiaryPane city={city} lang={lang} />}
        {tab === 'photos' && <PhotosPane city={city} lang={lang} />}
        {tab === 'mood' && <MoodPane city={city} lang={lang} runId={moodRun} />}
        {tab === 'places' && <PlacesPane city={city} lang={lang} />}
        {tab === 'explore' && <ExplorePane city={city} lang={lang} />}
      </div>
    </aside>
  );
}
