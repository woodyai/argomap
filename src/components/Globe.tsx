import { useRef, useMemo, Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { CityData } from '../types';

const RADIUS = 1.8;

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function latLngToStaticPosition(lat: number, lng: number) {
  return {
    left: `${((lng + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  };
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function isLikelyMobileDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function CityMarker({ lat, lng, color, radius, isSelected, onClick, isMobile }: {
  lat: number; lng: number; color: string; radius: number;
  isSelected?: boolean; onClick?: () => void;
  isMobile?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVec3(lat, lng, radius), [lat, lng, radius]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const base = isSelected ? 1.6 : 1;
      const scale = base + Math.sin(clock.elapsedTime * 3 + lat) * 0.3;
      ref.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const glowBase = isSelected ? 2.0 : 1.5;
      const glowScale = glowBase + Math.sin(clock.elapsedTime * 2 + lng) * 0.5;
      glowRef.current.scale.setScalar(glowScale);
      const opBase = isSelected ? 0.4 : 0.25;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = opBase + Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });

  const handleClick = useCallback((e: ThreeEvent<MouseEvent | PointerEvent>) => {
    e.stopPropagation();
    onClick?.();
  }, [onClick]);

  return (
    <group position={pos}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[isSelected ? 0.08 : 0.06, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : color} transparent opacity={0.2} />
      </mesh>
      <mesh
        ref={ref}
        onClick={handleClick}
        onPointerDown={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[isSelected ? (isMobile ? 0.055 : 0.038) : (isMobile ? 0.045 : 0.028), 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : color} />
      </mesh>
      {isMobile && (
        <mesh onClick={handleClick} onPointerDown={handleClick}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/** Loads texture via useLoader (Suspense) — texture guaranteed available before render */
function EarthSphere({ isMobile }: { isMobile: boolean }) {
  const texture = useLoader(THREE.TextureLoader, '/textures/earth_day.jpg');
  const meshRef = useRef<THREE.Mesh>(null);

  // Create material imperatively to guarantee map is set at construction
  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    return mat;
  }, [texture]);

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[RADIUS, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
    </mesh>
  );
}

interface EarthProps {
  cities: CityData[];
  selectedCityId: string;
  onCityClick: (id: string) => void;
  isMobile: boolean;
}

function Earth({ cities, selectedCityId, onCityClick, isMobile }: EarthProps) {
  const earthRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const atmosphereRef2 = useRef<THREE.Mesh>(null);
  const segments = isMobile ? 32 : 64;

  useFrame(({ clock }) => {
    if (earthRef.current) {
      // Rotate to show Asia/Australia initially (~100°E longitude)
      earthRef.current.rotation.y = 3.0 + clock.elapsedTime * 0.05;
      earthRef.current.rotation.x = 0.15;
      const heartbeat = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.008;
      earthRef.current.scale.setScalar(heartbeat);
    }
    if (atmosphereRef.current) {
      const glow = 0.15 + Math.sin(clock.elapsedTime * 1.5) * 0.05;
      (atmosphereRef.current.material as THREE.MeshBasicMaterial).opacity = glow;
    }
    if (atmosphereRef2.current) {
      const glow = 0.06 + Math.sin(clock.elapsedTime * 1.2 + 1) * 0.03;
      (atmosphereRef2.current.material as THREE.MeshBasicMaterial).opacity = glow;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Outer atmosphere glow */}
      <mesh ref={atmosphereRef2}>
        <sphereGeometry args={[RADIUS * 1.15, segments, segments]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Inner atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[RADIUS * 1.06, segments, segments]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      {/* Earth sphere — loaded via Suspense to guarantee texture availability */}
      <Suspense fallback={
        <Sphere args={[RADIUS, 32, 32]}>
          <meshBasicMaterial color="#1a5a9a" />
        </Sphere>
      }>
        <EarthSphere isMobile={isMobile} />
      </Suspense>

      {/* City markers */}
      {cities.map((city) => (
        <CityMarker
          key={city.id}
          lat={city.lat}
          lng={city.lng}
          color={city.markerColor}
          radius={RADIUS + 0.02}
          isSelected={city.id === selectedCityId}
          onClick={() => onCityClick(city.id)}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
}

function StaticGlobeFallback({ cities, selectedCityId, onCityClick }: GlobeProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ position: 'relative', width: '88%', height: '88%' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          background: "radial-gradient(circle at 35% 35%, rgba(147,197,253,0.4), rgba(15,23,42,0.08) 38%), url('/textures/earth_day.jpg') center / cover no-repeat",
          boxShadow: '0 0 50px rgba(59,130,246,0.2), inset 0 0 35px rgba(15,23,42,0.45)',
          border: '1px solid rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute',
          inset: '-6%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 50%, transparent 72%)',
          pointerEvents: 'none',
        }} />
        {cities.map((city) => {
          const pos = latLngToStaticPosition(city.lat, city.lng);
          const isSelected = city.id === selectedCityId;

          return (
            <button
              key={city.id}
              type="button"
              aria-label={city.name}
              onClick={() => onCityClick(city.id)}
              style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                transform: 'translate(-50%, -50%)',
                width: isSelected ? '14px' : '10px',
                height: isSelected ? '14px' : '10px',
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                background: isSelected ? '#ffffff' : city.markerColor,
                boxShadow: `0 0 ${isSelected ? '16px' : '10px'} ${city.markerColor}`,
                cursor: 'pointer',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface GlobeProps {
  cities: CityData[];
  selectedCityId: string;
  onCityClick: (id: string) => void;
}

export default function Globe({ cities, selectedCityId, onCityClick }: GlobeProps) {
  const [canUseWebGL, setCanUseWebGL] = useState<boolean | null>(null);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const isMobile = useMemo(() => isLikelyMobileDevice(), []);

  useEffect(() => {
    setCanUseWebGL(isWebGLAvailable());
  }, []);

  if (canUseWebGL === false || canvasFailed) {
    return (
      <StaticGlobeFallback
        cities={cities}
        selectedCityId={selectedCityId}
        onCityClick={onCityClick}
      />
    );
  }

  if (canUseWebGL === null) {
    return (
      <div style={{ width: '100%', height: '100%' }} />
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0.2, 5.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        flat={true}
        onCreated={({ gl }) => {
          try {
            gl.outputColorSpace = THREE.LinearSRGBColorSpace;
          } catch (error) {
            console.error('Canvas initialization failed:', error);
            setCanvasFailed(true);
          }
        }}
        fallback={<StaticGlobeFallback cities={cities} selectedCityId={selectedCityId} onCityClick={onCityClick} />}
        onPointerMissed={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <Earth cities={cities} selectedCityId={selectedCityId} onCityClick={onCityClick} isMobile={isMobile} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={8}
          autoRotate={false}
          rotateSpeed={0.5}
          zoomSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
