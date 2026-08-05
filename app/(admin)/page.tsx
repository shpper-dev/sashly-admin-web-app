"use client";
import Header from "@/components/Header";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import StatsCard from "@/components/StatsCard";
import { dashboardHeadings } from "@/constants/headings";
import { getActiveOrdersCount, getDailyOrderStats, getPendingPayoutsTotal } from "@/lib/firebase/order";
import { getDisputes } from "@/lib/firebase/dispute";
import { Dispute } from "@/lib/models/dispute.model";
import { TableHeading } from "@/lib/types";
import { Banknote, ChevronRight, Flag, HelpCircle, Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import WaitTimeBadge from "@/components/disputes/WaitTimeBadge";
import { ISSUE_TYPE_CONFIG } from "@/constants/configs";


export default function Dashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [disputesCount, setDisputesCount] = useState<number>(0);
  const [payoutsTotal, setPayoutsTotal] = useState<number>(0);
  const [dailyStats, setDailyStats] = useState({
    orderCount: 0, totalValue: 0, totalDiscounts: 0, totalCreditsUsed: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [activeCount, openDisputes, ordersToday, pendingPayouts] = await Promise.all([
        getActiveOrdersCount(),
        getDisputes(true),
        getDailyOrderStats(),
        getPendingPayoutsTotal(),
      ]);

      setActiveOrdersCount(activeCount);
      setDisputesCount(openDisputes.length);
      setDailyStats(ordersToday);
      setPayoutsTotal(pendingPayouts);

      const highPriority = openDisputes
        .filter((d: Dispute) => d.priority === "high")
        .slice(0, 4)
        .map((d: Dispute) => ({
          id:             d.id,
          dispute_id:     `#${d.id.slice(0, 6).toUpperCase()}`,
          order_id:       d.orderId,
          issue_category: d.issueType,
          time_elapsed:   d.createdAt,
          action:         d.id,
        }));

      setData(highPriority);
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderCellContent = (heading: TableHeading, value: any) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-slate-400">—</span>;
    }

    switch (heading.id) {
      case "dispute_id":
        return (
          <span className="text-xs text-slate-500">{value}</span>
        );

      case "issue_category": {
        const config = ISSUE_TYPE_CONFIG[value] ?? {
          label: value,
          icon: <HelpCircle className="h-3.5 w-3.5" />,
          className: "bg-slate-100 text-slate-500",
        };
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.className}`}>
            {config.icon}
            {config.label}
          </span>
        );
      }

      case "time_elapsed":
        return <WaitTimeBadge createdAt={value} />;

      case "action":
        return (
          <Link
            href={`/disputes/resolution/${value}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
          >
            Resolve
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        );

      default:
        return <span>{value}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex flex-col pt-12 pl-60 min-h-screen gap-3">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <StatsCard title="ACTIVE ORDERS" value={activeOrdersCount} change={0} />
          <StatsCard
            title="DISPUTES"
            value={disputesCount}
            change={data.length}
            comparisonText="new alerts requires action"
            icon={Flag}
            hasAlerts={data.length > 0}
          />
          <StatsCard
            title="PENDING PAYOUTS"
            value={`SAR ${payoutsTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={0}
            icon={Banknote}
          />
          <StatsCard
            title="TODAY'S ORDERS"
            value={dailyStats.orderCount}
            change={0}
          />
          <StatsCard
            title="TODAY'S DISCOUNTS"
            value={`SAR ${dailyStats.totalDiscounts.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            change={0}
            icon={Banknote}
          />
        </section>

        {/* Priority Resolution Section with Side Card */}
        <section className="px-6 pb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Priority Resolution</h2>
            <p className="text-sm text-slate-500">Review flagged issues requiring manual intervention.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Table */}
            <div className="lg:col-span-9 overflow-x-auto rounded-lg">
              {loading ? (
                <TableSkeleton tableHeadings={dashboardHeadings} />
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-200/50">
                    <tr>
                      {dashboardHeadings.map((heading) => (
                        <th key={heading.id} className="px-6 py-3 text-left text-sm font-semibold text-slate-700 first:rounded-tl-lg last:rounded-tr-lg">
                          {heading.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={dashboardHeadings.length} className="px-6 py-12 text-center text-sm text-slate-500">
                          No high priority disputes
                        </td>
                      </tr>
                    ) : (
                      data.map((row, index) => (
                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                          {dashboardHeadings.map((heading) => (
                            <td key={heading.id} className="px-6 py-3 text-sm text-slate-700">
                              {renderCellContent(heading, row[heading.id])}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-200/50">
                    <tr>
                      <td colSpan={dashboardHeadings.length} className="px-6 py-3 first:rounded-bl-lg last:rounded-br-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-600">
                            Showing <b>{data.length}</b> high priority{" "}
                            {data.length === 1 ? "dispute" : "disputes"}
                            {disputesCount > 0 && (
                              <span className="text-slate-400"> out of <b>{disputesCount}</b> open</span>
                            )}
                          </p>
                          <Link href="/disputes" className="text-xs font-medium text-purple-600 hover:underline flex items-center gap-1">
                            View all <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Broadcasting card */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col items-center justify-center bg-white rounded-lg border border-blue-500/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-4 p-4">
                  <Radio className="h-6 w-6 text-purple-600" />
                  <h3 className="font-bold text-center text-sm">Quick Broadcast</h3>
                </div>
                <Link href={"/broadcast"} className="px-5 py-3 bg-purple-600 text-white rounded-md font-medium transition-colors text-sm">
                  + New Broadcast
                </Link>
                <div className="px-6 py-3 bg-white w-[90%]">
                  <p className="text-slate-600 text-center lg:text-left text-xs">
                    Send quick alerts to users and drivers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}