"use client";
import Header from "@/components/Header";
import ProductCard from "@/components/products/ProductCard";
import { Search, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Item, Service } from "@/lib/models/product.model";
import { useToast } from "@/lib/providers/ToastProvider";
import ItemDialog from "@/components/products/ItemDialog";
import { EmptyState, ErrorState } from "@/components/states";

export default function Products() {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [searchTerm, setSearchTerm]     = useState("");
  const [items, setItems]               = useState<Item[]>([]);
  const [services, setServices]         = useState<Service[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(false);
  const {showToast}                     = useToast();

  // fetch items + services 
  const fetchData = async () =>{
    setFetchError(false);
    try {
    const [itemsSnap, servicesSnap] = await Promise.all([
          getDocs(collection(db, "Items")),
          getDocs(collection(db, "Services")),
        ]);
        setItems(itemsSnap.docs.map((d) => d.data() as Item));
        setServices(servicesSnap.docs.map((d) => d.data() as Service));
    } catch (e) {
     console.error("Failed to fetch products data:", e);
     showToast("Failed to load products.", "error");
     setFetchError(true);
     throw e; // preserve existing catch in initalMount below
   }
    
  }
  useEffect(() => {
      setLoading(true);
      async function initalMount() {
       try {
        await fetchData();
      } catch (e) {
        console.error("Failed to fetch products data:", e);
      } finally {
        setLoading(false);
      }
      }
      initalMount();
  }, []);


  //filters = "All Items" + each service name 
  const filters = useMemo(
    () => ["All Items", ...services.map((s) => s.name)],
    [services]
  );

  // filtering logic 
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter — match if item has the selected service
      const matchesFilter =
        activeFilter === "All Items" ||
        item.services.some(
          (s: { name: string; }) => s.name.toLowerCase() === activeFilter.toLowerCase()
        );

      // Search filter — EN + AR
      const matchesSearch =
        item.searchTerms.some((term: string)=>{
          return term.toLowerCase().includes(searchTerm.toLowerCase());
        })

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm, items]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex flex-col min-h-screen pl-60 pt-16 gap-6">
        {/* Page header */}
        <section className="flex justify-between px-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-slate-500">
              Manage your laundry items, prices and categorising
            </p>
          </div>

          <div className="flex gap-3 items-center">

            <ItemDialog mode="add" onSuccess={fetchData}>
              <button className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors shadow-md cursor-pointer">
                + Add Product
              </button>
            </ItemDialog>
          </div>
        </section>

        {/* Search + Filters + Products */}
        <section className="px-6 flex flex-col gap-6">
          <div className="flex justify-between">
            {/* SEARCH */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg shadow-sm w-100">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent outline-none text-xs font-semibold text-[#101828] placeholder:text-[#94A3B8] placeholder:font-semibold w-full"
              />
            </div>

            {/* FILTERS — service names */}
            <div className="flex gap-3.5 flex-wrap">
              {filters.map((label) => (
                <FilterButton
                  key={label}
                  label={label}
                  active={activeFilter === label}
                  onClick={() => setActiveFilter(label)}
                />
              ))}
            </div>
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-medium">Loading products…</span>
            </div>
          ) : fetchError ? (
             <ErrorState description="Couldn't load products." onRetry={fetchData} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <ProductCard key={item.id} product={item} onDeleted={() => { showToast(`Deleted ${item.name}`, "error"); fetchData(); }} onUpdated={ fetchData} />
                ))
              ) : (
                <div className="col-span-full">
                   <EmptyState
                     title="No products found"
                     description={searchTerm || activeFilter !== "All Items"
                       ? "Try adjusting your search or filter."
                       : "Add your first product to get started."}
                     className="border-0"
                   />
                 </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition shadow-sm ${
        active
          ? "bg-purple-600 hover:bg-purple-700 text-white"
          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}