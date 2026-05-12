function formatWaitTime(createdAt: number): string {
  const totalMins = Math.floor((Date.now() - createdAt) / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
export default function WaitTimeBadge({ createdAt }: { createdAt: number }) {
  const totalMins = Math.floor((Date.now() - createdAt) / 60000);
  const cls =
    totalMins >= 120
      ? "bg-red-50 text-red-600"
      : totalMins >= 30
      ? "bg-yellow-50 text-yellow-700"
      : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${cls}`}>
      {formatWaitTime(createdAt)}
    </span>
  );
}