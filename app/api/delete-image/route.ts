import { adminStorage } from "@/lib/firebase/admin-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    // Firebase Storage download URLs look like:
    // https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/userProfile%2Fabc123.jpg?alt=media&token=...
    // We need to extract the path between /o/ and ?
    const matches = url.match(/\/o\/(.+?)\?/);
    if (!matches?.[1]) {
      return NextResponse.json({ error: "Could not parse storage path from URL" }, { status: 400 });
    }

    const filePath = decodeURIComponent(matches[1]); // "userProfile/abc123.jpg"

    await adminStorage.file(filePath).delete();

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Delete image error:", err);
    return NextResponse.json({ error: err.message ?? "Delete failed" }, { status: 500 });
  }
}