import { adminStorage } from "@/lib/firebase/admin-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    let filePath = "";

    // 1. Handle Standard Firebase Download URLs (with /o/)
    if (url.includes("/o/")) {
      const matches = url.match(/\/o\/(.+?)\?/);
      if (matches?.[1]) {
        filePath = decodeURIComponent(matches[1]);
      }
    } 
    // 2. Handle Direct Cloud Storage URLs (storage.googleapis.com/...)
    else if (url.includes("storage.googleapis.com/")) {
      // URL: https://storage.googleapis.com/[BUCKET_NAME]/[FILE_PATH]
      const parts = url.split("storage.googleapis.com/")[1].split("/");
      // parts[0] is the bucket name, so we slice starting at index 1 to get the file path
      filePath = parts.slice(1).join("/");
    }

    if (!filePath) {
      return NextResponse.json({ error: "Could not parse storage path from URL" }, { status: 400 });
    }

    // Attempt to delete the file
    await adminStorage.file(filePath).delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // If the error is that the file doesn't exist,  return success anyway
    if (err.code === 404) {
      return NextResponse.json({ success: true, message: "File already deleted" });
    }
    
    console.error("Delete image error:", err);
    return NextResponse.json({ error: err.message ?? "Delete failed" }, { status: 500 });
  }
}