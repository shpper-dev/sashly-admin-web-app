"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard",         href: "/metrics"                    },
  { name: "Overview",          href: "/metrics/overview"           },
  { name: "Revenue",           href: "/metrics/revenue"            },
  { name: "Unpaid",            href: "/metrics/unpaid"             },
  { name: "Orders",            href: "/metrics/orders"             },
  { name: "Customers",         href: "/metrics/customers"          },
  // { name: "Subscriptions",     href: "/metrics/subscriptions"      },
  { name: "Top Selling",       href: "/metrics/top-selling"      },
  // { name: "Business Accounts", href: "/metrics/business-accounts"  },
  // { name: "Staff Performance", href: "/metrics/staff-performance"  },
  // { name: "Reviews",           href: "/metrics/reviews"            },
  // { name: "Data Exports",      href: "/metrics/data-exports"       },
];

export default function MetricsSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 h-full w-60 border-r border-slate-100 bg-white flex flex-col px-4 py-6 z-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Link>
        <h2 className="text-base font-semibold text-slate-800">Metrics</h2>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}