import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

async function ensureAndWrite(dir: string, filename: string, buffer: Buffer) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  await writeFile(join(dir, filename), buffer);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get file extension
    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf('.')) || '.png';

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}${extension}`;

    const cwd = process.cwd();

    // Primary path: project root public/ (dev mode + git tracked)
    const primaryDir = join(cwd, 'public', 'uploads', 'blog');
    await ensureAndWrite(primaryDir, uniqueFilename, buffer);

    // Secondary path: Next.js standalone public/ (production standalone mode)
    // The standalone server serves static files from .next/standalone/public/
    const standaloneDir = join(cwd, '.next', 'standalone', 'public', 'uploads', 'blog');
    if (existsSync(join(cwd, '.next', 'standalone'))) {
      await ensureAndWrite(standaloneDir, uniqueFilename, buffer);
    }

    // Return the public URL
    const publicUrl = `/uploads/blog/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
