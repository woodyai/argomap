import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// City marker data
const cityMarkers = [
  { id: 'beijing', name: 'Beijing', lat: 39.9042, lng: 116.4074, color: '#F59E0B' },
  { id: 'shanghai', name: 'Shanghai', lat: 31.2304, lng: 121.4737, color: '#F59E0B' },
  { id: 'hong-kong', name: 'Hong Kong', lat: 22.3193, lng: 114.1694, color: '#F59E0B' },
  { id: 'macau', name: 'Macau', lat: 22.1987, lng: 113.5439, color: '#F59E0B' },
  { id: 'osaka', name: 'Osaka', lat: 34.6937, lng: 135.5023, color: '#EF4444' },
  { id: 'kyoto', name: 'Kyoto', lat: 35.0116, lng: 135.7681, color: '#EF4444' },
  { id: 'paris', name: 'Paris', lat: 48.8566, lng: 2.3522, color: '#EF4444' },
  { id: 'london', name: 'London', lat: 51.5074, lng: -0.1278, color: '#EF4444' },
  { id: 'new-york', name: 'New York', lat: 40.7128, lng: -74.0060, color: '#EF4444' },
  { id: 'sydney', name: 'Sydney', lat: -33.8688, lng: 151.2093, color: '#F59E0B' },
  { id: 'dubai', name: 'Dubai', lat: 25.2048, lng: 55.2708, color: '#F59E0B' },
  { id: 'rome', name: 'Rome', lat: 41.9028, lng: 12.4964, color: '#EF4444' },
];

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

function CityMarker({ lat, lng, color, radius }: {
  lat: number; lng: number; color: string; radius: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVec3(lat, lng, radius), [lat, lng, radius]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3 + lat) * 0.3;
      ref.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const glowScale = 1.5 + Math.sin(clock.elapsedTime * 2 + lng) * 0.5;
      glowRef.current.scale.setScalar(glowScale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color={color} />
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

function Earth() {
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
      {cityMarkers.map((city) => (
        <CityMarker
          key={city.id}
          lat={city.lat}
          lng={city.lng}
          color={city.color}
          radius={RADIUS + 0.02}
        />
      ))}
    </group>
  );
}

export default function Globe() {
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
        <Earth />

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
