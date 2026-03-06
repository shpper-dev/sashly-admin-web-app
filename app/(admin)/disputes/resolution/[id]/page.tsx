
import Header from '@/components/Header';
import {
  ArrowLeft,
  Bell,
  Check,
  CircleAlert,
  MapPin,
  NotepadText,
  Search,
  ShoppingCart,
  TriangleAlert,
  Undo2,
  User,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

export default async function DisputesResolutionDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-screen bg-[#F8FAFC]">
      <div className="fixed bg-white left-0 top-0 h-16 right-0 border-b border-b-blue-500/30 z-10">
        <div className="flex items-center justify-between h-full px-6">
           <div className='flex items-center gap-3'>
            <Link href={"/disputes"}><ArrowLeft className='text-slate-700 w-5 h-5' /></Link>
            <h2 className='text-lg text-slate-900 font-semibold'>Dispute Resolution Details</h2>
           </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center px-6 py-1.5 bg-slate-200/50 rounded-lg text-sm  gap-2">
                <Search className="h-4 w-4 text-gray-500 shrink-0" />
                <input type="text" placeholder="Search order, drivers, etc" className="bg-transparent border-none outline-none text-sm placeholder:text-gray-400" />
            </div>
            <button
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-500" />
            {/* Notification badge : add it after*/}
            {/* <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span> */}
          </button>
        </div>
        </div>
        
    </div>
      

      <main className="mt-14 min-h-screen overflow-y-auto">
        {/* ── 12-col grid ── */}
        <div className="grid grid-cols-12 gap-4 p-6 items-start">

          {/* 
              LEFT COLUMN 1  — span 3
               */}
          <div className="col-span-3 flex flex-col gap-4">

            {/* Card 1 — Order Summary */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Order Summary
              </span>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#7F50F4]">#{id}</span>
                
              </div>

              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-[10px] font-bold rounded-full text-white bg-linear-to-r from-[#7F50F4] to-[#02D0FF]">
                  Express
                </span>
                <span className="text-sm font-bold text-slate-900">SAR 246.00</span>
               
              </div>
            </div>

            {/* Card 2 — Customer & Driver */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-4">

              {/* Customer */}
              <div className="flex flex-col gap-3 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Customer
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">Emma Davis</span>
                    <span className="text-[10px] text-slate-500">+966 123 4567</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500">456 Business Ave, Suite 200,</span>
                    <span className="text-[10px] text-slate-500">New York, NY 10002</span>
                  </div>
                </div>
              </div>

              {/* Driver */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Driver
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900">Mohd. Abdul</span>
                    <span className="text-[10px] text-slate-500">ID: 266FX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 
               MIDDLE COLUMN 2  — span 6
             */}
          <div className="col-span-6 flex flex-col gap-4">

            {/* Card 1 — Dispute Context */}
            <div className="bg-white border border-blue-200/60 rounded-2xl overflow-hidden">

              {/* Card header */}
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-md font-bold text-slate-900">Dispute Context</h2>
                <p className="text-xs text-slate-400 mt-0.5">Review claims from both parties</p>
              </div>

              {/* 2-col body with vertical divider */}
              <div className="grid grid-cols-2 divide-x divide-slate-100">

                {/* Left — Customer Complaint */}
                <div className="flex flex-col gap-3 p-5">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-wide">
                    <CircleAlert className="w-3.5 h-3.5" />
                    Customer Complaint
                  </span>

                  <blockquote className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                    "The laundry was dropped off outside and it's missing the white shirt. Also, the building code was ignored and they left it on the sidewalk."
                  </blockquote>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Uploaded Evidence
                    </span>
                    <img
                      src="/images/cust-evidence.png"
                      alt="customer evidence"
                      className="rounded-xl object-fill w-full h-60"
                    />
                  </div>
                </div>

                {/* Right — Driver Notes */}
                <div className="flex flex-col gap-3 p-5">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#7F50F4] uppercase tracking-wide">
                    <NotepadText className="w-3.5 h-3.5" />
                    Driver Notes
                  </span>

                  <blockquote className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                    "Called when arriving, building code is 1234. Customer didn't pick up the phone after 3 attempts. Left at the secure gate as instructed by dispatcher."
                  </blockquote>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Pickup / Drop-off Photo
                    </span>
                    <img
                      src="/images/pickup-dropoff.png"
                      alt="pickup dropoff"
                      className="rounded-xl object-fill w-full h-60 "
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 — Internal Audit Note */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900">Internal Audit Note</span>
                <span className="text-[11px] text-slate-400">
                  Explain your decision for future audits and records
                </span>
              </div>

              <textarea
                name="decision-note"
                id="decision-note"
                rows={4}
                maxLength={160}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#7F50F4]/30 focus:border-[#7F50F4]/40 transition"
                placeholder="Explain why you made this decision..."
              />
              <div className="text-right text-[10px] text-slate-400">0 / 160 characters</div>
            </div>
          </div>

          {/* RIGHT COLUMN   — span 3*/}
          <div className="col-span-3 flex flex-col gap-4">

            {/* Card 1 — Manual Action Panel */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Manual Action Panel
              </span>

              <button className="flex items-center justify-between w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors">
                Issue Full Refund
                <Undo2 className="h-4 w-4 text-red-500" />
              </button>

              <button className="flex items-center justify-between w-full px-4 py-2.5 bg-[#02D0FF] hover:bg-[#00BAE0] rounded-xl text-xs font-bold text-white transition-colors">
                Add Wallet Credit
                <Wallet className="h-4 w-4" />
              </button>

              <button className="flex items-center justify-between w-full px-4 py-2.5 bg-[#7F50F4] hover:bg-[#6B3FD4] rounded-xl text-xs font-bold text-white transition-colors">
                Re-attempt Delivery
                <ShoppingCart className="h-4 w-4" />
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button className="flex items-center justify-between w-full px-4 py-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors">
                Delivery Penalty / Warning
                <TriangleAlert className="h-4 w-4 text-orange-500" />
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-colors bg-linear-to-r from-0% to-70% from-[#7F50F4] to-[#02D0FF] hover:opacity-90">
                <Check className="h-4 w-4" strokeWidth={3} />
                Confirm & Resolve Case
              </button>
            </div>

            {/* Card 2 — History */}
            <div className="bg-white border border-blue-200/60 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                History
              </span>

              <div className="flex flex-col gap-3">
                <div className="pl-3 border-l-2 border-[#7F50F4] flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-900">Driver Confirmed Delivery</span>
                  <span className="text-[10px] text-slate-400">10:15 AM</span>
                </div>

                <div className="pl-3 border-l-2 border-red-500 flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-900">Customer Opened Dispute</span>
                  <span className="text-[10px] text-slate-400">10:45 AM</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}