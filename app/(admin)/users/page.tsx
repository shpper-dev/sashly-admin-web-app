"use client";
import Header from '@/components/Header'
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal } from "lucide-react";
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import UserInfoDialog from '@/components/users/UserInfoDialog';
import FilterButtonWithBadge from '@/components/buttons/FilterButtonWithBadges';
import { getUsers, getUsersNextPage, UserFilters, getUsersCount, searchUsers } from '@/lib/firebase/user';
import { User } from '@/lib/models/user.model';
import { useToast } from '@/lib/providers/ToastProvider';
const PAGE_SIZE = 50;

const userHeadings: TableHeading[] = [
  { id: "name",         title: "NAME"          },
  { id: "email",        title: "EMAIL"         },
  { id: "language",     title: "LANGUAGE"      },
  { id: "registeredAt", title: "REGISTERED AT" },
  { id: "status",       title: "STATUS"        },
];

// Server-side filter
const SERVER_FILTERS: { label: string; filters: UserFilters }[] = [
  { label: "All",     filters: {}                  },
  { label: "Active",  filters: { isDeleted: false } },
  { label: "Deleted", filters: { isDeleted: true  } },
];

// Client-side filters 
const CLIENT_FILTERS: { label: string; field: keyof User; value: any }[] = [
  { label: "Email Verified",   field: "isEmailVerified", value: true  },
  { label: "Phone Verified",   field: "isPhoneVerified", value: true  },
  { label: "English",          field: "appLanguageCode", value: "en"  },
  { label: "Arabic",           field: "appLanguageCode", value: "ar"  },
];

export default function Users() {
  const [loading, setLoading]           = useState(false);
  const [data, setData]                 = useState<any[]>([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [serverFilter, setServerFilter] = useState<UserFilters>({});
  const [activeServer, setActiveServer] = useState("All");
  const [activeClients, setActiveClients] = useState<string[]>([]);

  // Browse-mode (cursor) pagination
  const [currentPage, setCurrentPage] = useState(1);
  const cursorStackRef = useRef<any[]>([undefined]);
  const [lastDoc, setLastDoc]         = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Search
  const [debouncedTerm, setDebouncedTerm]   = useState("");
  const [searchResults, setSearchResults]   = useState<User[] | null>(null); // null = not in search mode
  const [searching, setSearching]           = useState(false);
  // Search-mode (in-memory) pagination — separate page counter from browse mode,
  // since searchResults is a bounded array, not a cursor stream.
  const [searchPage, setSearchPage] = useState(1);

  // Debounce the raw input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Run search when debounced term changes
  useEffect(() => {
    if (!debouncedTerm) {
      setSearchResults(null); // back to normal paginated browse mode
      setSearchPage(1);
      return;
    }
    setSearching(true);
    setSearchPage(1); // reset to page 1 for every new search term
    searchUsers(debouncedTerm)
      .then(setSearchResults)
      .finally(() => setSearching(false));
  }, [debouncedTerm]);

  const {showToast} = useToast();
  const [counts, setCounts] = useState({
  all: 0,
  active: 0,
  deleted: 0,
});

useEffect(() => {
  const fetchCounts = async () => {
    const [all, active, deleted] = await Promise.all([
      getUsersCount({}),
      getUsersCount({ isDeleted: false }),
      getUsersCount({ isDeleted: true }),
    ]);

    setCounts({ all, active, deleted });
  };

  fetchCounts();
}, []);


  const isSearchMode = searchResults !== null;

  //  Client-side filtering (client filter tags apply on top of whichever source is active)
  const clientFilteredSearchResults = useMemo(() => {
    if (!isSearchMode) return [];
    return searchResults!.filter((u) =>
      activeClients.every((label) => {
        const cf = CLIENT_FILTERS.find((f) => f.label === label);
        if (!cf) return true;
        return u[cf.field] === cf.value;
      })
    );
  }, [searchResults, isSearchMode, activeClients]);

  const clientFilteredData = useMemo(() => {
    return data.filter((u) =>
      activeClients.every((label) => {
        const cf = CLIENT_FILTERS.find((f) => f.label === label);
        if (!cf) return true;
        return u[cf.field] === cf.value;
      })
    );
  }, [data, activeClients]);

  // Search mode: paginate the filtered results in-memory.
  // Browse mode: data is already the current server page — show as-is.
  const searchTotalPages = Math.max(1, Math.ceil(clientFilteredSearchResults.length / PAGE_SIZE));
  const paginatedSearchResults = useMemo(() => {
    const start = (searchPage - 1) * PAGE_SIZE;
    return clientFilteredSearchResults.slice(start, start + PAGE_SIZE);
  }, [clientFilteredSearchResults, searchPage]);

  const filteredData = isSearchMode ? paginatedSearchResults : clientFilteredData;

  const toggleClientFilter = (label: string) => {
    setActiveClients((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
    if (isSearchMode) setSearchPage(1); // filter change should reset search pagination too
  };

  //  Data fetching (browse mode only)
 const fetchPage = async (cursor: any, filtersToUse: UserFilters = serverFilter) => {
  setLoading(true);
  try {
    const result = cursor
      ? await getUsersNextPage(cursor, PAGE_SIZE, filtersToUse)
      : await getUsers(PAGE_SIZE, filtersToUse);
    setData(result.rows);
    setLastDoc(result.lastDoc);
    setHasNextPage(result.rows.length === PAGE_SIZE);
  } catch (e) {
    console.error("Failed to fetch users:", e);
  } finally {
    setLoading(false);
  }
  };
  
  const refetch = () => {
    cursorStackRef.current = [undefined];
    setCurrentPage(1);
    fetchPage(undefined, serverFilter);
  };
  
  useEffect(() => {
    cursorStackRef.current = [undefined];
    setCurrentPage(1);
    fetchPage(undefined, serverFilter); 
  }, [serverFilter]);



  const handleNext = async () => {
    if (isSearchMode) {
      if (searchPage >= searchTotalPages) return;
      setSearchPage((p) => p + 1);
      return;
    }
    if (!hasNextPage || !lastDoc) return;
    cursorStackRef.current.push(lastDoc);
    await fetchPage(lastDoc, serverFilter);
    setCurrentPage((p) => p + 1);
  };

  const handlePrev = async () => {
    if (isSearchMode) {
      if (searchPage <= 1) return;
      setSearchPage((p) => p - 1);
      return;
    }
    if (currentPage <= 1) return;
    cursorStackRef.current.pop();
    const prevCursor = cursorStackRef.current[cursorStackRef.current.length - 1];
    await fetchPage(prevCursor, serverFilter);
    setCurrentPage((p) => p - 1);
  };

  // Range labels — differ per mode since search total is known up-front, browse total isn't
  const browseRangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const browseRangeEnd   = (currentPage - 1) * PAGE_SIZE + data.length;

  const searchRangeStart = clientFilteredSearchResults.length === 0 ? 0 : (searchPage - 1) * PAGE_SIZE + 1;
  const searchRangeEnd   = Math.min(searchPage * PAGE_SIZE, clientFilteredSearchResults.length);

  const pageIsLoading = isSearchMode ? searching : loading;
  const canGoPrev = isSearchMode ? searchPage > 1 : currentPage > 1;
  const canGoNext = isSearchMode ? searchPage < searchTotalPages : hasNextPage;

  //  Cell renderer 
  const renderCellContent = (heading: TableHeading, row: User & { id: string }) => {
    switch (heading.id) {
      case "name": {
        const name = row.name?.trim() || "Unknown";
        const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
        return (
          <UserInfoDialog
            user={row}
            onDelete={() => { showToast(`Deleted ${name}`, "error");; refetch(); }}
            onSuccess={refetch}
          >
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                {row.profileImageUrl
                  ? <img src={row.profileImageUrl} alt={name} className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{name}</span>
                <span className="text-xs text-slate-400">ID: {row.userId}</span>
              </div>
            </div>
          </UserInfoDialog>
        );
      }
      case "email":
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-700 text-sm">{row.email ?? "—"}</span>
            {row.phone && <span className="text-xs text-slate-400"> {row.phone}</span>}
          </div>
        );
      case "language":
        return row.appLanguageCode ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wide">
            {row.appLanguageCode}
          </span>
        ) : <span className="text-slate-400 text-sm">—</span>;
      case "registeredAt": {
        const date = row.createdAt ? new Date(row.createdAt) : null;
        return (
          <span className="text-slate-600 text-sm">
            {date ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
          </span>
        );
      }
      case "status":
        return row.isDeleted ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">DELETED</span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">ACTIVE</span>
        );
      default: return "—";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex flex-col pt-16 pl-60 min-h-screen">

        {/*  Top bar: title + search + export */}
        <section className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="text-sm text-slate-500">Manage your user base and their account details</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm w-72">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
              />
            </div>
            {/* <button className="flex gap-2 items-center bg-white px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg shadow-sm">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button> */}
          </div>
        </section>

        {/*  Filter bar  */}
        <section className="flex items-center gap-3 px-8 py-3 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200" />

          {/* Server-side: isDeleted — disabled in search mode since search doesn't apply this filter server-side */}
          <div className={`flex bg-slate-50 border border-slate-100 shadow-inner items-center gap-1 rounded-lg p-1 ${isSearchMode ? "opacity-40 pointer-events-none" : ""}`}>
            {SERVER_FILTERS.map(({ label, filters: f }) => (
              <FilterButtonWithBadge
                key={label}
                label={label}
                count={
                label === "All"
                  ? counts.all
                  : label === "Active"
                  ? counts.active
                  : counts.deleted
              }
                active={activeServer === label}
                onClick={() => { setActiveServer(label); setServerFilter(f); }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200" />

          {/* Client-side: toggleable tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {CLIENT_FILTERS.map(({ label, field, value }) => {
              const on = activeClients.includes(label);
              const source = isSearchMode ? (searchResults ?? []) : data;
              const count = source.filter((u) => u[field] === value).length;
              return (
                <button
                  key={label}
                  onClick={() => toggleClientFilter(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    on
                      ? "bg-[#7F50F4] border-[#7F50F4] text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${on ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clear client filters */}
          {activeClients.length > 0 && (
            <button
              onClick={() => setActiveClients([])}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition ml-1"
            >
              Clear
            </button>
          )}
        </section>

        {/* Table*/}
        <section className="px-8 py-6">
          {pageIsLoading ? (
            <TableSkeleton tableHeadings={userHeadings} />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  {userHeadings.map((heading) => (
                    <th key={heading.id} className="px-6 py-4 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg">
                      {heading.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={userHeadings.length} className="px-6 py-12 text-center text-sm text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => (
                    <tr key={row.id ?? row.userId ?? index} className="hover:bg-slate-50 transition-colors">
                      {userHeadings.map((heading) => (
                        <td key={heading.id} className="px-6 py-3 text-sm text-slate-700">
                          {renderCellContent(heading, row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-200/50">
                <tr>
                  <td colSpan={userHeadings.length} className="px-6 py-3 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        {isSearchMode ? (
                          clientFilteredSearchResults.length === 0
                            ? <>No matches for &quot;{debouncedTerm}&quot;</>
                            : <>Showing <b>{searchRangeStart}</b>–<b>{searchRangeEnd}</b> of <b>{clientFilteredSearchResults.length}</b> match{clientFilteredSearchResults.length !== 1 ? "es" : ""} for &quot;{debouncedTerm}&quot;</>
                        ) : (
                          <>Showing <b>{browseRangeStart}</b>–<b>{browseRangeEnd}</b> users</>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={handlePrev} disabled={!canGoPrev || pageIsLoading}
                          className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          <ChevronLeft className="h-4 w-4 text-slate-700" />
                        </button>
                        <span className="text-sm text-slate-600 px-1">
                          Page {isSearchMode ? searchPage : currentPage}
                          {isSearchMode && ` of ${searchTotalPages}`}
                        </span>
                        <button onClick={handleNext} disabled={!canGoNext || pageIsLoading}
                          className="p-1 rounded hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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