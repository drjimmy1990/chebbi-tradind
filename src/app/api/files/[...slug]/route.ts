import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  // Only allow serving from uploads directory (security: no path traversal)
  const safeParts = slug.map((p) => p.replace(/\.\./g, ''));
  const filePath = join(process.cwd(), 'public', 'uploads', ...safeParts);

  if (!existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const ext = (safeParts[safeParts.length - 1].split('.').pop() || 'jpg').toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';

    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('Error reading file', { status: 500 });
  }
}
