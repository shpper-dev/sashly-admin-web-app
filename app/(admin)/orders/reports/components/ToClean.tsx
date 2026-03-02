import { ReportCard } from "@/components/orders/ReportCard";
import { ClipboardList, LayoutGrid } from "lucide-react"

const sectionBreakdownData = [
    {
      date: "15/01/26",
      items: [{ name: "Carpet - سجاد", qty: 6 }],
    },
    {
      date: "17/02/26",
      items: [{ name: "Abaya (S)", qty: 1 }],
    },
    {
      date: "18/02/26",
      items: [
        { name: "Carpet - سجاد", qty: 4 },
        { name: "Wash & Iron - غسيل وكوي", qty: 1 },
      ],
    },
    {
      date: "18/02/26",
      items: [{ name: "Carpet || 11.5 متر (B)", qty: 12 }],
    },
  ];
  const toBeCleanedData = [
    {
      date: "15/01/26",
      items: [{ name: "Carpet || 11.5 متر (B)", qty: 6 }],
    },
    {
      date: "17/02/26",
      items: [{ name: "Abaya (S)", qty: 1 }],
    },
    {
      date: "18/02/26",
      items: [
        { name: "Jacket", qty: 4 },
        { name: "Bisht - بشـت / فروة", qty: 1 },
        { name: "Blouse - بلوزة", qty: 1 },
        { name: "Carpet || 11.5 متر (B)", qty: 1 },
        { name: "Shirt - قميص", qty: 1 },
        { name: "Trousers - بنطلون", qty: 1 },
      ],
    },
    {
      date: "18/02/26",
      items: [{ name: "Carpet || 11.5 متر (B)", qty: 12 }],
    },
  ]
  
export default function ToClean() {
return (
    <div className="grid grid-cols-2 gap-8">
      <ReportCard
      title="Section Breakdown"
      icon={<LayoutGrid className="w-5 h-5 text-purple-600" />}
      iconBg="bg-purple-100"
      accentColor="#7C3AED"
      data={sectionBreakdownData}
    />
      <ReportCard
      title="To Be Cleaned"
      icon={<ClipboardList className="w-5 h-5 text-emerald-600" />}
      iconBg="bg-emerald-100"
      accentColor="#10B981"
      data={toBeCleanedData}
    />
    </div>
  )
}