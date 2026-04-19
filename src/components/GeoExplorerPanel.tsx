import { useEffect, useMemo, useRef, useState } from 'react';
import type { CityData } from '../types';
import { strings, type Lang } from '../i18n/strings';

declare global {
  interface Window {
    google?: any;
  }
}

type StreetViewState = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';

const GOOGLE_MAPS_SCRIPT_ID = 'argomap-google-maps';
let googleMapsBootstrapPromise: Promise<any> | null = null;

function loadGoogleMapsApi(apiKey: string) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps requires a browser environment.'));
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google);
  }

  if (googleMapsBootstrapPromise) {
    return googleMapsBootstrapPromise;
  }

  googleMapsBootstrapPromise = new Promise((resolve, reject) => {
    const googleNamespace = (window.google ||= {});
    const mapsNamespace = (googleNamespace.maps ||= {});

    if (typeof mapsNamespace.importLibrary === 'function') {
      resolve(window.google);
      return;
    }

    const callbackName = '__argomapGoogleMapsInit';
    const params = new URLSearchParams({
      key: apiKey,
      v: 'beta',
      callback: `google.maps.${callbackName}`,
    });

    (mapsNamespace as Record<string, unknown>)[callbackName] = () => resolve(window.google);

    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?loading=async&${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsBootstrapPromise = null;
      reject(new Error('Failed to load Google Maps.'));
    };
    document.head.appendChild(script);
  });

  return googleMapsBootstrapPromise;
}

function getStreetViewUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

interface GeoExplorerPanelProps {
  city: CityData;
  lang: Lang;
}

export default function GeoExplorerPanel({ city, lang }: GeoExplorerPanelProps) {
  const copy = strings[lang];
  const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState(0);
  const [remotePlaceName, setRemotePlaceName] = useState<string | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [streetViewState, setStreetViewState] = useState<StreetViewState>('idle');
  const [streetViewLabel, setStreetViewLabel] = useState<string | null>(null);

  const mapHostRef = useRef<HTMLDivElement>(null);
  const mapRootRef = useRef<any>(null);
  const innerMapRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const activePlaceMarkerRef = useRef<any>(null);
  const threeDHostRef = useRef<HTMLDivElement>(null);
  const map3dRef = useRef<any>(null);
  const streetViewHostRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<any>(null);

  const activePlace = city.places[selectedPlaceIndex] || city.places[0];
  const activeCenter = useMemo(
    () => ({ lat: activePlace?.lat ?? city.lat, lng: activePlace?.lng ?? city.lng }),
    [activePlace, city.lat, city.lng],
  );

  useEffect(() => {
    setSelectedPlaceIndex(0);
    setRemotePlaceName(null);
  }, [city.id]);

  useEffect(() => {
    if (!apiKey || !mapHostRef.current) {
      return;
    }

    let cancelled = false;

    async function setupInteractiveMap() {
      try {
        setMapsError(null);
        await loadGoogleMapsApi(apiKey);
        const importLibrary = window.google?.maps?.importLibrary;
        if (typeof importLibrary !== 'function') {
          throw new Error('Google Maps loaded, but importLibrary() is unavailable.');
        }
        await importLibrary('places');
        const { InfoWindow } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');

        if (cancelled || !mapHostRef.current) {
          return;
        }

        mapHostRef.current.innerHTML = '';

        const gmpMap = document.createElement('gmp-map') as any;
        gmpMap.setAttribute('center', `${activeCenter.lat},${activeCenter.lng}`);
        gmpMap.setAttribute('zoom', '13');
        gmpMap.setAttribute('map-id', mapId);
        gmpMap.style.display = 'block';
        gmpMap.style.width = '100%';
        gmpMap.style.height = '100%';
        gmpMap.style.borderRadius = '18px';
        gmpMap.style.overflow = 'hidden';

        const autocomplete = document.createElement('gmp-basic-place-autocomplete') as any;
        autocomplete.setAttribute('slot', 'control-inline-start-block-start');
        autocomplete.setAttribute('placeholder', copy.searchPlaces);
        autocomplete.style.width = 'min(100% - 16px, 420px)';
        autocomplete.style.margin = '12px';
        autocomplete.style.borderRadius = '14px';
        autocomplete.style.boxShadow = '0 18px 50px rgba(2, 6, 23, 0.24)';
        autocomplete.style.colorScheme = 'light';
        gmpMap.appendChild(autocomplete);

        const placeDetails = document.createElement('gmp-place-details-compact') as any;
        placeDetails.setAttribute('orientation', 'horizontal');
        placeDetails.style.display = 'none';
        placeDetails.style.width = '360px';
        placeDetails.style.border = 'none';
        placeDetails.style.padding = '0';
        placeDetails.style.margin = '0';
        placeDetails.style.backgroundColor = 'transparent';
        placeDetails.style.colorScheme = 'light';
        placeDetails.innerHTML = `
          <gmp-place-details-place-request></gmp-place-details-place-request>
          <gmp-place-standard-content></gmp-place-standard-content>
        `;

        mapHostRef.current.appendChild(gmpMap);
        mapRootRef.current = gmpMap;

        await customElements.whenDefined('gmp-map');

        const map = gmpMap.innerMap;
        if (!map) {
          throw new Error('Failed to initialize the Google map.');
        }

        innerMapRef.current = map;
        map.setOptions({
          clickableIcons: false,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: true,
          zoomControl: true,
        });

        const infoWindow = new InfoWindow({
          minWidth: 320,
          disableAutoPan: false,
          headerDisabled: true,
          pixelOffset: new window.google.maps.Size(0, -12),
        });

        infoWindowRef.current = infoWindow;
        markersRef.current.forEach(marker => {
          if (typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        });
        markersRef.current = [];

        city.places.forEach((place, index) => {
          const marker = new window.google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map,
            title: lang === 'zh' ? place.nameZh : place.name,
            animation: index === 0 ? window.google.maps.Animation.DROP : undefined,
          });

          marker.addListener('click', () => {
            setSelectedPlaceIndex(index);
            setRemotePlaceName(null);
            infoWindow.close();
            infoWindow.setContent(`
              <div style="padding: 4px 2px 2px; max-width: 220px;">
                <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">${lang === 'zh' ? place.nameZh : place.name}</div>
                <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">${place.category}</div>
                <div style="font-size: 12px; line-height: 1.45; color: #0f172a;">${lang === 'zh' ? place.blurb.zh : place.blurb.en}</div>
              </div>
            `);
            infoWindow.open({ map, anchor: marker });
          });

          markersRef.current.push(marker);
        });

        const activePlaceMarker = new AdvancedMarkerElement({
          map,
          position: null,
          title: 'Selected Google place',
        });
        activePlaceMarkerRef.current = activePlaceMarker;

        autocomplete.locationBias = new window.google.maps.Circle({
          center: { lat: activeCenter.lat, lng: activeCenter.lng },
          radius: 12000,
        });

        autocomplete.addEventListener('gmp-select', (event: any) => {
          setRemotePlaceName(null);
          placeDetails.style.display = 'block';
          activePlaceMarker.position = null;
          infoWindow.close();
          const request = placeDetails.querySelector('gmp-place-details-place-request');
          if (request && event.place?.id) {
            request.place = event.place.id;
          }
        });

        placeDetails.addEventListener('gmp-load', () => {
          const selectedGooglePlace = placeDetails.place;
          const location = selectedGooglePlace?.location;
          const displayName = selectedGooglePlace?.displayName || selectedGooglePlace?.formattedAddress;

          if (!location) {
            return;
          }

          setRemotePlaceName(displayName || null);
          activePlaceMarker.position = location;
          infoWindow.setContent(placeDetails);
          infoWindow.open({ map, anchor: activePlaceMarker });
          map.setCenter(location);
          map.setZoom(15);
        });

        map.addListener('idle', () => {
          const center = map.getCenter();
          if (!center) {
            return;
          }

          autocomplete.locationBias = new window.google.maps.Circle({
            center: {
              lat: center.lat(),
              lng: center.lng(),
            },
            radius: 10000,
          });
        });

        map.addListener('click', () => {
          infoWindow.close();
        });
      } catch (error) {
        if (!cancelled) {
          setMapsError((error as Error).message || 'Failed to initialize Google Maps.');
        }
      }
    }

    setupInteractiveMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey, city.id, city.lat, city.lng, lang, copy.searchPlaces, mapId, activeCenter.lat, activeCenter.lng]);

  useEffect(() => {
    const map = innerMapRef.current;
    if (!map) {
      return;
    }

    map.panTo(activeCenter);
    map.setZoom(14);

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [activeCenter]);

  useEffect(() => {
    if (!apiKey || !threeDHostRef.current) {
      return;
    }

    let cancelled = false;

    async function setupThreeDMap() {
      try {
        await loadGoogleMapsApi(apiKey);
        const importLibrary = window.google?.maps?.importLibrary;
        if (typeof importLibrary !== 'function') {
          throw new Error('Google Maps loaded, but importLibrary() is unavailable.');
        }
        const { Map3DElement } = await importLibrary('maps3d');

        if (cancelled || !threeDHostRef.current) {
          return;
        }

        threeDHostRef.current.innerHTML = '';

        const map3d = new Map3DElement({
          center: { lat: activeCenter.lat, lng: activeCenter.lng, altitude: 280 },
          tilt: 67.5,
          heading: 15,
          range: 1800,
          mode: 'HYBRID',
          gestureHandling: 'COOPERATIVE',
          defaultUIDisabled: true,
        });

        map3d.style.display = 'block';
        map3d.style.width = '100%';
        map3d.style.height = '100%';
        map3d.style.borderRadius = '18px';
        threeDHostRef.current.appendChild(map3d);
        map3dRef.current = map3d;
      } catch (error) {
        if (!cancelled) {
          setMapsError((error as Error).message || 'Failed to initialize the 3D map.');
        }
      }
    }

    setupThreeDMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey, city.id]);

  useEffect(() => {
    if (!map3dRef.current) {
      return;
    }

    map3dRef.current.center = { lat: activeCenter.lat, lng: activeCenter.lng, altitude: 220 };
    map3dRef.current.range = 1400;
    map3dRef.current.heading = 20;
    map3dRef.current.tilt = 67.5;
  }, [activeCenter]);

  useEffect(() => {
    if (!apiKey) {
      setStreetViewState('idle');
      setStreetViewLabel(null);
      return;
    }

    if (!streetViewHostRef.current) {
      return;
    }

    let cancelled = false;

    async function syncStreetView() {
      try {
        setStreetViewState('loading');
        await loadGoogleMapsApi(apiKey);
        const importLibrary = window.google?.maps?.importLibrary;
        if (typeof importLibrary !== 'function') {
          throw new Error('Google Maps loaded, but importLibrary() is unavailable.');
        }
        const { StreetViewPanorama, StreetViewService } = await importLibrary('streetView');

        if (cancelled || !streetViewHostRef.current) {
          return;
        }

        if (!streetViewRef.current) {
          streetViewRef.current = new StreetViewPanorama(streetViewHostRef.current, {
            addressControl: false,
            fullscreenControl: false,
            linksControl: true,
            motionTracking: false,
            motionTrackingControl: false,
            panControl: true,
            showRoadLabels: true,
            visible: false,
            zoomControl: true,
          });
        }

        const panorama = streetViewRef.current;
        const streetViewService = new StreetViewService();

        const result = await new Promise<{ data: any; status: string }>((resolve) => {
          streetViewService.getPanorama(
            {
              location: activeCenter,
              radius: 120,
            },
            (data: any, status: string) => resolve({ data, status }),
          );
        });

        if (cancelled) {
          return;
        }

        if (result.status !== 'OK' || !result.data?.location) {
          panorama.setVisible(false);
          setStreetViewLabel(null);
          setStreetViewState('unavailable');
          return;
        }

        const heading = typeof result.data.tiles?.centerHeading === 'number' ? result.data.tiles.centerHeading : 0;
        panorama.setPano(result.data.location.pano);
        panorama.setPov({ heading, pitch: 0 });
        panorama.setZoom(0);
        panorama.setVisible(true);

        setStreetViewLabel(result.data.location.description || remotePlaceName || (lang === 'zh' ? activePlace.nameZh : activePlace.name));
        setStreetViewState('ready');
      } catch (error) {
        if (!cancelled) {
          streetViewRef.current?.setVisible(false);
          setStreetViewLabel(null);
          setStreetViewState('error');
          setMapsError((error as Error).message || 'Failed to initialize Street View.');
        }
      }
    }

    syncStreetView();

    return () => {
      cancelled = true;
    };
  }, [apiKey, activeCenter.lat, activeCenter.lng, activePlace.name, activePlace.nameZh, lang, remotePlaceName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              margin: 0,
              color: '#ffffff',
            }}
          >
            {copy.explore}
          </h3>
          <p
            style={{
              margin: '4px 0 0 0',
              color: 'rgba(255,255,255,0.48)',
              fontSize: '11px',
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.45,
            }}
          >
            {copy.zoomHint}
          </p>
        </div>

        <div style={{ display: 'inline-flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '999px' }}>
          {([
            ['2d', copy.map2d],
            ['3d', copy.map3d],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '8px 12px',
                background: mode === value ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: mode === value ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontSize: '12px',
                fontFamily: "'Nunito', sans-serif",
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '14px',
            minHeight: '118px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>
            {copy.selectedPlace}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
            <span style={{ fontSize: '18px' }}>{activePlace.icon}</span>
            <span>{lang === 'zh' ? activePlace.nameZh : activePlace.name}</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.68)', fontFamily: "'Inter', sans-serif" }}>
            {lang === 'zh' ? activePlace.blurb.zh : activePlace.blurb.en}
          </div>
          {remotePlaceName && (
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(147,197,253,0.92)', fontFamily: "'Inter', sans-serif" }}>
              Google: {remotePlaceName}
            </div>
          )}
          <div style={{ marginTop: '12px' }}>
            <a
              href={getStreetViewUrl(activeCenter.lat, activeCenter.lng)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#93c5fd',
                textDecoration: 'none',
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {copy.openStreetView}
            </a>
          </div>
        </div>

      </div>

      <div
        style={{
          position: 'relative',
          minHeight: '300px',
          borderRadius: '18px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(2,6,23,0.92))',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {!apiKey && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: '24px',
              gap: '12px',
              zIndex: 2,
              background: 'radial-gradient(circle at top, rgba(59,130,246,0.16), rgba(15,23,42,0.96) 68%)',
            }}
          >
            <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>
              {copy.setupMaps}
            </div>
            <div style={{ maxWidth: '480px', fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', fontFamily: "'Inter', sans-serif" }}>
              {copy.setupMapsHint}
            </div>
            <div style={{ fontSize: '11px', lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
              {copy.setupMapsFootnote}
            </div>
          </div>
        )}

        <div
          ref={mapHostRef}
          style={{
            display: mode === '2d' ? 'block' : 'none',
            width: '100%',
            height: '300px',
          }}
        />
        <div
          ref={threeDHostRef}
          style={{
            display: mode === '3d' ? 'block' : 'none',
            width: '100%',
            height: '300px',
          }}
        />
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif" }}>
              {copy.streetView}
            </div>
            <div style={{ marginTop: '4px', fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', fontFamily: "'Inter', sans-serif" }}>
              {copy.streetViewHint}
            </div>
          </div>
          {streetViewState === 'ready' && streetViewLabel && (
            <div style={{ fontSize: '11px', color: 'rgba(147,197,253,0.92)', fontFamily: "'Inter', sans-serif" }}>
              {copy.streetViewReady}: {streetViewLabel}
            </div>
          )}
        </div>

        {!apiKey ? (
          <div
            style={{
              minHeight: '240px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              gap: '10px',
              padding: '24px',
              background: 'radial-gradient(circle at top, rgba(59,130,246,0.12), rgba(15,23,42,0.9) 72%)',
            }}
          >
            <div style={{ fontSize: '15px', color: '#ffffff', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
              {copy.setupMaps}
            </div>
            <div style={{ maxWidth: '520px', fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', fontFamily: "'Inter', sans-serif" }}>
              {copy.setupMapsHint}
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', minHeight: '240px', background: 'rgba(2,6,23,0.72)' }}>
            <div
              ref={streetViewHostRef}
              style={{
                width: '100%',
                height: '240px',
                opacity: streetViewState === 'ready' ? 1 : 0.18,
                transition: 'opacity 0.24s ease',
              }}
            />

            {streetViewState !== 'ready' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '10px',
                  padding: '24px',
                  background: streetViewState === 'loading' ? 'rgba(2,6,23,0.36)' : 'rgba(2,6,23,0.76)',
                }}
              >
                <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                  {streetViewState === 'loading' ? copy.streetViewLoading : copy.streetView}
                </div>
                <div style={{ maxWidth: '520px', fontSize: '12px', lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', fontFamily: "'Inter', sans-serif" }}>
                  {streetViewState === 'loading'
                    ? copy.streetViewLoading
                    : streetViewState === 'unavailable'
                      ? copy.streetViewUnavailable
                      : mapsError || copy.streetViewUnavailable}
                </div>
                {(streetViewState === 'unavailable' || streetViewState === 'error') && (
                  <a
                    href={getStreetViewUrl(activeCenter.lat, activeCenter.lng)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '999px',
                      border: '1px solid rgba(147,197,253,0.45)',
                      color: '#bfdbfe',
                      textDecoration: 'none',
                      padding: '10px 14px',
                      fontSize: '12px',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {copy.openStreetView}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {mapsError && (
        <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
          {mapsError}
        </div>
      )}

      <div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontFamily: "'Inter', sans-serif" }}>
          {copy.nearbyPlaces}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {city.places.map((place, index) => {
            const selected = index === selectedPlaceIndex;

            return (
              <button
                key={place.name}
                type="button"
                onClick={() => {
                  setSelectedPlaceIndex(index);
                  setRemotePlaceName(null);
                }}
                style={{
                  border: selected ? '1px solid rgba(147,197,253,0.8)' : '1px solid rgba(255,255,255,0.12)',
                  background: selected ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
                  color: selected ? '#ffffff' : 'rgba(255,255,255,0.75)',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minWidth: '120px',
                }}
              >
                <div style={{ fontSize: '11px', color: selected ? 'rgba(219,234,254,0.9)' : 'rgba(255,255,255,0.46)', fontFamily: "'Inter', sans-serif" }}>
                  {place.icon} {place.category}
                </div>
                <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                  {lang === 'zh' ? place.nameZh : place.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
