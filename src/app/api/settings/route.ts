import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const data = await db.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    // Convert to key-value object
    const settings: Record<string, string> = {};
    for (const s of data) {
      settings[s.key] = s.value;
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Auth guard
  const session = await requireAuth(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "key and value are required" },
        { status: 400 }
      );
    }

    const setting = await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ data: setting });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
