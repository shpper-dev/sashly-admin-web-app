"use client";
import Header from "@/components/Header";
import AddProductDialog from "@/components/products/AddProductDialog";
import ProductCard from "@/components/products/ProductCard";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const filters = [
  "All Items",
  "Wash & Iron",
  "Steam & Special Care",
  "Bedding",
  "Iron",
  "Shoes",
];

const products = [
  {
    image: "/images/products/thob.png",
    name_en: "Thob",
    name_ar: "ثوب",
    category: "WASH & IRON",
    price: 6.0,
  },
  {
    image: "/images/products/sderiyah.png",
    name_en: "Sderiyah",
    name_ar: "سديرية",
    category: "WASH & IRON",
    price: 6.0,
  },
  {
    image: "/images/products/taqiyah.png",
    name_en: "Taqiyah",
    name_ar: "طاقية",
    category: "IRON",
    price: 6.0,
  },
  {
    image: "/images/products/undershirt.png",
    name_en: "Undershirt",
    name_ar: "فانيلة داخلية",
    category: "IRON",
    price: 6.0,
  },
  {
    image: "/images/products/shemagh.png",
    name_en: "Shemagh",
    name_ar: "شماغ",
    category: "WASH & IRON",
    price: 6.0,
  },
  {
    image: "/images/products/thob-colored.png",
    name_en: "Thob Colored",
    name_ar: "ثوب ملون",
    category: "STEAM & SPECIAL CARE",
    price: 6.0,
  },
  {
    image: "/images/products/shorts.png",
    name_en: "Shorts",
    name_ar: "شورت",
    category: "WASH & IRON",
    price: 6.0,
  },
  {
    image: "/images/products/serwal.png",
    name_en: "Serwal",
    name_ar: "سروال طويل داخلي",
    category: "WASH & IRON",
    price: 6.0,
  },
];

export default function Products() {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [searchTerm, setSearchTerm] = useState("");

  //  Combined filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filtering
      const matchesCategory =
        activeFilter === "All Items" ||
        product.category.toLowerCase() === activeFilter.toLowerCase();

      // Search filtering (EN + AR)
      const matchesSearch =
        product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name_ar.includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

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
            <Select>
              <SelectTrigger className="w-70 flex items-center gap-2 px-4 py-5 bg-white border border-cyan-200 rounded-lg text-[#45556C] font-bold text-xs hover:border-cyan-400 transition-colors [&>span]:text-cyan-400 [&>svg]:text-cyan-400">
                <SelectValue placeholder="Default Prices" />
              </SelectTrigger>
            </Select>

            <AddProductDialog>
              <button
              className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors shadow-md cursor-pointer"
            >
              + Add Product
            </button>
            </AddProductDialog>
          </div>
        </section>

        {/* Search + Filters + Products */}
        <section className="px-6 flex flex-col gap-6">
          <div className="flex justify-between">
            {/*  SEARCH */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg shadow-sm w-100">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent outline-none text-xs font-semibold text-[#101828] placeholder:text-[#94A3B8] placeholder:font-semibold w-full"
              />
            </div>

            {/* FILTERS */}
            <div className="flex gap-3.5">
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

          {/*  PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.name_en} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-400 font-semibold">
                No products found.
              </div>
            )}
          </div>
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