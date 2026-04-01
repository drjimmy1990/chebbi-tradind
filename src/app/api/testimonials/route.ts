import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const data = await db.testimonial.findMany({
      orderBy: [{ createdAt: "asc" }],
    });
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const {
      name, initials, stars = 5,
      titleFr, titleEn, titleAr,
      textFr, textEn, textAr,
    } = body;

    if (!name || !textFr) {
      return NextResponse.json({ error: "name and textFr are required" }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        name, initials: initials || name.split(' ').map((w: string) => w[0]).join(''),
        stars,
        titleFr: titleFr || '', titleEn: titleEn || titleFr || '', titleAr: titleAr || titleFr || '',
        textFr, textEn: textEn || textFr, textAr: textAr || textFr,
      },
    });

    return NextResponse.json({ data: testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'initials', 'stars',
      'titleFr', 'titleEn', 'titleAr',
      'textFr', 'textEn', 'textAr',
    ];
    for (const key of allowedFields) {
      if (fields[key] !== undefined) updateData[key] = fields[key];
    }

    const testimonial = await db.testimonial.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: testimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
