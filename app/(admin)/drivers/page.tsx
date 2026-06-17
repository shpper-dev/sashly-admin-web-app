"use client";
import Header from '@/components/Header'
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Mail, Phone, Search, MapPin, MapPinOff, SlidersHorizontal } from "lucide-react";
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import FilterButtonWithBadge from '@/components/buttons/FilterButtonWithBadges';
import { useToast } from '@/lib/providers/ToastProvider';
import { Driver } from '@/lib/models/driver.model';
import { Switch } from '@/components/ui/switch';
import { getDrivers, updateDriver } from '@/lib/firebase/driver';
import DriverInfoDialog from '@/components/drivers/DriverInfoDialog';
import AddDriverDialog from '@/components/drivers/AddDriverDialog';

const PAGE_SIZE = 10;

const driverHeadings: TableHeading[] = [
  { id: "name",    title: "NAME"          },
  { id: "contact", title: "CONTACT"       },
  { id: "route",   title: "AREA"          },
  { id: "active",  title: "ACTIVE"        },
  { id: "online",  title: "ONLINE"        },
  { id: "offer" ,  title: "OFFER RESPONSE"},
  { id: "updated", title: "LAST UPDATED"  },
];

//  Filter definitions

const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;

const CLIENT_FILTERS: { label: string; fn: (d: Driver) => boolean }[] = [
  { label: "Online",           fn: (d) => d.isOnline                   },
  { label: "Has Area",         fn: (d) => !!d.designatedArea            },
  { label: "Missing Area",     fn: (d) => !d.designatedArea             },
];



function fmt(ts?: { seconds: number } | null) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}


export default function Drivers() {
  const [loading,      setLoading]      = useState(false);
  const [data,         setData]         = useState<Driver[]>([]);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activeClients, setActiveClients] = useState<string[]>([]);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [togglingId,   setTogglingId]   = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchDrivers = async (showSkeleton = true) => {
  if (showSkeleton) setLoading(true);
  try {
    const drivers = await getDrivers();
    setData(drivers);
  } catch (e) {
    console.error("Failed to fetch drivers:", e);
    showToast("Failed to load drivers.", "error");
  } finally {
    if (showSkeleton) setLoading(false);
  }
};

useEffect(() => { fetchDrivers(); }, []);

  //toggle isActive
  const handleToggleActive = async (driver: Driver) => {
    setTogglingId(driver.id);
    try {
      await updateDriver(driver.id, { isActive: !driver.isActive });
      setData((prev) =>
        prev.map((d) => d.id === driver.id ? { ...d, isActive: !d.isActive } : d)
      );
      showToast(`Driver ${driver.id} ${!driver.isActive ? "UNBLOCKED" : "BLOCKED"}`,`${!driver.isActive ? "success": "error"}`);
    } catch (e) {
      console.error("Failed to update driver:", e);
      showToast("Failed to update driver status.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleOffer = async (driver: Driver) => {
    setTogglingId(driver.id);
    try {
      await updateDriver(driver.id, { enableDriverOfferResponse: !driver.enableDriverOfferResponse });
      setData((prev) =>
        prev.map((d) => d.id === driver.id ? { ...d, enableDriverOfferResponse: !d.enableDriverOfferResponse } : d)
      );
      showToast(`Driver ${driver.id} OFFER RESPONSE  ${!driver.enableDriverOfferResponse ? "ENABLED" : "DISABLED"}`,`${!driver.enableDriverOfferResponse ? "success": "error"}`);
    } catch (e) {
      console.error("Failed to update driver:", e);
      showToast("Failed to update driver status.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const toggleClientFilter = (label: string) => {
    setActiveClients((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
    setCurrentPage(1);
  };

  // filtering 
  const filtered = useMemo(() => {
    return data.filter((driver) => {
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active"   && driver.isActive) ||
        (statusFilter === "Inactive" && !driver.isActive);

      const matchesClients = activeClients.every((label) => {
        const cf = CLIENT_FILTERS.find((f) => f.label === label);
        return cf ? cf.fn(driver) : true;
      });

      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (
        driver.name?.toLowerCase().includes(term) ||
        driver.email?.toLowerCase().includes(term) ||
        driver.phoneNumber.includes(term)
      );

      return matchesStatus && matchesClients && matchesSearch;
    });
  }, [data, statusFilter, activeClients, searchTerm]);

  // pagination 
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd   = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const counts = {
    All:      data.length,
    Active:   data.filter((d) => d.isActive).length,
    Inactive: data.filter((d) => !d.isActive).length,
  };

  // cell renderer
  const renderCellContent = (heading: TableHeading, row: Driver) => {
    switch (heading.id) {

      case "name": {
        const name     = row.name?.trim() || "Unknown";
        const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
        return (
         <DriverInfoDialog driver={row} onSuccess={()=> fetchDrivers(false)}>
           <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm shrink-0">
              {row.profileImageUrl
                ? <img src={row.profileImageUrl} alt={name} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-slate-900 truncate">{name}</span>
              <span className="text-xs text-slate-400 truncate">ID: {row.id}</span>
            </div>
          </div>
         </DriverInfoDialog>
        );
      }

      case "contact":
        return (
          <div className="flex flex-col gap-1 text-xs">
            {row.email && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">{row.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Phone className="h-3 w-3 shrink-0 text-slate-400" />
              <span>{row.phoneNumber}</span>
            </div>
          </div>
        );

      case "route":
        return row.designatedArea ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="font-medium">{row.designatedArea.areaName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPinOff className="h-3.5 w-3.5 shrink-0" />
            <span>No area</span>
          </div>
        );

      case "active":
        return (
          <Switch
            checked={row.isActive}
            disabled={togglingId === row.id}
            onCheckedChange={() => handleToggleActive(row)}
            className="cursor-pointer data-[state=checked]:bg-purple-600!"
          />
        );

      case "online":
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.isOnline ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
          }`}>
            {row.isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        );
      
      case "offer":
        return (
          <Switch
            checked={row.enableDriverOfferResponse ?? false}
            disabled={togglingId === row.id}
            onCheckedChange={() => handleToggleOffer(row)}
            className="cursor-pointer data-[state=checked]:bg-purple-600!"
          />
        );

      case "updated":
        return (
          <span className="text-xs text-slate-500">{fmt(row.updatedAt)}</span>
        );

      default:
        return "—";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">

        {/* Top bar */}
        <section className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Drivers</h2>
            <p className="text-sm text-slate-500">Manage your delivery drivers</p>
          </div>
          <div className="flex gap-3 items-center">
            
            <button className="flex gap-2 items-center bg-white px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg shadow-sm">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <AddDriverDialog onSuccess={fetchDrivers} />
          </div>
        </section>

        {/* Filter bar */}
        <section className="flex items-center justify-between px-8 py-3 border-b border-slate-100">
          <div className='flex items-center gap-3 '>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Status — server-style pill group */}
          <div className="flex bg-slate-50 border border-slate-100 shadow-inner items-center gap-1 rounded-lg p-1">
            {STATUS_FILTERS.map((label) => (
              <FilterButtonWithBadge
                key={label}
                label={label}
                count={counts[label as keyof typeof counts]}
                active={statusFilter === label}
                onClick={() => { setStatusFilter(label); setCurrentPage(1); }}
              />
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Client-side toggleable filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {CLIENT_FILTERS.map(({ label }) => {
              const on = activeClients.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleClientFilter(label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    on
                      ? "bg-[#7F50F4] border-[#7F50F4] text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {activeClients.length > 0 && (
            <button
              onClick={() => setActiveClients([])}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition ml-1"
            >
              Clear
            </button>
          )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm w-64">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name, email or phone..."
                className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
              />
          </div>
        </section>

        {/* Table */}
        <section className="px-8 py-6">
          {loading ? (
            <TableSkeleton tableHeadings={driverHeadings} />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  {driverHeadings.map((h) => (
                    <th key={h.id} className="px-6 py-4 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg">
                      {h.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={driverHeadings.length} className="px-6 py-12 text-center text-sm text-slate-500">
                      No drivers found
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, index) => (
                    <tr key={row.id ?? index} className="hover:bg-slate-50 transition-colors">
                      {driverHeadings.map((h) => (
                        <td key={h.id} className="px-6 py-3 text-sm text-slate-700">
                          {renderCellContent(h, row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-200/50">
                <tr>
                  <td colSpan={driverHeadings.length} className="px-6 py-3 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Showing <b>{rangeStart}</b>–<b>{rangeEnd}</b> of <b>{filtered.length}</b> drivers
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                          className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 text-slate-700" />
                        </button>
                        <span className="text-sm text-slate-600 px-1">
                          Page {currentPage} of {Math.max(1, totalPages)}
                        </span>
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
          )}
        </section>
      </main>
    </div>
  );
}