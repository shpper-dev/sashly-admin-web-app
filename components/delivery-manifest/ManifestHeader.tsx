import Link from "next/link";
import { ArrowLeft, Printer, Search} from "lucide-react";
import FilterButton from "../buttons/FilterButton";
import { useState } from "react";

export default function ManifestHeader({
  selectedCount,
  onSelectAll,
  onDeselectAll,
}: {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
    const [activeTab, setActiveTab] = useState<"all" | "pickups" | "deliveries">("all");
  return (
    <div className="w-full flex items-center justify-between bg-white px-6 py-6 fixed top-0 left-0 z-10">
    <div className="flex items-center gap-4">
        <Link href="/orders">
           <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
        </Link>
        <div>
        <h1 className="text-xl font-bold">Delivery Manifest</h1>
        <p className="text-xs text-gray-400 font-medium">PRINT DELIVERY DETAILS</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
        <div className="flex items-center px-4 py-2.5 w-80 bg-slate-200/50 rounded-lg text-sm  gap-2">
                <Search className="h-4 w-4 text-gray-500 shrink-0" />
                <input type="text" placeholder="Quick search by name or order ID" className="bg-transparent w-full border-none outline-none text-sm placeholder:text-gray-400" />
        </div>
        <FilterButton label="PICKUPS"  />
        <div className="w-px h-7 bg-slate-300"/>
        {/* tabs / categories */}
         <div className="
                  flex flex-row items-center
                   h-9 px-1 gap-1
                  bg-[#F1F5F9] rounded-[14px]
                  shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]
                ">

                  <button
                    onClick={() => setActiveTab("all")}
                    className={`
                      flex items-center justify-center
                      h-6.75 px-4 py-1.5 gap-2.5
                      rounded-[10px] border-none cursor-pointer
                       font-bold text-[11px] leading-3.75
                      text-center tracking-[0.5px] uppercase
                      transition-all duration-150
                      ${activeTab === "all"
                        ? "bg-white text-[#02D0FF] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                        : "bg-transparent text-[#62748E] shadow-none"
                      }
                    `}
                  >
                    All
                  </button>

                  <button
                    onClick={() => setActiveTab("pickups")}
                    className={`
                      flex items-center justify-center
                       h-6.75 px-4 py-1.5 gap-2.5
                      rounded-[10px] border-none cursor-pointer
                      font-bold text-[11px] leading-3.75
                      text-center tracking-[0.5px] uppercase
                      transition-all duration-150
                      ${activeTab === "pickups"
                        ? "bg-white text-[#02D0FF] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                        : "bg-transparent text-[#62748E] shadow-none"
                      }
                    `}
                  >
                    Pickups
                  </button>
                  <button
                    onClick={() => setActiveTab("deliveries")}
                    className={`
                      flex items-center justify-center
                      h-6.75 px-4 py-1.5 gap-2.5
                      rounded-[10px] border-none cursor-pointer
                      font-bold text-[11px] leading-3.75
                      text-center tracking-[0.5px] uppercase
                      transition-all duration-150
                      ${activeTab === "deliveries"
                        ? "bg-white text-[#02D0FF] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                        : "bg-transparent text-[#62748E] shadow-none"
                      }
                    `}
                  >
                    Deliveries
                  </button>
                </div>
                <div className="w-px h-7 bg-slate-300"/>
        <button className="flex items-center gap-2 bg-[#7F56D9] text-white px-4 py-2 rounded-xl text-sm font-semibold">
          <Printer size={16} />
          Print ({selectedCount})
        </button>
        
    </div>
      
    </div>
  );
}