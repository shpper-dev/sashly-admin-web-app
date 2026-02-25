
import { notFound } from "next/navigation"
import { FileText, LucideIcon, Printer, Timer, Truck, User, X } from "lucide-react"
import ToClean from "../components/ToClean"
import CleanedYesterday from "../components/CleanedYesterday"
import Link from "next/link";



export default async function CleaningReportPage({ params }: { params: Promise<{ option: string }> }) {
  const { option } =  await params;

  const renderReport = () => {
    switch (option) {
      case "to-clean":
        return <ToClean />
      case "yesterday":
        return <CleanedYesterday />
      default:
        return notFound()
    }
  }

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 flex items-center bg-white justify-between border-b border-slate-200 p-4 z-10 ">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {option === "to-clean" && "To Clean Report"}
              {option === "yesterday" && "Yesterday's Cleaned Report"}
            </h1>
            <p className="text-xs text-slate-400 tracking-wide">
              INTERNAL OPERATIONS REPORT · GENERATED 2/19/2026
            </p>
          </div>
        </div>

        <div className="flex items-center  gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition shadow-sm">
          <Printer size={16} />
          Print Document
        </button>
        <Link href={"/orders"} className="flex items-center p-2.5 justify-center rounded-lg bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-100/30 transition cursor-pointer shadow-sm"
            >
              <X size={16} />
            </Link>
        </div>
      </div>
      <main className="px-8 pt-18 flex flex-col gap-8">
        {/* Stats Cards */}
      <section>
        <div className="grid grid-cols-4 gap-6">
        <StatCard title="TOTAL VOLUME" value="5" subtitle="ORDERS" icon={FileText } color="purple" />
        <StatCard title="UNIT COUNT" value="32" subtitle="PIECES" icon={Timer} color="blue" />
        <StatCard title="AVG EFFICIENCY" value="SAR 94.9" subtitle="PER ORDER" icon={User} color="yellow" />
        <StatCard title="PROJECTED VALUE" value="SAR 474.6" subtitle="REVENUE" icon={Truck} color="green" />
      </div>

      </section>
      {/* Dynamic Report Content */}
      <section>{renderReport()}</section>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon:Icon,
  color,
}: {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
            <div className={`p-3 rounded-lg flex items-center justify-center ${color ? `bg-${color}-100 text-${color}-600` : "bg-slate-100"}`}>
                <Icon className="h-5 w-5text-slate-400" />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-medium">{title}</p>
                <h3 className="text-xl font-semibold text-slate-800 mt-2">{value}</h3>
                <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>
        </div>
    </div>
  )
}