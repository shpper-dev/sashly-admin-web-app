import {
  TrendingDown,
  TrendingUp,
  Truck,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

interface SimpleStatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
}

export default function SimpleStatsCard({
  title,
  value,
  icon: Icon = Truck,
  color = "gray",
}: SimpleStatsCardProps) {
  const colorBadges : Record<string,string> = {
    purple :"bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    gray:"bg-purple-100 text-purple-600"
  }
  const colorTexts : Record<string,string> = {
    purple :"text-purple-800",
    green: "text-green-600",
    red: "text-gray-800",
    gray:"text-gray-800"
  }

  return (
    <div
      className={`flex justify-between rounded-2xl bg-white px-8 py-6 shadow-sm border border-blue-500/30 gap-5`}
    >
      {/* LEFT */}
      <div>
        <p className="text-gray-500 text-md ">
          {title}
        </p>

        <p className={`text-xl font-bold ${colorTexts[color]}`}>
          {value}
        </p>
      </div>

      {/* RIGHT ICON */}
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full ${colorBadges[color]} `}
      >
         <Icon size={22} />
      </div>
    </div>
  );
}
