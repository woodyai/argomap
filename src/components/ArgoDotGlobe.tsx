import { useEffect, useMemo, useRef } from 'react';
import type { CityData } from '../types';

interface ArgoDotGlobeProps {
  cities: CityData[];
  selectedCityId: string;
  onCityClick: (id: string) => void;
  size?: number;
  lang?: 'en' | 'zh';
  /** Initial Y-axis rotation in radians. Defaults to face the average city longitude. */
  initialRotation?: number;
}

export default function ArgoDotGlobe({
  cities,
  selectedCityId,
  onCityClick,
  size = 480,
  lang = 'en',
  initialRotation,
}: ArgoDotGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  // Default rotation aims the average city longitude toward the viewer.
  const computedInitial = useMemo(() => {
    if (typeof initialRotation === 'number') return initialRotation;
    if (!cities.length) return 1.5;
    const avgLng = cities.reduce((s, c) => s + c.lng, 0) / cities.length;
    return Math.PI / 2 - (avgLng * Math.PI) / 180;
  }, [cities, initialRotation]);
  const stateRef = useRef({
    rotY: computedInitial,
    tilt: 0.23,
    drag: false,
    lx: 0,
    spin: true,
    hov: null as CityData | null,
    raf: 0,
  });
  const citiesRef = useRef(cities);
  const selRef = useRef(selectedCityId);
  const onClickRef = useRef(onCityClick);
  const langRef = useRef(lang);

  citiesRef.current = cities;
  selRef.current = selectedCityId;
  onClickRef.current = onCityClick;
  langRef.current = lang;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const tip = tipRef.current;
    const st = stateRef.current;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const W = size;
    canvas.width = W * dpr;
    canvas.height = W * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${W}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const x0 = W / 2;
    const y0 = W / 2;
    const R = W * 0.4;

    const proj = (lat: number, lng: number) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = (lng * Math.PI) / 180 + st.rotY;
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      const y2 = y * Math.cos(st.tilt) - z * Math.sin(st.tilt);
      const z2 = y * Math.sin(st.tilt) + z * Math.cos(st.tilt);
      return { sx: x * R + x0, sy: y2 * R + y0, z: z2 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, W);

      // Outer atmosphere
      let g = ctx.createRadialGradient(x0, y0, R * 0.85, x0, y0, R * 1.2);
      g.addColorStop(0, 'rgba(55,105,255,.10)');
      g.addColorStop(0.5, 'rgba(25,65,200,.04)');
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x0, y0, R * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Globe body
      g = ctx.createRadialGradient(x0 - R * 0.22, y0 - R * 0.22, 0, x0, y0, R);
      g.addColorStop(0, '#0c1a46');
      g.addColorStop(0.55, '#080f2d');
      g.addColorStop(1, '#04081a');
      ctx.beginPath();
      ctx.arc(x0, y0, R, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Dotted grid (clipped to sphere)
      ctx.save();
      ctx.beginPath();
      ctx.arc(x0, y0, R, 0, Math.PI * 2);
      ctx.clip();
      const step = 7;
      for (let la = -80; la <= 80; la += step) {
        for (let lo = -180; lo < 180; lo += step) {
          const p = proj(la, lo);
          if (p.z <= 0) continue;
          const al = Math.pow(p.z, 0.4) * 0.45;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(85,148,255,${al * 0.85})`;
          ctx.fill();
        }
      }
      // Highlight
      g = ctx.createRadialGradient(x0 - R * 0.25, y0 - R * 0.25, 0, x0, y0, R);
      g.addColorStop(0, 'rgba(110,160,255,.09)');
      g.addColorStop(0.4, 'transparent');
      g.addColorStop(1, 'rgba(0,0,30,.32)');
      ctx.fillStyle = g;
      ctx.fillRect(x0 - R, y0 - R, R * 2, R * 2);
      ctx.restore();

      // Rim
      ctx.beginPath();
      ctx.arc(x0, y0, R, 0, Math.PI * 2);
      const rim = ctx.createLinearGradient(x0 - R, y0 - R, x0 + R, y0 + R);
      rim.addColorStop(0, 'rgba(110,175,255,.42)');
      rim.addColorStop(0.5, 'rgba(55,100,200,.2)');
      rim.addColorStop(1, 'rgba(25,50,140,.08)');
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // City pins
      const cs = citiesRef.current;
      const sel = selRef.current;
      cs.forEach((city) => {
        const p = proj(city.lat, city.lng);
        if (p.z < -0.08) return;
        const vis = Math.min(1, (p.z + 0.08) * 2.5);
        const isSel = city.id === sel;
        const isHov = st.hov?.id === city.id;
        const col = isSel ? '245,167,66' : '91,159,255';
        const sz = isSel ? 5.5 : isHov ? 4.5 : 2.8;

        if (isSel || isHov) {
          const gr = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, 16);
          gr.addColorStop(0, `rgba(${col},.38)`);
          gr.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 16, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();
        }
        if (isSel) {
          const pulse = (Math.sin(Date.now() / 380) + 1) / 2;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 9 + pulse * 5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245,167,66,${0.5 - pulse * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${vis})`;
        ctx.fill();
      });
    };

    const hit = (mx: number, my: number) => {
      let best: CityData | null = null;
      let md = 22;
      citiesRef.current.forEach((c) => {
        const p = proj(c.lat, c.lng);
        if (p.z < -0.05) return;
        const d = Math.hypot(p.sx - mx, p.sy - my);
        if (d < md) {
          md = d;
          best = c;
        }
      });
      return best;
    };

    const anim = () => {
      if (st.spin && !st.drag) st.rotY += 0.003;
      draw();
      st.raf = requestAnimationFrame(anim);
    };

    const localPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      return [t.clientX - r.left, t.clientY - r.top];
    };

    const onDown = (e: MouseEvent) => {
      st.drag = true;
      st.lx = e.clientX;
      st.spin = false;
      canvas.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (st.drag) {
        st.rotY += (e.clientX - st.lx) * 0.006;
        st.lx = e.clientX;
        return;
      }
      const [mx, my] = localPos(e);
      const h = hit(mx, my);
      st.hov = h;
      canvas.style.cursor = h ? 'pointer' : 'grab';
      if (tip) {
        if (h) {
          const cityName = langRef.current === 'zh' ? h.nameZh : h.name;
          tip.textContent = cityName;
          tip.style.display = 'block';
          tip.style.left = `${e.clientX}px`;
          tip.style.top = `${e.clientY}px`;
        } else {
          tip.style.display = 'none';
        }
      }
    };
    const onUp = () => {
      if (st.drag) {
        st.drag = false;
        canvas.style.cursor = st.hov ? 'pointer' : 'grab';
        setTimeout(() => {
          st.spin = true;
        }, 3000);
      }
    };
    const onClick = (e: MouseEvent) => {
      const [mx, my] = localPos(e);
      const h = hit(mx, my);
      if (h) onClickRef.current(h.id);
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      st.drag = true;
      st.lx = e.touches[0].clientX;
      st.spin = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (st.drag) {
        st.rotY += (e.touches[0].clientX - st.lx) * 0.006;
        st.lx = e.touches[0].clientX;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      st.drag = false;
      // Tap: detect tap target via changedTouches
      const t = e.changedTouches[0];
      if (t) {
        const r = canvas.getBoundingClientRect();
        const mx = t.clientX - r.left;
        const my = t.clientY - r.top;
        const h = hit(mx, my);
        if (h) onClickRef.current(h.id);
      }
      setTimeout(() => {
        st.spin = true;
      }, 3000);
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    canvas.style.cursor = 'grab';
    anim();

    return () => {
      cancelAnimationFrame(st.raf);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [size]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div
        ref={tipRef}
        style={{
          position: 'fixed',
          zIndex: 200,
          pointerEvents: 'none',
          display: 'none',
          background: 'var(--argo-surface-2)',
          border: '1px solid var(--argo-border-hi)',
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--argo-t1)',
          fontFamily: 'var(--argo-fui)',
          transform: 'translate(-50%, -130%)',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(8px)',
        }}
      />
    </div>
  );
}
