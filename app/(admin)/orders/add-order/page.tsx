"use client";

import { useState } from "react";
import { Plus, Minus, Trash2, Search, X, ArrowLeft, ChevronDown, ShoppingBasket, UserRound, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ItemDetailsDialog } from "@/components/orders/ItemDetailsDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ClothingItem {
  id: number;
  name: string;
  nameAr: string;
  price: string;
}

interface BasketEntry {
  item: ClothingItem;
  qty: number;
  palette?: string | null;
  stains?: string[];
  damages?: string[];
}

interface StainTagType {
  label: string;
  color: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CLOTHING_ITEMS: ClothingItem[] = [
  { id: 1, name: "Thob Colored", nameAr: "ثوب ملون",          price: "7.00" },
  { id: 2, name: "Sderiyah",     nameAr: "ثوب ملون",          price: "7.00" },
  { id: 3, name: "Taqiyah",      nameAr: "طاقية",             price: "7.00" },
  { id: 4, name: "Under Shirt",  nameAr: "فانيلة داخلية",    price: "7.00" },
  { id: 5, name: "Shemagh",      nameAr: "شماغ",              price: "7.00" },
  { id: 6, name: "Short",        nameAr: "شورت",              price: "7.00" },
  { id: 7, name: "Serwal",       nameAr: "سروال طويل داخلي",  price: "7.00" },
  { id: 8, name: "Thob White",   nameAr: "ثوب أبيض",          price: "7.00" },
  { id: 9, name: "Serwal",       nameAr: "سروال طويل داخلي",  price: "7.00" },
  { id: 10, name: "Thob White",   nameAr: "ثوب أبيض",          price: "7.00" },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: "c-001", name: "Abdullah Q",  phone: "+966 50 123 4567", avatarColor: "#7F50F4" },
  { id: "c-002", name: "Mohammed A",  phone: "+966 55 987 6543", avatarColor: "#02D0FF" },
  { id: "c-003", name: "Fatima S",    phone: "+966 54 456 7890", avatarColor: "#F87171" },
  { id: "c-004", name: "Omar K",      phone: "+966 56 321 0987", avatarColor: "#4F39F6" },
];

const STAIN_TAGS: Record<string, StainTagType[]> = {
  "Formal Shirt": [
    { label: "ALCOHOL",        color: "#F87171" },
    { label: "DRINK SPILL",    color: "#7F50F4" },
    { label: "COFFEE",         color: "#7F50F4" },
    { label: "MISSING COLLAR", color: "#F87171" },
  ],
};

// ─── Helper components ────────────────────────────────────────────────────────
const StainTag: React.FC<StainTagType> = ({ label, color }) => (
  <span
    className="inline-flex items-center justify-center px-2 py-0.5 rounded text-white font-semibold whitespace-nowrap"
    style={{ background: color, fontSize: 10 }}
  >
    {label}
  </span>
);

const ClothingCard: React.FC<{
  item: ClothingItem;
  onClick: () => void;
}> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-3 gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm
               hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
         style={{ background: "linear-gradient(135deg,#EEF2FF,#F3E8FF)" }}>
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M8 3L5 6v3h2v10h8V9h2V6l-3-3-2 2-2-2z" fill="#7F50F4" opacity="0.75" />
      </svg>
    </div>
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-[13px] font-bold text-[#1D293D] text-center leading-tight">{item.name}</span>
      <span className="text-[10px] font-medium text-[#90A1B9] text-center">{item.nameAr}</span>
      <span className="text-[13px] font-bold text-[#4F39F6] text-center">{item.price}</span>
    </div>
  </button>
);

const BasketItem: React.FC<{
  entry: BasketEntry;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ entry, onIncrement, onDecrement, onDelete }) => {
  const stains = entry.stains ?? [];
  const damages = entry.damages ?? [];
  return (
    <div className="flex justify-between items-start p-4 gap-3 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl ">
      {/* Left */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <span className="font-extrabold text-[#101828] text-base leading-tight">{entry.item.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[#101828]">QTY {entry.qty}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#02D0FF] inline-block shrink-0" />
          <span className="font-semibold text-sm text-[#7F50F4]">SAR {entry.item.price}</span>
        </div>
        {/* STAIN TAGS (Purple) */} 
        {stains.length  > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stains.map(stain => (
              <span
                key={stain}
                className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-[#F3E8FF] text-[#7F50F4]"
              >
                {stain}
              </span>
            ))}
          </div>
        )}
         {/* DAMAGE TAGS (Red) */}
        {damages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {damages.map(damage => (
              <span
                key={damage}
                className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-[#FEE2E2] text-[#F87171]"
              >
                {damage}
              </span>
            ))}
          </div>
        )}
        
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-100 rounded-2xl shrink-0">
        <button
          onClick={() => onIncrement(entry.item.id)}
          className="flex items-center justify-center hover:opacity-70 transition-opacity"
        >
          <Plus size={18} color="#02D0FF" strokeWidth={2.5} />
        </button>
        <span className="font-bold text-[#101828] text-sm min-w-4.5 text-center">{entry.qty}</span>
        {entry.qty === 1 ? (
          <button
            onClick={() => onDelete(entry.item.id)}
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <Trash2 size={16} color="#F87171" strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={() => onDecrement(entry.item.id)}
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <Minus size={18} color="#02D0FF" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AddOrder() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(MOCK_CUSTOMERS[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false)
  const [basket, setBasket] = useState<BasketEntry[]>([
    { item: { id: 101, name: "Formal Shirt", nameAr: "قميص رسمي", price: "7.00" }, qty: 4 },
    { item: { id: 102, name: "Formal Shirt", nameAr: "قميص رسمي", price: "7.00" }, qty: 1 },
  ]);

  // ── Basket handlers ──────────────────────────────────────────────────────────
  const addToBasket = (
  item: ClothingItem,
  quantity: number,
  palette: string | null,
  stains: string[],
  damages: string[]
) => {
  setBasket(prev => {
    // Check if identical configuration exists
    const existing = prev.find(entry =>
      entry.item.id === item.id &&
      entry.palette === palette &&
      JSON.stringify(entry.stains) === JSON.stringify(stains) &&
      JSON.stringify(entry.damages) === JSON.stringify(damages)
    );

    if (existing) {
      return prev.map(entry =>
        entry.item.id === existing.item.id
          ? { ...entry, qty: entry.qty + quantity }
          : entry
      );
    }

    return [
      ...prev,
      {
        item,
        qty: quantity,
        palette,
        stains,
        damages
      }
    ];
  });
};
  const increment = (id: number) =>
    setBasket(prev => prev.map(e => e.item.id === id ? { ...e, qty: e.qty + 1 } : e));
  const decrement = (id: number) =>
    setBasket(prev => prev.map(e => e.item.id === id ? { ...e, qty: e.qty - 1 } : e).filter(e => e.qty > 0));
  const removeItem = (id: number) =>
    setBasket(prev => prev.filter(e => e.item.id !== id));

  // ── Derived ─────────────────────────────────────────────────────────────────
  const subtotal   = basket.reduce((s, e) => s + parseFloat(e.item.price) * e.qty, 0);
  const tax        = subtotal * 0.15;
  const total      = subtotal + tax;
  const totalItems = basket.reduce((s, e) => s + e.qty, 0);
  const canCheckout = !!selectedCustomer && basket.length > 0;

  const filteredItems = CLOTHING_ITEMS.filter(i =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    i.nameAr.includes(itemSearch)
  );

  const filteredCustomers = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  return (
    <div className="min-h-screen bg-white ">
      <Header />

      <main className="flex flex-col pt-16 pl-60">

        {/* ── Page title bar ── */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Link href={"/orders"} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-[14px] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <X size={18} color="#62748E" strokeWidth={1.8} />
            </Link>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-bold text-[#101828] leading-8">New Order</h1>
              <p className="text-sm text-[#6A7282] font-normal">Service Item Selection</p>
            </div>
          </div>

          {/* Order type */}
          <Select>
              <SelectTrigger className="w-80 flex items-center gap-2 px-4 py-2.5 bg-white border border-cyan-200 rounded-lg text-[#45556C] font-bold text-xs hover:border-cyan-400 transition-colors [&>span]:text-cyan-400 [&>svg]:text-cyan-400">
              <SelectValue placeholder="Default Prices" />
               </SelectTrigger>
                </Select>
        </div>

        {/* ── Two-column body ── */}
        <div className="flex flex-1 gap-0 px-8 py-6 overflow-hidden">

          {/* ════ Left column ════ */}
          <div className="flex flex-col gap-6 w-150 shrink-0 overflow-y-auto pr-4">

            {/* ── 1. Assign Customers ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_5px_5px_rgba(0,0,0,0.06)]">
              {/* Card header */}
              <div className="flex items-center justify-between px-7 py-4 border-b border-gray-50">
                <span className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  1. Assign Customers
                </span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5FF] border border-purple-100 rounded-xl text-[#7F50F4] text-xs font-bold hover:bg-purple-100 transition-colors">
                  <Plus size={13} strokeWidth={2.5} />
                  Add New
                </button>
              </div>

              {/* Search */}
              <div className="px-7 pt-4 pb-3 relative">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                  <Search size={16} color="#94A3B8" strokeWidth={1.8} />
                  <input
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Type name or phone number..."
                    className="bg-transparent outline-none text-sm font-semibold text-[#101828] placeholder:text-[#94A3B8] placeholder:font-semibold w-full"
                  />
                </div>

                {/* Dropdown suggestions */}
                {showSuggestions && customerSearch && filteredCustomers.length > 0 && (
                  <div className="absolute left-7 right-7 top-[calc(100%-4px)] z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(""); setShowSuggestions(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: c.avatarColor }}
                        >
                          <UserRound size={14} color="#fff" strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#101828]">{c.name}</p>
                          <p className="text-xs text-[#94A3B8]">{c.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Selected customer card ── */}
              {selectedCustomer && (
                <div className="px-7 pb-5">
                  <div className="flex items-center justify-between px-4 py-3.5 bg-[#FAF5FF] border border-[rgba(0,184,219,0.3)] rounded-xl">
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: selectedCustomer.avatarColor }}
                      >
                        <UserRound size={18} color="#fff" strokeWidth={1.8} />
                      </div>
                      {/* Name + phone */}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-[#101828] leading-none">
                          {selectedCustomer.name}
                        </span>
                        <span className="text-xs font-semibold text-[#94A3B8] leading-none">
                          {selectedCustomer.phone}
                        </span>
                      </div>
                    </div>
                    {/* Remove */}
                    <button
                      onClick={() => setSelectedCustomer(null!)}
                      className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white transition-colors"
                    >
                      <X size={15} color="#62748E" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── 2. Select Items ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_5px_5px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden flex-1">
              {/* Card header */}
              <div className="flex items-center justify-between px-7 py-4  shrink-0">
                <span className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                  2. Select Items
                </span>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl w-48">
                  <Search size={13} color="#94A3B8" strokeWidth={1.8} />
                  <input
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    placeholder="Filter Clothing"
                    className="bg-transparent outline-none text-[10px] font-medium text-[#94A3B8] placeholder:text-[#94A3B8] w-full"
                  />
                </div>
              </div>

              {/* 4-col grid */}
              <div className="overflow-y-auto flex-1 p-6 max-h-75">
                <div className="grid grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <ClothingCard key={item.id} item={item} onClick={
                        ()=>{
                            setSelectedItem(item);
                            setItemDetailsOpen(true)
                        }
                    } />
                  ))}
                </div>
              </div>
              {selectedItem && (
                   <ItemDetailsDialog
                   open={itemDetailsOpen}
                   onOpenChange={setItemDetailsOpen}
                   item={selectedItem}
                   onAddToBasket={(item, quantity, palette, stains, damages) => {
                     addToBasket(item, quantity, palette, stains, damages)
                     setItemDetailsOpen(false)
                   }}
                 />
               )}
            </div>

          </div>


          {/* ════ Right column — Review ════ */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_5px_5px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Review header */}
            <div className="flex items-center justify-between px-7 py-4 bg-[#FBFCFD] border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBasket size={22} color="#02D0FF" strokeWidth={1.8} />
                <span className="text-xs font-bold text-[#101828] uppercase tracking-wider">Review</span>
              </div>
              <div className="px-2 py-1 bg-[#F1F5F9] rounded">
                <span className="text-xs font-semibold text-[#6A7282]">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              </div>
            </div>

            {/* Basket list */}
            <div className="flex flex-col gap-4 p-6 min-h-40 overflow-y-auto">
              {basket.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-sm italic font-bold text-[#6A7282] h-full">Basket is empty</span>
                </div>
              ) : (
                basket.map((entry, i) => (
                  <BasketItem
                    key={`${entry.item.id}-${i}`}
                    entry={entry}
                    onIncrement={increment}
                    onDecrement={decrement}
                    onDelete={removeItem}
                  />
                ))
              )}
            </div>

            {/* Summary + checkout */}
            <div className="px-6 py-5 border-t border-gray-100 bg-[rgba(248,250,252,0.5)] flex flex-col gap-3.5 shrink-0">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#90A1B9] uppercase tracking-[0.6px]">Subtotal</span>
                <span className="text-sm font-bold text-[#314158]">{subtotal.toFixed(2)}</span>
              </div>
              {/* Tax */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#90A1B9] uppercase tracking-[0.6px]">Tax (15%)</span>
                <span className="text-sm font-bold text-[#314158]">{tax.toFixed(2)}</span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <span className="text-xl font-bold text-[#0F172B] tracking-tight uppercase">Total</span>
                <span className="text-2xl font-bold text-right" style={{ color: total > 0 ? "#4F39F6" : "#90A1B9" }}>
                  SAR {total.toFixed(2)}
                </span>
              </div>

              {/* Checkout */}
              <button
                disabled={!canCheckout}
                className="w-full py-4 text-white font-extrabold text-sm rounded-2xl tracking-widest uppercase transition-all duration-200"
                style={{
                  background: canCheckout ? "#00D1FF" : "#B2EEF9",
                  boxShadow: canCheckout ? "0px 10px 15px -3px rgba(0,209,255,0.2), 0px 4px 6px -4px rgba(0,209,255,0.2)" : "none",
                  cursor: canCheckout ? "pointer" : "not-allowed",
                }}
              >
                CHECKOUT
              </button>

              {/* Validation hint */}
              {!canCheckout && (
                <div className="flex items-center justify-center gap-1.5">
                  <AlertCircle size={13} color="#EF4444" strokeWidth={2} />
                  <span className="text-[10px] font-semibold text-[#EF4444]">
                    {!selectedCustomer && basket.length === 0
                      ? "Missing Profile & Item"
                      : !selectedCustomer
                      ? "Missing Customer Profile"
                      : "No Items Selected"}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}