"use client";
import {Eye, LayoutDashboard,Search, LogOut, Megaphone, OctagonAlert, Package, Settings, Shirt, TriangleAlert, Truck, Users, Wallet, ChevronDown, TicketPercent, Tags, Loader2, Briefcase, Activity} from "lucide-react";
import Link from "next/link";
import UserDropDown from "./UserDropDown";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { getCurrentUser } from "@/lib/firebase/admin.auth";
import { Admin } from "@/lib/models/admin.model";

const navItems = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/"
    },
    {
        name: "Overview",
        icon: Eye,
        href: "/overview"
    },
    {
        name: "Search",
        icon: Search,
        href: "/search"
    },
    {
        name:"Orders",
        icon: Package,
        href:"/orders"
    },
    {
        name:"Disputes",
        icon: TriangleAlert,
        href:"/disputes",
    },{
        name:"Users",
        icon: Users,
        href:"/users"
    },
    {
        name:"Drivers",
        icon: Truck,
        href:"/drivers"
    },
    {
        name:"Products",
        icon: Shirt,
        href:"/products"
    },
    {
        name:"Promotions",
        icon: Tags,
        href:"/coupons"
    },
    {
        name:"Broadcast",
        icon: Megaphone,
        href:"/broadcast"
    },
    {
        name:"Finance",
        icon: Wallet,
        href:"/finance"
    },
    {
        name:"Business Accounts",
        icon: Briefcase ,
        href:"/business-accounts"
    },
    {
        name:"Metrics",
        icon: Activity ,
        href:"/metrics/top-selling"
    }

    // {
    //     name:"Reports",
    //     icon: OctagonAlert ,
    //     href:"/reports"
    // }
]


export default function SideBar() {
    const pathname = usePathname();
    const [productsOpen, setProductsOpen] = useState(false);
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [mounted, setMounted] = useState(false); // Add this

    useEffect(() => {
        setMounted(true); // Set to true once client-side
        async function fetchAdminProfile() {
            try {
                const current = await getCurrentUser();
                setAdmin(current);
            } catch (error) {
                console.error("Error fetching admin profile:", error);
            }
        }
        fetchAdminProfile();
    }, []);

    // If not mounted, return a simplified version or null to prevent ID mismatch
    if (!mounted) return <div className="fixed flex items-center justify-center w-60 h-full border-r bg-white"><Loader2 className="h-5 w-5 text-slate-500 animate-spin" /></div>;

   
  return (
    <div className={`fixed top-0 left-0 flex flex-col bg-white text-sm h-full w-60 border-r border-r-blue-500/30 ${(pathname === "/orders/delivery-manifest"|| pathname.startsWith("/disputes/resolution") || pathname.startsWith("/orders/reports")) ? "hidden" : "flex"}`}>
        <div className="flex mt-3 ml-6 w-full justify-center">
            <img src="/images/logo.png" alt="sashly logo" className="h-14"  />
        </div>
        <div className="w-54 flex flex-col justify-between h-full px-2 mt-3">
            {/* top section */}
            <nav className="space-y-1">
               {navItems.map((item) => {
                 const Icon = item.icon;             

                 // PRODUCTS DROPDOWN
                 if (item.name === "Products") {
                   return (
                     <DropdownMenu key={item.name}>
                        <DropdownMenuTrigger asChild>
                          <button
                          onClick={()=> setProductsOpen(!productsOpen)}
                            className={`flex w-full items-center justify-between px-3 py-2 rounded-lg transition-all duration-200
                            ${
                              pathname.startsWith("/products")
                                ? "bg-slate-200/70 text-indigo-600 font-medium"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                                <Icon className="h-5 w-5" />
                                <span className="flex-1 text-left">Products</span>
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                productsOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </DropdownMenuTrigger>                      

                        <DropdownMenuContent align="start" className="w-50 ml-6">
                          <DropdownMenuItem asChild>
                            <Link href="/products">Products</Link>
                          </DropdownMenuItem>                      

                          <DropdownMenuItem asChild>
                            <Link href="/products/categories">Categories</Link>
                          </DropdownMenuItem>                      

                          <DropdownMenuItem asChild>
                            <Link href="/products/services">Services</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                   );
                 }             

                 // NORMAL NAV ITEMS
                 return (
                   <Link
                     href={item.name === "Reports" ? "" : item.href}
                     key={item.name}
                     className={`flex gap-3 mb-0.5 px-3 py-2 rounded-lg transition-all duration-200
                     ${
                       pathname === item.href
                         ? "bg-slate-200/70 text-indigo-600 font-medium"
                         : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50"
                     }`}
                   >
                     <Icon className="h-5 w-5" />
                     <span>{item.name}</span>
                   </Link>
                 );
               })}
             </nav>
            {/* Bottom section */}
            <div className="flex flex-col w-50 mb-2 ">
                <hr className="border-slate-200 mb-2" />

                <Link href="/settings" className="flex gap-1 px-3 py-2 rounded-lg text-slate-500 hover:text-indigo-600 focus:text-indigo-600 hover:bg-slate-200/50 focus:bg-slate-200/50 transition-all duration-200">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </Link>

                <UserDropDown user={admin?.firstName || "Admin"}/>
                {/* <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-red-500  hover:bg-slate-200/50 cursor-pointer w-full text-left"
                onClick={async ()=> {
                    await logoutAdmin();
                    // router.refresh();
                }}>
                <LogOut className="h-5 w-5 text-red-500" /> <span className="">Sign Out</span>
                </button> */}

            </div>
            </div>
        </div>
  )
}
