import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    // Save to project-root public/uploads/blog/ — this is always accessible
    // at runtime via the /api/files/ route regardless of standalone mode.
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    await writeFile(join(uploadDir, uniqueFilename), buffer);

    // Return URL via the /api/files/ route (works in both dev and standalone production)
    const publicUrl = `/api/files/blog/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
