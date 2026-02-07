import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'NeuroBlend - Café pour esprits neuroatypiques';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #6B46C1 0%, #553C9A 50%, #4338CA 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Coffee icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            fontSize: 40,
          }}
        >
          ☕
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          NeuroBlend
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 32,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Café pour esprits neuroatypiques
        </div>

        {/* Badges */}
        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          {['HPI', 'ADHD', 'Hypersensible'].map((label) => (
            <div
              key={label}
              style={{
                padding: '8px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
