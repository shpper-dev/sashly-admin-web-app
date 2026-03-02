import { Order } from "@/lib/types";
import { Package } from "lucide-react";

export default function OrderRow({
  order,
  checked,
  onToggle,
}: {
  order: Order;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className=" border-b border-slate-100 hover:bg-white/60 transition-colors text-sm">

      {/* SEL */}
      <td className="w-10 px-4 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="accent-[#7F50F4] w-4 h-4 cursor-pointer"
        />
      </td>

      {/* ORDER DETAILS */}
      <td className="px-4 py-3 min-w-30">
        <div className="font-bold text-[#7F50F4]">#{order.id}</div>
        <div className="text-xs text-slate-400 mt-0.5">4pm – 6pm</div>
        <div className="text-xs text-slate-400">{order.summary.reduce((sum, item) => sum + item.qty, 0)} PCS</div>
      </td>

      {/* CLIENT INFO */}
      <td className="px-4 py-3 min-w-35">
        <div className="font-semibold text-[#101828]">{order.client}</div>
        <div className="text-xs text-slate-400 mt-0.5">{order.phone}</div>
      </td>

      {/* ADDRESSES & LOGISTICS */}
      <td className="px-4 py-3 min-w-45">
        <div className="text-xs text-slate-600 leading-relaxed">{order.address}</div>
      </td>

      {/* SUMMARY */}
      <td className="px-4 py-3 min-w-25">
        <div className="text-xs text-slate-400 font-bold flex items-center gap-1 mb-1">
          <Package className="h-4 w-4" />
          {order.summary.reduce((sum, item) => sum + item.qty, 0)} PIECES
        </div>
         <div className='flex flex-col'>
                <div className="flex flex-wrap gap-2 max-w-60">
                {order.summary.slice(0, 3).map((item:any, i:any) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-white text-xs text-slate-700 shadow-sm border border-slate-200"
                  >
                    {item.item_en} x{item.qty}
                  </span>
                ))}
         
                {order.summary.length > 3 && (
                  <span className="px-3 py-1 rounded-full text-purple-600 text-xs bg-purple-200/50 font-bold cursor-pointer">
                    +{order.summary.length - 3} more
                  </span>
                )}
              </div>

              </div>
        
      </td>

      {/* TYPE */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-orange-50 text-orange-500 border border-orange-100">
          {order.type}
        </span>
      </td>

      {/* NOTES / INSTRUCTIONS */}
      <td className="px-4 py-3 min-w-35">
        <div className="text-xs text-slate-400 italic text-center">
          {order.notes ?? "—"}
        </div>
      </td>

      {/* FINANCIALS */}
      <td className="px-4 py-3 text-right min-w-25">
        <div className="font-bold text-[#101828]">SAR {order.amount}</div>
        {order.unpaid && (
          <span className="inline-block mt-0.5 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
            UNPAID
          </span>
        )}
      </td>

    </tr>
  );
}