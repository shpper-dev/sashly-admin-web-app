"use client";
import { useState } from 'react';
import { 
  ArrowUpRight, 
  FileText, 
  Download, 
  Search, 
  ChevronDown,
  LayoutGrid,
  Shirt,
  Zap,
  ArrowUpDown
} from 'lucide-react';
import Header from '@/components/Header';

// --- Types ---
type ProductData = {
  id: number;
  product: string;
  section: string;
  quantity: number;
  sales: number;
  deliveryContribution: number;
};

type SectionData = {
  id: number;
  sectionName: string;
  quantity: number;
  pieces: number;
  sales: number;
  deliveryContribution: number;
};

// --- Mock Data ---
const products: ProductData[] = [
  { id: 1, product: "Classic Thob", section: "Menswear", quantity: 1240, sales: 1250.00, deliveryContribution: 150.00 },
  { id: 2, product: "Silk Saree", section: "Ethnic Wear", quantity: 412, sales: 840.50, deliveryContribution: 80.00 },
  { id: 3, product: "Cotton Shirt", section: "Formal Wear", quantity: 380, sales: 2100.00, deliveryContribution: 210.00 },
  { id: 4, product: "Formal Suit (3pc)", section: "Casuals", quantity: 2150, sales: 425.00, deliveryContribution: 45.00 },
  { id: 5, product: "Basic Shirt", section: "Formal Wear", quantity: 380, sales: 120.00, deliveryContribution: 12.00 },
];

const sections: SectionData[] = [
  { id: 1, sectionName: "Wash & Iron", quantity: 1240, pieces: 3782, sales: 1250.00, deliveryContribution: 125.00 },
  { id: 2, sectionName: "Wash & Iron", quantity: 1240, pieces: 3782, sales: 1250.00, deliveryContribution: 125.00 },
  { id: 3, sectionName: "Wash & Iron", quantity: 1240, pieces: 3782, sales: 1250.00, deliveryContribution: 125.00 },
  { id: 4, sectionName: "Wash & Iron", quantity: 1240, pieces: 3782, sales: 1250.00, deliveryContribution: 125.00 },
  { id: 5, sectionName: "Wash & Iron", quantity: 1240, pieces: 3782, sales: 1250.00, deliveryContribution: 125.00 },
];

export default function MetricsTopSellingPage() {
  const [showDelivery, setShowDelivery] = useState(false);
  const [activeMode, setActiveMode] = useState<'items' | 'sections'>('items');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16 pb-8 pl-60 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Top Selling Items</h1>
            <p className="text-sm text-slate-500">Detailed breakdown of top selling items</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
               <span className="text-slate-400">📅</span>
               Oct 01, 2023 - Oct 31, 2023
               <ChevronDown size={16} className="text-slate-400" />
             </div>
             <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
               <FileText size={16} className="text-blue-500" /> Export PDF
             </button>
             <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600 transition">
               <Download size={16} /> Export CSV
             </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          <StatCard title="TOP ITEM" value="Thob" subValue="1,240 Units" trend="+12%" icon={<Shirt className="text-cyan-500" />} iconBg="bg-cyan-50" />
          <StatCard title="TOP SERVICE" value="Dry Cleaning" subValue="42% of Total Orders" trend="+5.2%" icon={<Zap className="text-blue-500" />} iconBg="bg-blue-50" />
          <StatCard title="BEST COMBO" value="Thob + Pressing" subValue="842 Bundled Orders" trend="+18%" icon={<LayoutGrid className="text-purple-500" />} iconBg="bg-purple-50" />
        </div>
        {/* Charts and Lists Section */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
          {/* Matrix Bar Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Service vs. Item Matrix</h3>
            <div className="space-y-6">
              <MatrixRow label="Thob" wash={50} dry={30} press={20} />
              <MatrixRow label="Shirt" wash={35} dry={45} press={20} />
              <MatrixRow label="Suit" wash={10} dry={70} press={20} />
              <MatrixRow label="Dress" wash={25} dry={55} press={20} />
            </div>
            {/* Legend */}

            <div className="flex justify-center gap-6 mt-8 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-sm" /> Washing</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm" /> Dry Cleaning</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-400 rounded-sm" /> Pressing</div>
            </div>
          </div>

          {/* Side Lists */}

          <div className="space-y-6">

            <RankingList title="Top Items by Volume" items={[
              { label: 'Thob', value: '1.2k' },
              { label: 'Casual Shirt', value: '850' },
              { label: 'Wool Suit', value: '620' }
            ]} />

            <RankingList title="Top Services by Revenue" items={[
              { label: 'Dry Cleaning', value: 'SAR 18,420' },
              { label: 'Luxury Press', value: 'SAR 12,105' },
              { label: 'Steam Washing', value: 'SAR 9,840' }
            ]} isCurrency />

          </div>

        </div>

        {/* Detailed Table Section */}
        <div className='px-6'>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toggle Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800">Detailed Product Breakdown</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveMode('items')}
                  className={`px-6 py-1 text-sm font-medium rounded-md transition-all ${activeMode === 'items' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                >
                  Items
                </button>
                <button 
                  onClick={() => setActiveMode('sections')}
                  className={`px-6 py-1 text-sm font-medium rounded-md transition-all ${activeMode === 'sections' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                  Sections
                </button>
              </div>
            </div>
            
            {/* Control Bar */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowDelivery(!showDelivery)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none ${showDelivery ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ${showDelivery ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Show Delivery Contribution</span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder={`Filter ${activeMode}...`} className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Table Content */}
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-medium uppercase text-[11px] tracking-widest border-b border-slate-100">
                <tr>
                  {activeMode === 'items' ? (
                    <>
                      <th className="px-6 py-4 flex items-center gap-1">Product</th>
                      <th className="px-6 py-4">Section Name</th>
                    </>
                  ) : (
                    <th className="px-6 py-4">Section Name</th>
                  )}
                  <th className="px-6 py-4">Quantity</th>
                  {activeMode === 'sections' && <th className="px-6 py-4">Pieces</th>}
                  <th className="px-6 py-4">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeMode === 'items' ? (
                  products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{item.product}</td>
                      <td className="px-6 py-4 text-slate-500">{item.section}</td>
                      <td className="px-6 py-4 text-slate-500">{item.quantity.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-purple-600">
                        SAR {item.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {showDelivery && (
                          <span className="ml-2 text-slate-400 font-medium">(SAR {item.deliveryContribution.toFixed(2)})</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  sections.map((sec) => (
                    <tr key={sec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{sec.sectionName}</td>
                      <td className="px-6 py-4 text-slate-500">{sec.quantity.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-500">{sec.pieces.toLocaleString()}</td>
                      <td className="px-6 py-4  font-bold text-purple-600">
                        SAR {sec.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {showDelivery && (
                          <span className="ml-2 text-slate-400 font-medium">(SAR {sec.deliveryContribution.toFixed(2)})</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}


// helpers
const StatCard = ({ title, value, subValue, trend, icon, iconBg }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
    <div className={`absolute top-6 right-6 p-2 rounded-lg ${iconBg}`}>{icon}</div>
    <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{title}</p>
    <h2 className="text-2xl font-bold text-slate-800 mt-2">{value}</h2>
    <div className="flex items-center justify-between mt-1">
      <p className="text-sm text-slate-500">{subValue}</p>
      <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
        <ArrowUpRight size={14} /> {trend}
      </span>
    </div>
  </div>
);

const MatrixRow = ({ label, wash, dry, press }: any) => (
  <div className="flex items-center gap-4">
    <span className="w-12 text-xs font-medium text-slate-400">{label}</span>
    <div className="flex-1 flex h-8 rounded-md overflow-hidden">
      <div style={{ width: `${wash}%` }} className="bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold px-1.5">WASH ({wash}%)</div>
      <div style={{ width: `${dry}%` }} className="bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold border-l border-white/20">DRY ({dry}%)</div>
      <div style={{ width: `${press}%` }} className="bg-cyan-400 flex items-center justify-center text-[10px] text-white font-bold border-l border-white/20">PRESS ({press}%)</div>
    </div>
  </div>
);

const RankingList = ({ title, items, isCurrency }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
    <div className="space-y-4">
      {items.map((item: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 text-xs font-bold">0{idx + 1}</span>
            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
          </div>
          <span className={`text-sm font-bold ${isCurrency ? 'text-emerald-600' : 'text-blue-600'}`}>{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);
