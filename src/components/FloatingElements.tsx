export default function FloatingElements() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
      {/* Hot air balloon - top right */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: '22%',
          animation: 'float-drift 8s ease-in-out infinite',
          opacity: 0.75,
        }}
      >
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
          {/* Balloon envelope */}
          <ellipse cx="24" cy="20" rx="16" ry="20" fill="#ef7c6e" />
          <ellipse cx="24" cy="20" rx="16" ry="20" fill="url(#balloonGrad1)" />
          {/* Stripes */}
          <path d="M16 6 Q24 2 32 6 L30 36 Q24 40 18 36 Z" fill="rgba(255,255,255,0.15)" />
          {/* Ropes */}
          <line x1="18" y1="36" x2="20" y2="48" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
          <line x1="30" y1="36" x2="28" y2="48" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
          {/* Basket */}
          <rect x="19" y="48" width="10" height="7" rx="2" fill="#c4834a" />
          <rect x="19" y="48" width="10" height="2" rx="1" fill="#d4a06a" />
          <defs>
            <linearGradient id="balloonGrad1" x1="8" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Hot air balloon - left side */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '15%',
          animation: 'float-drift 10s ease-in-out infinite 2s',
          opacity: 0.6,
          transform: 'scale(0.7)',
        }}
      >
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
          <ellipse cx="24" cy="20" rx="16" ry="20" fill="#f0c040" />
          <ellipse cx="24" cy="20" rx="16" ry="20" fill="url(#balloonGrad2)" />
          <path d="M14 8 Q24 4 34 8 L32 36 Q24 40 16 36 Z" fill="rgba(255,255,255,0.1)" />
          <line x1="18" y1="36" x2="20" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="30" y1="36" x2="28" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <rect x="19" y="48" width="10" height="7" rx="2" fill="#a07040" />
          <defs>
            <linearGradient id="balloonGrad2" x1="8" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Striped balloon - top right area */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          right: '8%',
          animation: 'float-drift 12s ease-in-out infinite 4s',
          opacity: 0.5,
          transform: 'scale(0.55)',
        }}
      >
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
          <ellipse cx="24" cy="20" rx="16" ry="20" fill="#40c8e0" />
          <ellipse cx="24" cy="20" rx="16" ry="20" fill="url(#balloonGrad3)" />
          {/* Horizontal stripes */}
          <path d="M10 14 Q24 12 38 14 L38 16 Q24 14 10 16 Z" fill="#f0c040" opacity="0.6" />
          <path d="M10 22 Q24 20 38 22 L38 24 Q24 22 10 24 Z" fill="#f0c040" opacity="0.6" />
          <line x1="18" y1="36" x2="20" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="30" y1="36" x2="28" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <rect x="19" y="48" width="10" height="7" rx="2" fill="#8a6a4a" />
          <defs>
            <linearGradient id="balloonGrad3" x1="8" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Airplane */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '5%',
          animation: 'plane-fly 15s ease-in-out infinite',
          opacity: 0.55,
        }}
      >
        <svg width="32" height="18" viewBox="0 0 32 18" fill="none">
          {/* Fuselage */}
          <ellipse cx="14" cy="9" rx="13" ry="2.2" fill="white" opacity="0.7" />
          {/* Wing top */}
          <path d="M12 7 L8 2 L18 7 Z" fill="white" opacity="0.55" />
          {/* Wing bottom */}
          <path d="M12 11 L8 16 L18 11 Z" fill="white" opacity="0.45" />
          {/* Tail fin */}
          <path d="M26 7 L30 3 L30 7 Z" fill="white" opacity="0.5" />
        </svg>
        {/* Contrail */}
        <svg
          width="60"
          height="10"
          viewBox="0 0 60 10"
          style={{ position: 'absolute', right: '-50px', top: '6px' }}
          fill="none"
        >
          <path
            d="M0 5 Q15 3 30 5 T60 5"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.8"
            strokeDasharray="3 5"
            fill="none"
          />
        </svg>
      </div>

      {/* Lightning bolt - decorative */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '8%',
          opacity: 0.5,
          animation: 'float-drift 6s ease-in-out infinite 1s',
        }}
      >
        <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
          <path
            d="M18 0 L8 18 L14 18 L10 40 L24 16 L17 16 Z"
            fill="#F59E0B"
            opacity="0.7"
          />
          <path
            d="M18 0 L8 18 L14 18 L10 40 L24 16 L17 16 Z"
            fill="url(#lightningGrad)"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="lightningGrad" x1="10" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="white" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
