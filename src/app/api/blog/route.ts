import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";
import { slugify } from "@/lib/slugify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const data = await db.blogArticle.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    return NextResponse.json({ error: "Failed to fetch blog articles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const {
      titleFr, titleEn, titleAr,
      excerptFr, excerptEn, excerptAr,
      contentFr, contentEn, contentAr,
      category,
      catLabelFr, catLabelEn, catLabelAr,
      date, readTime,
      emoji = "📊",
      coverImage,
      catColor = "rgba(16,185,129,.15)",
      catText = "#10b981",
    } = body;

    if (!titleFr || !contentFr) {
      return NextResponse.json(
        { error: "titleFr and contentFr are required at minimum" },
        { status: 400 }
      );
    }

    // Auto-generate slug from French title
    let slug = slugify(titleFr);
    // Ensure uniqueness
    const existing = await db.blogArticle.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const article = await db.blogArticle.create({
      data: {
        slug,
        titleFr, titleEn: titleEn || titleFr, titleAr: titleAr || titleFr,
        excerptFr: excerptFr || '', excerptEn: excerptEn || excerptFr || '', excerptAr: excerptAr || excerptFr || '',
        contentFr, contentEn: contentEn || contentFr, contentAr: contentAr || contentFr,
        category: category || 'analyse',
        catLabelFr: catLabelFr || 'Analyses', catLabelEn: catLabelEn || 'Analysis', catLabelAr: catLabelAr || 'تحليلات',
        date: date || new Date().toISOString().slice(0, 10),
        readTime: readTime || '5 min',
        emoji, coverImage, catColor, catText,
      },
    });

    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog article:", error);
    return NextResponse.json({ error: "Failed to create blog article" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Build update data from all provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'titleFr', 'titleEn', 'titleAr',
      'excerptFr', 'excerptEn', 'excerptAr',
      'contentFr', 'contentEn', 'contentAr',
      'category', 'catLabelFr', 'catLabelEn', 'catLabelAr',
      'date', 'readTime', 'emoji', 'coverImage', 'catColor', 'catText', 'views', 'slug',
    ];
    for (const key of allowedFields) {
      if (fields[key] !== undefined) updateData[key] = fields[key];
    }

    const article = await db.blogArticle.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("Error updating blog article:", error);
    return NextResponse.json({ error: "Failed to update blog article" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.blogArticle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog article:", error);
    return NextResponse.json({ error: "Failed to delete blog article" }, { status: 500 });
  }
}
