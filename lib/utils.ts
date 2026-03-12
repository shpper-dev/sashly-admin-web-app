import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function uploadImage(file: File, folder: string) {
  const formData = new FormData()

  formData.append("file", file)
  formData.append("folder", folder)

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Upload failed")
  }

  const data = await res.json()

  return data.url
}