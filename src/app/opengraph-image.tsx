import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

export const alt = 'Chebbi Trading';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const DEFAULT_LOGO = 'https://i.imgur.com/USEEiyC.png';

export default async function OGImage() {
  let logoUrl = DEFAULT_LOGO;
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: 'LOGO_URL' } });
    if (setting?.value) logoUrl = setting.value;
  } catch { }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
        }}
      >
        <img
          src={logoUrl}
          alt="Chebbi Trading"
          width={800}
          height={800}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size },
  );
}
