import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public route — no auth required
// Returns site settings and testimonials in one call for the landing page
export async function GET() {
  try {
    const [settingsRaw, testimonials] = await Promise.all([
      db.siteSetting.findMany(),
      db.testimonial.findMany({ orderBy: [{ createdAt: "asc" }] }),
    ]);

    // Convert settings array to key-value map
    const settings: Record<string, string> = {};
    for (const s of settingsRaw) {
      settings[s.key] = s.value;
    }

    return NextResponse.json({ settings, testimonials });
  } catch (error) {
    console.error("Error fetching public data:", error);
    return NextResponse.json({ error: "Failed to fetch public data" }, { status: 500 });
  }
}
