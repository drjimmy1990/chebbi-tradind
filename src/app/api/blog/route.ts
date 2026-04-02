import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

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
      catColor = "rgba(16,185,129,.15)",
      catText = "#10b981",
    } = body;

    if (!titleFr || !contentFr) {
      return NextResponse.json(
        { error: "titleFr and contentFr are required at minimum" },
        { status: 400 }
      );
    }

    const article = await db.blogArticle.create({
      data: {
        titleFr, titleEn: titleEn || titleFr, titleAr: titleAr || titleFr,
        excerptFr: excerptFr || '', excerptEn: excerptEn || excerptFr || '', excerptAr: excerptAr || excerptFr || '',
        contentFr, contentEn: contentEn || contentFr, contentAr: contentAr || contentFr,
        category: category || 'analyse',
        catLabelFr: catLabelFr || 'Analyses', catLabelEn: catLabelEn || 'Analysis', catLabelAr: catLabelAr || 'تحليلات',
        date: date || new Date().toISOString().slice(0, 10),
        readTime: readTime || '5 min',
        emoji, catColor, catText,
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
      'date', 'readTime', 'emoji', 'catColor', 'catText', 'views',
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
