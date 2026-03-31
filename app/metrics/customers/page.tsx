"use client";
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { 
  Download, Search, ChevronDown, ChevronLeft, ChevronRight, 
  Users as UsersIcon, FileText,
  LayoutList
} from 'lucide-react';

// --- Types ---
type TabType = "Orders" | "Invoices" | "New Customers" | "No Recent Orders" | "Deactivated";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  orderId: string;
  sales: number;
  revenue: number;
  lastOrder: string;
  totalOrders: number;
  spend: number;
  route: string;
  signupDate: string;
  address: string;
  customerId: string;
  credit: number;
  businessAccount: string;
  customerType: string;
  discount: string;
  emailOptIn: string;
  promoCode: string;
  notes: string;
  businessId: string;
}

//  Mock Data (Updated to include missing fields for new tabs)
const MOCK_DATA: CustomerData[] = [
  { id: '1', name: "Jane Doe", email: "example@email.com", phone: "+012345678990", date: "Oct 24, 2023", orderId: "#ORD-28491", sales: 1250, revenue: 1250, lastOrder: "1 Jan 2026", totalOrders: 22, spend: 0, route: "#1 Sashly Riyadh", signupDate: "10 Mar 2026", address: "1 St, Bandariyah Town", customerId: "1245", credit: 0, businessAccount: "Corporate", customerType: "VIP", discount: "0.00%", emailOptIn: "No", promoCode: "NA20", notes: "Notes...", businessId: "0" },
  { id: '2', name: "Alex Smith", email: "alex.s@provider.com", phone: "+012345678991", date: "Oct 25, 2023", orderId: "#ORD-28492", sales: 840.5, revenue: 840.5, lastOrder: "15 Feb 2026", totalOrders: 12, spend: 3200, route: "Riyadh-South", signupDate: "12 Jan 2024", address: "44 Al-Ma'athar St", customerId: "1246", credit: 150, businessAccount: "Individual", customerType: "Regular", discount: "0.00%", emailOptIn: "No", promoCode: "NA20", notes: "Notes...", businessId: "0" },
  { id: '3', name: "Robert White", email: "robert.w@domain.com", phone: "+012345678992", date: "Oct 25, 2023", orderId: "#ORD-28493", sales: 2100, revenue: 2100, lastOrder: "20 Mar 2026", totalOrders: 45, spend: 12800, route: "Jeddah-Central", signupDate: "05 Nov 2023", address: "92 King Fahd Rd", customerId: "1247", credit: 0, businessAccount: "Corporate", customerType: "VIP", discount: "0.00%", emailOptIn: "No", promoCode: "NA20", notes: "Notes...", businessId: "0" },
  { id: '4', name: "Maria King", email: "m.king@web.com", phone: "+012345678993", date: "Oct 26, 2023", orderId: "#ORD-28494", sales: 425, revenue: 425, lastOrder: "02 Mar 2026", totalOrders: 5, spend: 950, route: "Dammam-East", signupDate: "20 Feb 2024", address: "7 Al-Khobar Blvd", customerId: "1248", credit: 0, businessAccount: "Individual", customerType: "New", discount: "0.00%", emailOptIn: "No", promoCode: "NA20", notes: "Notes...", businessId: "0" },
  { id: '5', name: "Luke Hall", email: "l.hall@service.com", phone: "+012345678994", date: "Oct 26, 2023", orderId: "#ORD-28495", sales: 120, revenue: 120, lastOrder: "28 Feb 2026", totalOrders: 2, spend: 240, route: "Riyadh-North", signupDate: "01 Mar 2024", address: "18 Takhassusi St", customerId: "1249", credit: 50, businessAccount: "Corporate", customerType: "Regular", discount: "0.00%", emailOptIn: "No", promoCode: "NA20", notes: "Notes...", businessId: "0" },
];

export default function MetricsCustomersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [businessFilter, setBusinessFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All User");
  const [routeFilter, setRouteFilter] = useState("All Segments");

  const tabs: TabType[] = ["Orders", "Invoices", "New Customers", "No Recent Orders", "Deactivated"];

  // --- Unified Search & Filter Logic ---
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBusiness = businessFilter === "All" || item.businessAccount === businessFilter;
      const matchesCustomer = customerFilter === "All User" || item.customerType === customerFilter;
      const matchesRoute = routeFilter === "All Segments" || item.route === routeFilter;

      return matchesSearch && matchesBusiness && matchesCustomer && matchesRoute;
    });
  }, [searchTerm, businessFilter, customerFilter, routeFilter]);

  const getTableConfig = () => {
    switch (activeTab) {
      case "Orders":
        return {
          headings: ["CUSTOMER NAME", "DATE", "ORDER ID", "SALES", "REVENUE"],
          renderRow: (row: CustomerData) => (
            <>
              <td className="px-6 py-4 font-semibold text-slate-700">{row.name}</td>
              <td className="px-6 py-4 text-slate-500">{row.date}</td>
              <td className="px-6 py-4 text-slate-500">{row.orderId}</td>
              <td className="px-6 py-4 font-bold text-slate-700">SAR {row.sales.toLocaleString()}</td>
              <td className="px-6 py-4 font-bold text-purple-600">SAR {row.revenue.toLocaleString()}</td>
            </>
          )
        };
      case "Invoices":
        return {
          headings: ["CUSTOMER NAME", "INVOICES", "SALES", "REVENUE"],
          renderRow: (row: CustomerData) => (
            <>
              <td className="px-6 py-4 font-semibold text-slate-700">{row.name}</td>
              <td className="px-6 py-4 text-slate-500">{row.date}</td>
              <td className="px-6 py-4 font-bold text-slate-700">SAR {row.sales.toLocaleString()}</td>
              <td className="px-6 py-4 font-bold text-purple-600">SAR {row.revenue.toLocaleString()}</td>
            </>
          )
        };
      case "New Customers":
        return {
          headings: ["NAME", "EMAIL", "PHONE", "LAST ORDER", "TOTAL ORDER", "TOTAL SPEND", "ROUTE", "PROMO CODE", "SIGNUP DATE"],
          renderRow: (row: CustomerData) => (
            <>
              <td className="px-6 py-4 font-semibold text-slate-700">{row.name}</td>
              <td className="px-6 py-4 text-slate-500">{row.email}</td>
              <td className="px-6 py-4 text-slate-500">{row.phone}</td>
              <td className="px-6 py-4 text-slate-500">{row.lastOrder}</td>
              <td className="px-6 py-4 text-slate-500">{row.totalOrders}</td>
              <td className="px-6 py-4 font-bold text-purple-600">SAR {row.spend.toFixed(2)}</td>
              <td className="px-6 py-4 text-slate-500">{row.route}</td>
              <td className="px-6 py-4 text-slate-500">{row.promoCode}</td>
              <td className="px-6 py-4 text-slate-500">{row.signupDate}</td>
            </>
          )
        };
      case "No Recent Orders":
        return {
          headings: ["NAME", "EMAIL", "PHONE", "ADDRESS", "CUSTOMER ID", "DISCOUNT", "CREDIT", "EMAIL OPT IN", "PROMO SIGN UP ID", "NOTES", "TOTAL SPEND", "LAST ORDER", "SIGNUP DATE"],
          renderRow: (row: CustomerData) => (
            <>
              <td className="px-6 py-4 font-semibold text-slate-700">{row.name}</td>
              <td className="px-6 py-4 text-slate-500">{row.email}</td>
              <td className="px-6 py-4 text-slate-500">{row.phone}</td>
              <td className="px-6 py-4 text-slate-500 truncate max-w-37.5">{row.address}</td>
              <td className="px-6 py-4 text-slate-500">{row.customerId}</td>
              <td className="px-6 py-4 text-slate-500">{row.discount}</td>
              <td className="px-6 py-4 font-bold text-purple-600">SAR {row.credit.toFixed(2)}</td>
              <td className="px-6 py-4 text-slate-500">{row.emailOptIn}</td>
              <td className="px-6 py-4 text-slate-500">{row.promoCode}</td>
              <td className="px-6 py-4 text-slate-500">{row.notes}</td>
              <td className="px-6 py-4 font-bold text-purple-600">SAR {row.spend.toFixed(2)}</td>
              <td className="px-6 py-4 text-slate-500">{row.lastOrder === "NA20" ? row.lastOrder : "NA20"}</td>
              <td className="px-6 py-4 text-slate-500">{row.signupDate}</td>
            </>
          )
        };
      case "Deactivated":
        return {
          headings: ["NAME", "EMAIL", "PHONE", "ADDRESS", "CUSTOMER ID", "DISCOUNT", "CREDIT", "EMAIL OPT IN", "PROMO SIGN UP ID", "NOTES", "BUSINESS ID", "SIGNUP DATE"],
          renderRow: (row: CustomerData) => (
            <>
              <td className="px-6 py-4 font-semibold text-slate-700">Deleted by Customer {row.id === '1' ? '10541' : row.id}</td>
              <td className="px-6 py-4 text-slate-500">{row.email}</td>
              <td className="px-6 py-4 text-slate-500">{row.phone}</td>
              <td className="px-6 py-4 text-slate-500 truncate max-w-37.5">{row.address}</td>
              <td className="px-6 py-4 text-slate-500">{row.customerId}</td>
              <td className="px-6 py-4 text-slate-500">{row.discount}</td>
              <td className="px-6 py-4 font-bold text-purple-600">SAR {row.credit.toFixed(2)}</td>
              <td className="px-6 py-4 text-slate-500">{row.emailOptIn}</td>
              <td className="px-6 py-4 text-slate-500">{row.promoCode}</td>
              <td className="px-6 py-4 text-slate-500">{row.notes}</td>
              <td className="px-6 py-4 text-slate-500">{row.businessId}</td>
              <td className="px-6 py-4 text-slate-500">{row.signupDate}</td>
            </>
          )
        };
      default:
        return { headings: [], renderRow: () => null };
    }
  };
  const { headings, renderRow } = getTableConfig();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main className="flex flex-col pt-14 pl-60 min-h-screen pb-10">
        
        {/* Title & Date Bar */}
        <section className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customer Reports</h1>
            <p className="text-sm text-slate-500">Detailed breakdown of transaction metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              Oct 01, 2023 - Oct 31, 2023 <ChevronDown size={16} className="text-slate-400" />
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50">
              <FileText size={16} className="text-blue-500" /> Export PDF
            </button>
            <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </section>

        {/* Distribution & Stats */}
        <section className="grid grid-cols-12 gap-6 px-8 mb-8">
          <div className="col-span-3 space-y-4">
            <StatCard label="TOTAL CUSTOMERS" value="12,840" trend="+12.5% vs last month" icon={<UsersIcon size={18} className="text-purple-600"/>} iconBg="bg-purple-50" />
            <StatCard label="ACTIVE ORDERS" value="452" trend="-2.1% vs last month" trendDown icon={<LayoutList size={18} className="text-cyan-500"/>} iconBg="bg-cyan-50" />
          </div>
          <div className="col-span-9 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Distribution Overview</h3>
             <div className="space-y-4">
               {["Ahmed A", "Khalid A", "Robert R", "Jane Doe", "Alex Smith"].map((name, i) => (
                 <div key={name} className="flex items-center gap-4">
                   <span className="w-20 text-xs font-semibold text-slate-600">{name}</span>
                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-cyan-400" style={{ width: `${85 - (i * 12)}%` }} />
                   </div>
                   <span className="text-xs font-bold text-slate-800">SAR {(42840 - (i * 10000)).toLocaleString()}</span>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Tab Selection */}
        <section className="px-8">
          <div className="flex items-center gap-8 border-b border-slate-100 mb-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === tab ? "text-purple-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-full" />}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="flex items-end mb-6 justify-between">
            <div className='flex items-center gap-4'>
                <FilterDropdown label="BUSINESS ACCOUNT" value={businessFilter} onChange={setBusinessFilter} options={["All", "Corporate", "Individual"]} />
                <FilterDropdown label="CUSTOMERS" value={customerFilter} onChange={setCustomerFilter} options={["All User", "VIP", "Regular", "New"]} />
                <FilterDropdown label="ROUTES" value={routeFilter} onChange={setRouteFilter} options={["All Segments", "Riyadh-North", "Riyadh-South", "Jeddah-Central", "Dammam-East"]} />
            </div>
             <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm w-72">
               <Search size={14} className="text-slate-400 shrink-0" />
               <input
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search customers,orders..."
                 className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
               />
             </div>
           
          </div>
        </section>

        {/* Main Table */}
        <section className="">
          <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {headings.map(heading => (
                      <th key={heading} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        <div className="flex items-center gap-1 cursor-pointer">
                          {heading}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? (
                    filteredData.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors text-xs">
                        {renderRow(row)}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={headings.length} className="px-6 py-10 text-center text-slate-400 text-sm">No records found matching your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            
          </div>
        </section>
      </main>
    </div>
  );
}

// helpers
function StatCard({ label, value, trend, icon, iconBg, trendDown }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
      <div className={`absolute top-4 right-4 p-2 rounded-lg ${iconBg}`}>{icon}</div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
      <p className={`text-[10px] font-semibold mt-1 ${trendDown ? 'text-red-500' : 'text-emerald-500'}`}>{trend}</p>
    </div>
  );
}

function FilterDropdown({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      <div className="relative group">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-700 font-semibold outline-none cursor-pointer hover:border-slate-300 shadow-sm min-w-35"
        >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}