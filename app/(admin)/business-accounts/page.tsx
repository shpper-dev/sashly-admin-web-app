"use client";
import Header from "@/components/Header";
import { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal,
  MapPin, Phone, Star, X, WashingMachine, Wind, Shirt, Sparkles, Package,
  Pencil, Trash2, Plus,
  PencilLine,
} from "lucide-react";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { TableHeading } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import BusinessAccountDialog from "@/components/business/BusinessAccountDialog";
import { PricingDialog } from "@/components/business/PricingDialog";

//Types

interface ServicePrice {
  serviceId: string;
  serviceName: string;
  unit: string;        // e.g. "per kg", "per item"
  price: number;       // SAR
  enabled: boolean;
}

export interface Business {
  id: string;
  name: string;
  arabicName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  logoUrl?: string;
  rating: number;
  totalOrders: number;
  status: "active" | "suspended" | "pending";
  joinedAt: string;
  pricing: ServicePrice[];
}

//Mock Data 

const DEFAULT_SERVICES: Omit<ServicePrice, "price" | "enabled">[] = [
  { serviceId: "wash_fold",   serviceName: "Wash & Fold",    unit: "per kg"   },
  { serviceId: "dry_clean",   serviceName: "Dry Cleaning",   unit: "per item" },
  { serviceId: "ironing",     serviceName: "Ironing",        unit: "per item" },
  { serviceId: "dryer",       serviceName: "Dryer Only",     unit: "per kg"   },
  { serviceId: "express",     serviceName: "Express (4 hr)", unit: "per kg"   },
];

const MOCK_BUSINESSES: Business[] = [
  {
    id: "b001", name: "Sparkle Laundry",      arabicName: "غسيل سباركل",
    ownerName: "Ahmed Al Mansoori", email: "ahmed@sparkle.ae", phone: "+971 50 123 4567",
    city: "Dubai",   area: "Al Barsha",    rating: 4.8, totalOrders: 1240, status: "active",
    joinedAt: "2023-03-15",
    pricing: [
      { serviceId: "wash_fold", serviceName: "Wash & Fold",    unit: "per kg",   price: 12,  enabled: true  },
      { serviceId: "dry_clean", serviceName: "Dry Cleaning",   unit: "per item", price: 25,  enabled: true  },
      { serviceId: "ironing",   serviceName: "Ironing",        unit: "per item", price: 5,   enabled: true  },
      { serviceId: "dryer",     serviceName: "Dryer Only",     unit: "per kg",   price: 8,   enabled: true  },
      { serviceId: "express",   serviceName: "Express (4 hr)", unit: "per kg",   price: 20,  enabled: true  },
    ],
  },
  {
    id: "b002", name: "Clean Wave",           arabicName: "موجة نظيفة",
    ownerName: "Sara Khalid",       email: "sara@cleanwave.ae",  phone: "+971 55 987 6543",
    city: "Abu Dhabi", area: "Khalidiyah",  rating: 4.5, totalOrders: 876,  status: "active",
    joinedAt: "2023-06-02",
    pricing: [
      { serviceId: "wash_fold", serviceName: "Wash & Fold",    unit: "per kg",   price: 10,  enabled: true  },
      { serviceId: "dry_clean", serviceName: "Dry Cleaning",   unit: "per item", price: 22,  enabled: true  },
      { serviceId: "ironing",   serviceName: "Ironing",        unit: "per item", price: 4,   enabled: true  },
      { serviceId: "dryer",     serviceName: "Dryer Only",     unit: "per kg",   price: 7,   enabled: false },
      { serviceId: "express",   serviceName: "Express (4 hr)", unit: "per kg",   price: 18,  enabled: false },
    ],
  },
  {
    id: "b003", name: "Fresh Press",          arabicName: "كوي فريش",
    ownerName: "Mohammed Raza",     email: "mo@freshpress.ae",   phone: "+971 52 456 7890",
    city: "Sharjah", area: "Al Nahda",     rating: 4.2, totalOrders: 530,  status: "active",
    joinedAt: "2023-09-20",
    pricing: [
      { serviceId: "wash_fold", serviceName: "Wash & Fold",    unit: "per kg",   price: 9,   enabled: true  },
      { serviceId: "dry_clean", serviceName: "Dry Cleaning",   unit: "per item", price: 20,  enabled: false },
      { serviceId: "ironing",   serviceName: "Ironing",        unit: "per item", price: 3.5, enabled: true  },
      { serviceId: "dryer",     serviceName: "Dryer Only",     unit: "per kg",   price: 6,   enabled: true  },
      { serviceId: "express",   serviceName: "Express (4 hr)", unit: "per kg",   price: 15,  enabled: false },
    ],
  },
  {
    id: "b004", name: "Royal Wash",           arabicName: "الغسيل الملكي",
    ownerName: "Fatima Al Hashmi",  email: "fatima@royalwash.ae", phone: "+971 56 321 0987",
    city: "Dubai",   area: "Downtown",    rating: 4.9, totalOrders: 3100, status: "active",
    joinedAt: "2022-11-10",
    pricing: [
      { serviceId: "wash_fold", serviceName: "Wash & Fold",    unit: "per kg",   price: 15,  enabled: true  },
      { serviceId: "dry_clean", serviceName: "Dry Cleaning",   unit: "per item", price: 35,  enabled: true  },
      { serviceId: "ironing",   serviceName: "Ironing",        unit: "per item", price: 7,   enabled: true  },
      { serviceId: "dryer",     serviceName: "Dryer Only",     unit: "per kg",   price: 10,  enabled: true  },
      { serviceId: "express",   serviceName: "Express (4 hr)", unit: "per kg",   price: 28,  enabled: true  },
    ],
  },
  {
    id: "b005", name: "QuickDry Pro",         arabicName: "كويك دراي",
    ownerName: "Tariq Siddiqui",    email: "tariq@quickdry.ae",  phone: "+971 54 654 3210",
    city: "Ajman",   area: "Al Rashidiya", rating: 3.9, totalOrders: 210,  status: "suspended",
    joinedAt: "2024-01-05",
    pricing: [
      { serviceId: "wash_fold", serviceName: "Wash & Fold",    unit: "per kg",   price: 8,   enabled: true  },
      { serviceId: "dry_clean", serviceName: "Dry Cleaning",   unit: "per item", price: 18,  enabled: false },
      { serviceId: "ironing",   serviceName: "Ironing",        unit: "per item", price: 3,   enabled: true  },
      { serviceId: "dryer",     serviceName: "Dryer Only",     unit: "per kg",   price: 5,   enabled: true  },
      { serviceId: "express",   serviceName: "Express (4 hr)", unit: "per kg",   price: 14,  enabled: false },
    ],
  },
  {
    id: "b006", name: "Bubble & Steam",       arabicName: "بابل وستيم",
    ownerName: "Noor Al Zaabi",     email: "noor@bubblesteam.ae", phone: "+971 50 789 1234",
    city: "Dubai",   area: "Jumeirah",    rating: 4.6, totalOrders: 0,    status: "pending",
    joinedAt: "2025-02-18",
    pricing: [
      { serviceId: "wash_fold", serviceName: "Wash & Fold",    unit: "per kg",   price: 11,  enabled: true  },
      { serviceId: "dry_clean", serviceName: "Dry Cleaning",   unit: "per item", price: 28,  enabled: true  },
      { serviceId: "ironing",   serviceName: "Ironing",        unit: "per item", price: 6,   enabled: true  },
      { serviceId: "dryer",     serviceName: "Dryer Only",     unit: "per kg",   price: 8,   enabled: false },
      { serviceId: "express",   serviceName: "Express (4 hr)", unit: "per kg",   price: 22,  enabled: true  },
    ],
  },
];

//  Constants 

const PAGE_SIZE = 5;

const businessHeadings: TableHeading[] = [
  { id: "name",        title: "BUSINESS"       },
  { id: "location",    title: "LOCATION"       },
  { id: "contact",     title: "CONTACT"        },
  { id: "rating",      title: "RATING"         },
  { id: "orders",      title: "TOTAL ORDERS"   },
  { id: "pricing",     title: "PRICING"        },
  { id: "status",      title: "STATUS"         },
  { id: "actions",     title: "ACTIONS"        },
];

const STATUS_FILTERS = ["All", "Active", "Suspended", "Pending"] as const;

export default function BusinessAccounts() {
  const [searchTerm, setSearchTerm]       = useState("");
  const [statusFilter, setStatusFilter]   = useState<string>("All");
  const [cityFilter, setCityFilter]       = useState<string>("All");
  const [currentPage, setCurrentPage]     = useState(1);

  const cities = ["All", ...Array.from(new Set(MOCK_BUSINESSES.map((b) => b.city)))];

  const filtered = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (
        b.name.toLowerCase().includes(term) ||
        b.ownerName.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        b.area.toLowerCase().includes(term)
      );
      const matchesStatus = statusFilter === "All" || b.status === statusFilter.toLowerCase();
      const matchesCity   = cityFilter   === "All" || b.city   === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [searchTerm, statusFilter, cityFilter]);

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart  = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd    = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const counts = {
    All:       MOCK_BUSINESSES.length,
    Active:    MOCK_BUSINESSES.filter((b) => b.status === "active").length,
    Suspended: MOCK_BUSINESSES.filter((b) => b.status === "suspended").length,
    Pending:   MOCK_BUSINESSES.filter((b) => b.status === "pending").length,
  };

  const renderCellContent = (heading: TableHeading, row: Business) => {
    switch (heading.id) {
      case "name": {
        const initials = row.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-linear-to-br from-indigo-100 to-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
              {row.logoUrl ? <img src={row.logoUrl} alt={row.name} className="w-full h-full object-cover" /> : initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{row.name}</p>
              <p className="text-xs text-slate-400">{row.arabicName}</p>
            </div>
          </div>
        );
      }
      case "location":
        return (
          <div className="flex items-start gap-1.5 text-sm text-slate-600">
            <div>
              <p className="font-medium">{row.area}</p>
              <p className="text-xs text-slate-400">{row.city}</p>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="flex flex-col gap-0.5">
            <p className="text-sm text-slate-700">{row.email}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Phone size={11} /> {row.phone}
            </div>
          </div>
        );
      case "rating":
        return (
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-700">{row.rating.toFixed(1)}</span>
          </div>
        );
      case "orders":
        return (
          <span className="text-sm font-semibold text-slate-700">
            {row.totalOrders.toLocaleString()}
          </span>
        );
      case "pricing":
        return <PricingDialog business={row} />;
      case "status": {
        const map = {
          active:    { label: "ACTIVE",    cls: "bg-green-100 text-green-700"  },
          suspended: { label: "SUSPENDED", cls: "bg-red-100 text-red-600"      },
          pending:   { label: "PENDING",   cls: "bg-amber-100 text-amber-700"  },
        } as const;
        const s = map[row.status];
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
            {s.label}
          </span>
        );
      }
      case "actions":
        return (
          <div className="flex items-center justify-end gap-3">
            <BusinessAccountDialog mode="edit" business={row} onSuccess={() => {}}>
              <button className="text-slate-500 hover:text-purple-600">
              <Pencil size={16} />
            </button>
            </BusinessAccountDialog>
            <ConfirmActionDialog
              title="Delete Business"
              description={`Are you sure you want to delete "${row.name}"? This will deactivate their account and all associated data.`}
              confirmLabel="Delete"
              onConfirm={async () => {
                // await deleteBusiness(row.id)
              }}
              onSuccess={() => {}}
            >
              <button className="text-red-500 hover:text-red-600 cursor-pointer">
              <Trash2 size={16} />
            </button>
            </ConfirmActionDialog>
          </div>
        );
      default: return "—";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">

        {/* Top bar */}
        <section className="flex items-center justify-between px-8 py-3 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Business Accounts</h2>
            <p className="text-sm text-slate-500">Manage laundromat partners and their service pricing</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm w-72">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name, owner or area..."
                className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
              />
            </div>
            <button className="flex gap-2 items-center bg-white px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg shadow-sm">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <BusinessAccountDialog mode="add" onSuccess={() => {}}>
              <button className="flex gap-2 items-center bg-purple-600 px-5 py-2.5 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700 transition-colors">
                <Plus size={15} /> Add New Business
              </button>
            </BusinessAccountDialog>
          </div>
        </section>

        {/* Filter bar */}
        <section className="flex items-center gap-3 px-8 py-3 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Status filter */}
          <div className="flex bg-slate-50 border border-slate-100 shadow-inner items-center gap-1 rounded-lg p-1">
            {STATUS_FILTERS.map((label) => (
              <button
                key={label}
                onClick={() => { setStatusFilter(label); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === label
                    ? "bg-white shadow text-slate-800 border border-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === label ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-400"
                }`}>
                  {counts[label as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* City filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => { setCityFilter(city); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  cityFilter === city
                    ? "bg-[#7F50F4] border-[#7F50F4] text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </section>

        {/* Table */}
        <section className="px-8 py-6">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                {businessHeadings.map((h) => (
                  <th key={h.id} className="px-5 py-3 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg">
                    {h.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={businessHeadings.length} className="px-5 py-12 text-center text-sm text-slate-500">
                    No businesses found
                  </td>
                </tr>
              ) : (
                paginated.map((row, index) => (
                  <tr key={row.id ?? index} className="hover:bg-slate-50 transition-colors">
                    {businessHeadings.map((h) => (
                      <td key={h.id} className="px-5 py-3 text-sm text-slate-700">
                        {renderCellContent(h, row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-200/50">
              <tr>
                <td colSpan={businessHeadings.length} className="px-6 py-3 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Showing <b>{rangeStart}</b>–<b>{rangeEnd}</b> of <b>{filtered.length}</b> businesses
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 text-slate-700" />
                      </button>
                      <span className="text-sm text-slate-600 px-1">Page {currentPage} of {Math.max(1, totalPages)}</span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 text-slate-700" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>
    </div>
  );
}