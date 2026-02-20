"use client";
import { Radio } from "lucide-react";
import { useRouter } from "next/navigation";


interface BroadcastBannerProps{
  target: string
}

export default function BroadcastBanner({target}:BroadcastBannerProps) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#EEF2FF] rounded-xl border border-blue-500/30 ">
        {/* left: icon  and texts*/}
        <div className="flex gap-4">
            <span className="bg-[#7F50F4] p-4 rounded-full">
               <Radio className="text-white h-5 w-5" />
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-md font-medium">Dispute Context</h3>
              <p className="text-slate-700 text-sm">Send urgent message as notifications or targeted alerts to specific users</p>
            </div>
        </div>
        <button className="px-3 py-3 bg-[#7F50F4] text-white font-medium rounded-lg cursor-pointer"
        onClick={()=>{
          router.push(`/broadcast`);
        }}>Create New Broadcast</button>
    </div>
  )
}
