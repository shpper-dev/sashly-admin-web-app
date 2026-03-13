import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function uploadImage(file: File, folder: string) {
  const formData = new FormData()

  formData.append("file", file)
  formData.append("folder", folder)

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Upload failed")
  }

  const data = await res.json()

  return data.url
}

export async function deleteImage(url: string): Promise<void> {
  const res = await fetch("/api/delete-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Delete failed");
  }
}