import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

export const alt = 'Chebbi Trading — Signaux Forex Gratuits';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const DEFAULT_LOGO = 'https://i.imgur.com/USEEiyC.png';

export default async function TwitterImage() {
  let logoUrl = DEFAULT_LOGO;
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: 'LOGO_URL' } });
    if (setting?.value) logoUrl = setting.value;
  } catch {
    // fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <img
          src={logoUrl}
          alt="Chebbi Trading"
          width={200}
          height={200}
          style={{ objectFit: 'contain', marginBottom: '30px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '48px', fontWeight: 800, color: '#10b981', letterSpacing: '-1px' }}>
            Chebbi Trading
          </div>
          <div style={{ fontSize: '22px', fontWeight: 500, color: '#94a3b8', letterSpacing: '0.5px' }}>
            Signaux Forex Gratuits • Partenaire XM
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, transparent, #10b981, transparent)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
