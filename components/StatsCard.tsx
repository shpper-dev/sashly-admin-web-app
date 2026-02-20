import {
  TrendingDown,
  TrendingUp,
  Truck,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  comparisonText?: string;
  icon?: LucideIcon;
  hasAlerts?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  comparisonText = "vs last week",
  icon: Icon = Truck,
  hasAlerts = false,
}: StatsCardProps) {
  const isDisputes = title === "DISPUTES";
  const isNegative = change < 0;
  const showAlert = isDisputes && hasAlerts;

  // Badge color logic
  const badgeStyle = isDisputes
    ? showAlert
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-600"
    : isNegative
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700";

  // Card border/shadow logic
  const cardAlertStyle = showAlert
    ? "border border-blue-500/30 border-r-4 border-r-red-500 shadow-[inset_-6px_0_12px_rgba(239,68,68,0.35)]"
    : "border border-blue-500/30";

  return (
    <div
      className={`flex justify-between rounded-2xl bg-white p-6 shadow-sm ${cardAlertStyle}`}
    >
      {/* LEFT */}
      <div>
        <p className="text-gray-500 text-md ">
          {title}
        </p>

        <p className="text-xl font-bold text-gray-900 mb-6">
          {value}
        </p>

        {/* CHANGE BADGE */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badgeStyle}`}
          >
            {/* Icon only for NON disputes */}
            {!isDisputes && (
              change >= 0 ? (
                <TrendingUp size={18} />
              ) : (
                <TrendingDown size={18} />
              )
            )}

            {hasAlerts ? "+":""}{change} {isDisputes ? "" :"%"}
          </div>

          <span className="text-gray-500 text-sm">
            {comparisonText}
          </span>
        </div>
      </div>

      {/* RIGHT ICON */}
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full
          ${
            showAlert
              ? "bg-red-200 text-red-600"
              : "bg-purple-200 text-purple-600"
          }`}
      >
         <Icon size={22} />
      </div>
    </div>
  );
}
