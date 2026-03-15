import { useRef, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
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

function CityMarker({ lat, lng, color, radius, isSelected, onClick }: {
  lat: number; lng: number; color: string; radius: number;
  isSelected?: boolean; onClick?: () => void;
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

  const handleClick = useCallback((e: any) => {
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
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[isSelected ? 0.038 : 0.028, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : color} />
      </mesh>
    </group>
  );
}

/** Loads texture via useLoader (Suspense) — texture guaranteed available before render */
function EarthSphere() {
  const texture = useLoader(THREE.TextureLoader, '/textures/earth_day.jpg');
  const meshRef = useRef<THREE.Mesh>(null);

  // Create material imperatively to guarantee map is set at construction
  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    return mat;
  }, [texture]);

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
    </mesh>
  );
}

interface EarthProps {
  cities: CityData[];
  selectedCityId: string;
  onCityClick: (id: string) => void;
}

function Earth({ cities, selectedCityId, onCityClick }: EarthProps) {
  const earthRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const atmosphereRef2 = useRef<THREE.Mesh>(null);

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
        <sphereGeometry args={[RADIUS * 1.15, 64, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Inner atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[RADIUS * 1.06, 64, 64]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      {/* Earth sphere — loaded via Suspense to guarantee texture availability */}
      <Suspense fallback={
        <Sphere args={[RADIUS, 32, 32]}>
          <meshBasicMaterial color="#1a5a9a" />
        </Sphere>
      }>
        <EarthSphere />
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
        />
      ))}
    </group>
  );
}

interface GlobeProps {
  cities: CityData[];
  selectedCityId: string;
  onCityClick: (id: string) => void;
}

export default function Globe({ cities, selectedCityId, onCityClick }: GlobeProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0.2, 5.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        flat={true}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.LinearSRGBColorSpace;
        }}
      >
        <Earth cities={cities} selectedCityId={selectedCityId} onCityClick={onCityClick} />

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
