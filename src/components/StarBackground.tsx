import { useEffect, useRef } from 'react';

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: { x: number; y: number; r: number; alpha: number; speed: number; twinkleSpeed: number; twinklePhase: number }[] = [];
    let shootingStars: { x: number; y: number; length: number; speed: number; alpha: number; angle: number; life: number; maxLife: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      const count = Math.floor((canvas!.width * canvas!.height) / 2500);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 1.8 + 0.2,
          alpha: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.0005 + 0.0002,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function spawnShootingStar() {
      if (shootingStars.length < 2 && Math.random() < 0.003) {
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        shootingStars.push({
          x: Math.random() * canvas!.width * 0.7,
          y: Math.random() * canvas!.height * 0.3,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 6 + 4,
          alpha: 1,
          angle,
          life: 0,
          maxLife: 60 + Math.random() * 30,
        });
      }
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Draw nebula glow regions
      const gradient1 = ctx!.createRadialGradient(
        canvas!.width * 0.2, canvas!.height * 0.3, 0,
        canvas!.width * 0.2, canvas!.height * 0.3, canvas!.width * 0.3
      );
      gradient1.addColorStop(0, 'rgba(59, 130, 246, 0.03)');
      gradient1.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx!.fillStyle = gradient1;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      const gradient2 = ctx!.createRadialGradient(
        canvas!.width * 0.8, canvas!.height * 0.7, 0,
        canvas!.width * 0.8, canvas!.height * 0.7, canvas!.width * 0.25
      );
      gradient2.addColorStop(0, 'rgba(139, 92, 246, 0.025)');
      gradient2.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx!.fillStyle = gradient2;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      // Draw stars
      for (const star of stars) {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
        const alpha = star.alpha * (0.4 + 0.6 * twinkle);

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.fill();

        // Add glow for larger stars
        if (star.r > 1.2) {
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(200, 220, 255, ${alpha * 0.1})`;
          ctx!.fill();
        }
      }

      // Shooting stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        const fadeIn = Math.min(s.life / 10, 1);
        const fadeOut = Math.max(1 - (s.life - s.maxLife * 0.7) / (s.maxLife * 0.3), 0);
        s.alpha = fadeIn * fadeOut;

        if (s.life > s.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;
        const grad = ctx!.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.alpha * 0.8})`);

        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        // Head glow
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx!.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
