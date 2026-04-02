import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await db.blogArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment views
    await db.blogArticle.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("Error fetching blog article:", error);
    return NextResponse.json({ error: "Failed to fetch blog article" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth guard
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const { id } = await params;

    await db.blogArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog article:", error);
    return NextResponse.json({ error: "Failed to delete blog article" }, { status: 500 });
  }
}
