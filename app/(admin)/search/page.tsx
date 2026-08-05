"use client";

import FilterDropdown from '@/components/buttons/FilterDropdown'
import Header from '@/components/Header'
import { SearchIcon, TextSearch } from 'lucide-react'
import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SearchResults from '@/components/search/SearchResults';
import { Order } from '@/lib/models/order.model';
import { searchOrders } from '@/lib/firebase/order';
import { ORDER_STATUS_OPTIONS } from '@/constants/options_and_filters';

export interface SearchFilters {
  name: string;
  phone: string;
  email: string;
  route: string;
  rack: string;
  customerGroup: string;
  orderId: string;
  summary: string;
  notes: string;
  placedAfter: string;
  placedBefore: string;
  payment: string;
  paidAfter: string;
  paidBefore: string;
  cleanedAfter: string;
  cleanedBefore: string;
}

const defaultFilters: SearchFilters = {
  name: '',
  phone: '',
  email: '',
  route: '',
  rack: '',
  customerGroup: '',
  orderId: '',
  summary: '',
  notes: '',
  placedAfter: '',
  placedBefore: '',
  payment: '',
  paidAfter: '',
  paidBefore: '',
  cleanedAfter: '',
  cleanedBefore: '',
};

const ORDER_TYPE_OPTIONS = [
  { label: "Ordinary", value: "ordinary" },
  { label: "Express",  value: "express"  },
];

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Order[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(defaultFilters);

  const [orderStatus, setOrderStatus] = useState("");
  const [orderType, setOrderType] = useState("");

  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);

  const handleChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setHasSearched(false);
    setResults([]);
    setOrderStatus("");
    setOrderType("");
  };

 
  const runSearch = async (f: SearchFilters, page: number, status: string, type: string) => {
    const res = await searchOrders({
      filters: f,
      pageSize: PAGE_SIZE,
      page,
      status,
      orderType: type,
    });

    setResults(res.orders);
    setHasNext(res.hasMore);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setActiveFilters({ ...filters });
    setHasSearched(true);
    setCurrentPage(1);
 
    setOrderStatus("");
    setOrderType("");

    runSearch(filters, 1, "", "");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    runSearch(activeFilters, page, orderStatus, orderType);
  };

  const handleEditSearch = () => {
    setHasSearched(false);
  };

  const handleRemoveFilter = (field: keyof SearchFilters) => {
    const updated = { ...activeFilters, [field]: '' };
    setActiveFilters(updated);
    setFilters(updated);
    setCurrentPage(1);
    runSearch(updated, 1, orderStatus, orderType);
  };

  const handleStatusFilterChange = (value: string) => {
    setOrderStatus(value);
    setCurrentPage(1);
    runSearch(activeFilters, 1, value, orderType);
  };

  const handleTypeFilterChange = (value: string) => {
    setOrderType(value);
    setCurrentPage(1);
    runSearch(activeFilters, 1, orderStatus, value);
  };

  const inputClass = 'px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 shadow-inner text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full disabled:cursor-not-allowed disabled:opacity-40';
  const labelClass = 'text-slate-600 text-[10px] font-semibold uppercase tracking-wide';

  return (
    <div className='min-h-screen bg-slate-50'>
      <Header />

      <main className='flex flex-col pl-60 pt-14 gap-4 pb-8 overflow-y-auto'>
        {/* Page Header — always visible */}
        <section className='px-8 flex justify-between items-center'>
          <div className='flex flex-col'>
            <h2 className='text-slate-900 text-lg font-bold'>Search</h2>
            <p className='text-slate-500 text-xs'>Explore different ways to search orders</p>
          </div>

          {hasSearched && (
            <div className='flex items-center gap-2'>
              <FilterDropdown
                label='Order Status'
                options={ORDER_STATUS_OPTIONS}
                defaultValue={orderStatus || undefined}
                onChange={handleStatusFilterChange}
              />
              <FilterDropdown
                label='Order Type'
                options={ORDER_TYPE_OPTIONS}
                defaultValue={orderType || undefined}
                onChange={handleTypeFilterChange}
              />
            </div>
          )}
        </section>

        {/* Search Form + Ready State — replaced by results once searched */}
        {!hasSearched ? (
          <>
            <section className='px-8'>
              <form onSubmit={handleSearch} className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-5'>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="name" className={labelClass}>Name</label>
                    <input type="text" id="name" placeholder='Search name...' className={inputClass}
                      value={filters.name} onChange={e => handleChange('name', e.target.value)} />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="phone" className={labelClass}>Phone</label>
                    <input type="tel" id="phone" placeholder='Search phone...' className={inputClass}
                      value={filters.phone} onChange={e => handleChange('phone', e.target.value)} />
                  </div>

                  <div className='flex flex-col gap-1' >
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input type="email" id="email" placeholder='Search email...' className={inputClass}
                      value={filters.email} onChange={e => handleChange('email', e.target.value)} />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="route" className={labelClass}>Route #</label>
                    <input type="text" id="route" placeholder='Search route...' className={inputClass}
                      value={filters.route} onChange={e => handleChange('route', e.target.value)} disabled />
                  </div>

                  <div className='flex flex-col gap-1' >
                    <label htmlFor="rack" className={labelClass}>Rack #</label>
                    <input type="text" id="rack" placeholder='Search rack...' className={inputClass}
                      value={filters.rack} onChange={e => handleChange('rack', e.target.value)} disabled />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label className={labelClass}>Customer Group</label>
                    <Select value={filters.customerGroup} onValueChange={v => handleChange('customerGroup', v)} disabled>
                      <SelectTrigger className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 shadow-inner text-xs w-full h-auto">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="vip" className="rounded-lg cursor-pointer text-xs">VIP</SelectItem>
                        <SelectItem value="regular" className="rounded-lg cursor-pointer text-xs">Regular</SelectItem>
                        <SelectItem value="corporate" className="rounded-lg cursor-pointer text-xs">Corporate</SelectItem>
                        <SelectItem value="wholesale" className="rounded-lg cursor-pointer text-xs">Wholesale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="order-id" className={labelClass}>Order ID</label>
                    <input type="text" id="order-id" placeholder='e.g: 4215' className={inputClass}
                      value={filters.orderId} onChange={e => handleChange('orderId', e.target.value)} />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="summary" className={labelClass}>Summary</label>
                    <input type="text" id="summary" placeholder='Summary keywords...' className={inputClass}
                      value={filters.summary} onChange={e => handleChange('summary', e.target.value)} disabled />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="notes" className={labelClass}>Notes</label>
                    <input type="text" id="notes" placeholder='Search notes...' className={inputClass}
                      value={filters.notes} onChange={e => handleChange('notes', e.target.value)} disabled />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="placed-after" className={labelClass}>Placed After</label>
                    <input type="date" id="placed-after" className={inputClass}
                      value={filters.placedAfter} onChange={e => handleChange('placedAfter', e.target.value)} />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="placed-before" className={labelClass}>Placed Before</label>
                    <input type="date" id="placed-before" className={inputClass}
                      value={filters.placedBefore} onChange={e => handleChange('placedBefore', e.target.value)} />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label className={labelClass}>Payment</label>
                    <Select value={filters.payment} onValueChange={v => handleChange('payment', v)} >
                      <SelectTrigger className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 shadow-inner text-xs w-full h-auto">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="paid" className="rounded-lg cursor-pointer text-xs">Paid</SelectItem>
                        <SelectItem value="unpaid" className="rounded-lg cursor-pointer text-xs">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="paid-after" className={labelClass}>Paid After</label>
                    <input type="date" id="paid-after" className={inputClass}
                      value={filters.paidAfter} onChange={e => handleChange('paidAfter', e.target.value)} disabled={filters.payment === "paid" ? false : true} />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="paid-before" className={labelClass}>Paid Before</label>
                    <input type="date" id="paid-before" className={inputClass}
                      value={filters.paidBefore} onChange={e => handleChange('paidBefore', e.target.value)} disabled={filters.payment === "paid" ? false : true} />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="cleaned-after" className={labelClass}>Cleaned After</label>
                    <input type="date" id="cleaned-after" className={inputClass}
                      value={filters.cleanedAfter} onChange={e => handleChange('cleanedAfter', e.target.value)} disabled />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="cleaned-before" className={labelClass}>Cleaned Before</label>
                    <input type="date" id="cleaned-before" className={inputClass}
                      value={filters.cleanedBefore} onChange={e => handleChange('cleanedBefore', e.target.value)} disabled />
                  </div>

                </div>

                <div className='flex items-center gap-3 px-5 py-3 bg-slate-50 border-t border-slate-200'>
                  <button
                    type="submit"
                    className='px-4 py-2 flex items-center gap-1.5 bg-[#02d0ff] hover:bg-[#02b8e6] text-white text-xs rounded-lg font-medium transition-colors shadow-sm'
                  >
                    <SearchIcon className='h-3.5 w-3.5' />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className='px-4 py-2 flex items-center gap-1.5 text-[#02d0ff] hover:text-slate-800 hover:bg-slate-100 text-xs rounded-lg font-medium transition-colors'
                  >
                    Reset
                  </button>
                </div>
              </form>
            </section>

            <section className='px-8 flex flex-col items-center justify-center gap-2 py-1'>
              <div className='bg-[#EDF6FF] rounded-full p-5'>
                <TextSearch className='h-5 w-5 text-slate-600' strokeWidth={3} />
              </div>
              <h2 className='text-slate-900 text-sm font-semibold'>Ready To Search</h2>
              <p className='text-slate-500 text-xs text-center md:w-[40%]'>
                Enter your search criteria above and click search to view matching results. You can filter by customer, date, or order details.
              </p>
            </section>
          </>
        ) : (
          <SearchResults
            orders={results}
            activeFilters={activeFilters}
            onEditSearch={handleEditSearch}
            onRemoveFilter={handleRemoveFilter}
            onStatusUpdate={() => runSearch(activeFilters, currentPage, orderStatus, orderType)}
            currentPage={currentPage}
            hasNext={hasNext}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  )
}
