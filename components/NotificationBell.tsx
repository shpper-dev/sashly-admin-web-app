"use client";
import {
  Bell, AlertTriangle, Package, Radio,
  Truck, Building2, CheckCheck, Check,
} from "lucide-react";
import Link from "next/link";
import { DeepLinkType, Notification, NotificationType } from "@/lib/models/notification";
import { useAdminNotifications } from "@/hooks/useAdminNotification";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEEP_LINK_ROUTES: Record<DeepLinkType, string> = {
  "orders":            "/orders",
  "business-accounts": "/business-accounts",
  "none":              "#",
};

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  new_order:      { icon: <Package       className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-600" },
  order_pickedUp: { icon: <Truck         className="h-3.5 w-3.5" />, color: "bg-blue-100    text-blue-600"    },
  order_disputed: { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "bg-rose-100    text-rose-600"    },
  new_business:   { icon: <Building2     className="h-3.5 w-3.5" />, color: "bg-purple-100  text-purple-600"  },
  broadcast:      { icon: <Radio         className="h-3.5 w-3.5" />, color: "bg-slate-100   text-slate-600"   },
};
function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const route = (deepLink?: DeepLinkType | null) =>
  DEEP_LINK_ROUTES[deepLink ?? "none"];

export default function NotificationBell() {
  const { alerts, unreadCount, markAsRead, clearAll } = useAdminNotifications();

  // Only unread notifications are shown in the list
  const unread = alerts.filter((a) => !a.isRead);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
              <button
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Messages"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
            <span className="absolute -top-0.5 left-1/3 translate-x-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
              </button>
            </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 rounded-xl shadow-xl border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* List — only unread */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {unread.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              All caught up — no unread notifications.
            </div>
          ) : (
            unread.map((alert) => {
              const cfg      = TYPE_CONFIG[alert.type] ?? TYPE_CONFIG.broadcast;
              const href     = route(alert.deepLink);
              const isUrgent = alert.priority === "urgent";

              return (
                <div
                  key={alert.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group ${
                    isUrgent ? "border-l-2 border-l-red-400" : ""
                  }`}
                >
                  {/* Type icon */}
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {href !== "#" ? (
                        <Link
                          href={href}
                          className="text-xs font-semibold text-slate-800 hover:underline truncate"
                        >
                          {alert.title}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {alert.title}
                        </span>
                      )}
                      {isUrgent && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[9px] font-bold uppercase tracking-wide">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{alert.body}</p>
                    <span className="text-[10px] text-slate-400">{timeAgo(alert.createdAt)}</span>
                  </div>

                  {/* Mark as read button — visible on hover */}
                  <button
                    onClick={() => markAsRead(alert.id)}
                    title="Mark as read"
                    className="shrink-0  p-1 rounded-lg text-slate-300 hover:text-purple-600 hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {unread.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}