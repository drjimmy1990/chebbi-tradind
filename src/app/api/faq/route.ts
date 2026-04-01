import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const data = await db.faq.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const {
      questionFr, questionEn, questionAr,
      answerFr, answerEn, answerAr,
      category, icon = 'help', order = 0,
    } = body;

    if (!questionFr || !answerFr) {
      return NextResponse.json(
        { error: "questionFr and answerFr are required" },
        { status: 400 }
      );
    }

    const faq = await db.faq.create({
      data: {
        questionFr, questionEn: questionEn || questionFr, questionAr: questionAr || questionFr,
        answerFr, answerEn: answerEn || answerFr, answerAr: answerAr || answerFr,
        category: category || 'gratuit',
        icon, order,
      },
    });

    return NextResponse.json({ data: faq }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
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
      'questionFr', 'questionEn', 'questionAr',
      'answerFr', 'answerEn', 'answerAr',
      'category', 'icon', 'order',
    ];
    for (const key of allowedFields) {
      if (fields[key] !== undefined) updateData[key] = fields[key];
    }

    const faq = await db.faq.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: faq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
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

    await db.faq.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
