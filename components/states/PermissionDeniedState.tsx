import { ShieldAlert } from "lucide-react";

interface PermissionDeniedStateProps {
  title?: string;
  description?: string;
}

export default function PermissionDeniedState({
  title = "Access restricted",
  description = "You don't have permission to view this page. Contact an administrator if you think this is a mistake.",
}: PermissionDeniedStateProps) {
  return (
    <div className="flex h-60 w-full flex-col items-center justify-center gap-1 rounded-xl border border-amber-100 bg-amber-50/40">
      <ShieldAlert className="mb-3 h-9 w-9 text-amber-500" strokeWidth={1.5} />
      <h3 className="text-sm font-semibold text-amber-700">{title}</h3>
      <p className="max-w-sm text-center text-xs text-amber-600">{description}</p>
    </div>
  );
}