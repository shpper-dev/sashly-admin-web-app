"use client";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { markOrderMessagesAsReadByAdmin } from "@/lib/firebase/message";
import NotificationBell from "@/components/NotificationBell";

export default function Header() {
  const { unreadMessages, unreadCount } = useChatNotifications();

  return (
    <div className="fixed bg-white top-0 h-12 left-60 right-0 border-b border-b-blue-500/30 z-10">
      <div className="flex items-center justify-between h-full px-6">

        {/* Search */}
        <div className="flex items-center px-4 py-1.5 bg-slate-200/50 rounded-lg text-sm gap-2">
          <Search className="h-4 w-4 text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search order, drivers, etc"
            className="bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          <div className="w-px h-5 bg-slate-300 mr-1" />

          {/* Messages dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Messages"
              >
                <MessageSquare className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
            <span className=" absolute -top-0.5 left-1/2 translate-x-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Unread Chats</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {unreadMessages.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No unread chats</div>
                ) : (
                  unreadMessages.map((msg) => (
                    <Link
                      key={msg.id}
                      href={`/orders?orderId=${msg.orderId}`}
                      className="flex w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                      onClick={async () => {
                        try {
                          await markOrderMessagesAsReadByAdmin(msg.orderId);
                        } catch (error) {
                          console.error("Failed to mark messages as read", error);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              Order #{msg.orderId.slice(0, 8)}
                            </p>
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-1">
                            {msg.photoUrl ? "🖼️ Image" : msg.text}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification bell — now uses the real provider */}
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}