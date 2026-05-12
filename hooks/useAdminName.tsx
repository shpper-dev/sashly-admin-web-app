import { useEffect, useState } from "react";
import { getAdminById } from "@/lib/firebase/admin.auth";

const cache = new Map<string, string>();

export function useAdminName(uid: string | null | undefined): string {
  const [name, setName] = useState<string>(() => cache.get(uid ?? "") ?? "");

  useEffect(() => {
    if (!uid) return;
    if (cache.has(uid)) { setName(cache.get(uid)!); return; }
    getAdminById(uid).then((admin) => {
      const display = admin?.firstName ?? uid;
      cache.set(uid, display);
      setName(display);
    }).catch(() => setName(uid));
  }, [uid]);

  return name || uid || "";
}