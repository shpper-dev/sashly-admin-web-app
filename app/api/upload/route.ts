import { NextResponse } from "next/server"
import { adminStorage } from "@/lib/firebase/admin-config"

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const fileName = `${folder}/${Date.now()}_${file.name}`

    const fileUpload = adminStorage.file(fileName)

    await fileUpload.save(buffer, {
      metadata: { contentType: file.type },
    })

    await fileUpload.makePublic()

    const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${fileName}`

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}