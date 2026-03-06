"use client";
import ConfirmDriverPayoutDialog from '@/components/finance/ConfirmDriverPayoutDialog';
import VerfiyTopupDialog from '@/components/finance/VerifyTopupDialog';
import Header from '@/components/Header'
import { Banknote, Clock, RotateCcw, Wallet, ArrowDownToLine, ArrowUpToLine, ArrowRight, WalletIcon } from 'lucide-react'
import React, { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type TableHeading = {
  id: string;
  title: string | null;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  {
    title: "Total Revenue",
    value: "SAR 412,890",
    icon: <Banknote className="w-5 h-5 text-green-600" />,
    bg: "bg-green-50",
  },
  {
    title: "Pending Approvals",
    value: "20 Requests",
    icon: <Clock className="w-5 h-5 text-orange-500" />,
    bg: "bg-orange-50",
  },
  {
    title: "Wallet Requests",
    value: "SAR 86,400",
    icon: <Wallet className="w-5 h-5 text-purple-600" />,
    bg: "bg-purple-50",
  },
]

// ── Payout table ──────────────────────────────────────────────────────────────
const payoutHeadings: TableHeading[] = [
  { id: "user_name",        title: "User Name"         },
  { id: "contact_details",  title: "Contact Details"   },
  { id: "requested_amount", title: "Requested Amount"  },
  { id: "actions",          title: "Actions"           },
]

const payoutRows = [
  {
    name: "Ahmed Al-Farsi",
    iban: "IBAN: SA93 1000 0000 1234 5678",
    email: "ahmed@email.com",
    phone: "+966 55 444 3210",
    amount: "SAR 3,450.00",
  },
  {
    name: "Maggie A",
    iban: "IBAN: SA93 1000 0000 1234 5678",
    email: "maggie@email.com",
    phone: "+966 55 444 3210",
    amount: "SAR 3,450.00",
  },
]

// ── Transaction table ─────────────────────────────────────────────────────────
const transactionHeadings: TableHeading[] = [
  { id: "transaction_id",   title: "Transaction ID"    },
  { id: "name",             title: "Name"              },
  { id: "type",             title: "Type"              },
  { id: "date",             title: "Date"              },
  { id: "requested_amount", title: "Amount"            },
  { id: "status",           title: "Status"            },
]

const transactionRows = [
  {
    id: "#TXN-4627",
    name: "Fahad Al-Saud",
    type: "Payout",
    date: "Oct 24, 2026",
    amount: "+ SAR 1,246.00",
    status: "Processing",
  },
  {
    id: "#TXN-4628",
    name: "Mariam Saleh",
    type: "Wallet",
    date: "Oct 26, 2026",
    amount: "- SAR 671.00",
    status: "Success",
  },
  {
    id: "#TXN-4629",
    name: "Ahmed Khalid",
    type: "Payout",
    date: "Oct 31, 2026",
    amount: "+ SAR 636.00",
    status: "Failed",
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Finance() {
  const [activeTab, setActiveTab] = useState<"payout" | "topup">("payout")

  // ── Payout cell renderer ──────────────────────────────────────────────────
  const renderPayoutCell = (heading: TableHeading, row: typeof payoutRows[0]) => {
    switch (heading.id) {
      case "user_name":
        return (
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{row.iban}</p>
          </div>
        )
      case "contact_details":
        return (
          <div>
            <p className="text-[#7F50F4] text-sm">{row.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">{row.phone}</p>
          </div>
        )
      case "requested_amount":
        return (
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.amount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Withdrawal Request</p>
          </div>
        )
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              Decline
            </button>
            {activeTab === "topup" ? (
              <VerfiyTopupDialog>
              <button className="px-3 py-1.5 text-xs font-semibold bg-[#7F50F4] text-white rounded-lg hover:bg-[#6B3FD4] transition-colors cursor-pointer">
              Process Payout
            </button>
            </VerfiyTopupDialog>
            ):(
              <ConfirmDriverPayoutDialog>
              <button className="px-3 py-1.5 text-xs font-semibold bg-[#7F50F4] text-white rounded-lg hover:bg-[#6B3FD4] transition-colors cursor-pointer">
              Process Payout
            </button>
            </ConfirmDriverPayoutDialog>
            )}
            
          </div>
        )
      default:
        return null
    }
  }

  // ── Transaction cell renderer ─────────────────────────────────────────────
  const renderTransactionCell = (heading: TableHeading, row: typeof transactionRows[0]) => {
    switch (heading.id) {
      case "transaction_id":
        return <span className="font-mono text-xs text-slate-500">{row.id}</span>
      case "name":
        return <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
      case "type":
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            row.type === "Payout"
              ? "bg-blue-50 text-blue-600"
              : "bg-purple-50 text-[#7F50F4]"
          }`}>
            {row.type}
          </span>
        )
      case "date":
        return <span className="text-sm text-slate-500">{row.date}</span>
      case "requested_amount":
        return (
          <span className={`font-semibold text-sm ${
            row.amount.startsWith("+") ? "text-green-600" : "text-red-500"
          }`}>
            {row.amount}
          </span>
        )
      case "status":
        return (
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${
              row.status === "Processing"
                ? "bg-purple-50 text-[#7F50F4]"
                : row.status === "Success"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}>
              {row.status}
            </span>
            {row.status === "Failed" && (
              <button className="text-[11px] text-[#7F50F4] flex items-center gap-1 hover:underline font-semibold">
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">
        <div className="bg-white px-8 py-6 space-y-8">

          {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  {/* Decorative Bottom Right Shape */}
                  <div
                    className={`absolute -bottom-6 -right-6 w-17 h-16 rounded-full ${stat.bg}`}
                  />
            
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-sm text-slate-500">
                        {stat.title}
                      </p>
                      <h2 className="text-3xl font-bold mt-3 text-slate-900">
                        {stat.value}
                      </h2>
                    </div>
            
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {/* ── Payout / Top-up Table ── */}
          <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {/* Payout tab */}
              <button
                onClick={() => setActiveTab("payout")}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold relative cursor-pointer transition-colors ${
                  activeTab === "payout" ? "text-[#7F50F4]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Banknote className="w-4 h-4" />
                Payout Requests
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "payout" ? "bg-[#7F50F4] text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {payoutRows.length}
                </span>
                {activeTab === "payout" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7F50F4]" />
                )}
              </button>

              {/* Top-up tab */}
              <button
                onClick={() => setActiveTab("topup")}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font- cursor-pointer relative transition-colors ${
                  activeTab === "topup" ? "text-[#7F50F4]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <WalletIcon className="w-4 h-4" />
                Wallet Top-ups
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "topup" ? "bg-[#7F50F4] text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {payoutRows.length}
                </span>
                {activeTab === "topup" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7F50F4]" />
                )}
              </button>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {payoutHeadings.map((h) => (
                    <th
                      key={h.id}
                      className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payoutRows.length === 0 ? (
                  <tr>
                    <td colSpan={payoutHeadings.length} className="px-6 py-10 text-center text-sm text-slate-400">
                      No requests
                    </td>
                  </tr>
                ) : (
                  payoutRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {payoutHeadings.map((h) => (
                        <td key={h.id} className="px-6 py-4 text-sm">
                          {renderPayoutCell(h, row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400 font-medium">
                Showing {payoutRows.length} of 12 requests
              </span>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-[#7F50F4] hover:underline">
                View all requests
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Recent Transactions Table ── */}
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-4">Recent Transactions</h3>

            <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {transactionHeadings.map((h) => (
                      <th
                        key={h.id}
                        className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                      >
                        {h.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {transactionRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {transactionHeadings.map((h) => (
                        <td key={h.id} className="px-6 py-4 text-sm">
                          {renderTransactionCell(h, row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
                <span className="text-xs text-slate-400 font-medium">
                  Showing {transactionRows.length} of 24 transactions
                </span>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-[#7F50F4] hover:underline">
                  View all transactions
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}