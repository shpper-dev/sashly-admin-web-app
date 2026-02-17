import {LayoutDashboard, LogOut, Megaphone, OctagonAlert, Package, Settings, TriangleAlert, Truck, Users, Wallet} from "lucide-react";
import Link from "next/link";
import UserDropDown from "./UserDropDown";

const navItems = [
    {
        name: "Overview",
        icon: LayoutDashboard,
        href: "/"
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
        name:"Reports",
        icon: OctagonAlert ,
        href:"/reports"
    }
]


export default function SideBar() {
  return (
    <div className="fixed top-0 left-0 flex flex-col bg-white text-sm min-h-screen w-60 border-r border-r-blue-500/30 ">
        <div className="flex mt-3 ml-6 w-full justify-center">
            <img src="/images/logo.png" alt="sashly logo" className="h-14"  />
        </div>
        <div className="w-full flex flex-col  justify-between h-full px-2 mt-6">
            {/* top section */}
            <nav className="space-y-1">
                {navItems.map((item)=>{
                    const Icon = item.icon;
                    return (


                        <Link href={item.href} key={item.name} className="flex gap-3 w-50 mb-0.5 px-3 py-3 rounded-lg text-slate-500 hover:text-indigo-600 focus:text-indigo-600 hover:bg-slate-200/50 focus:bg-slate-200/50 transition-all duration-200">
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

            </nav>
            {/* Bottom section */}
            <div className="flex flex-col w-50 mb-4 space-y-1">
                <hr className="border-slate-200 mb-2" />

                <Link href="/settings" className="flex gap-3  px-3 py-3 rounded-lg text-slate-500 hover:text-indigo-600 focus:text-indigo-600 hover:bg-slate-200/50 focus:bg-slate-200/50 transition-all duration-200">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </Link>

                <UserDropDown user="John"/>
                <button className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-red-500  hover:bg-slate-200/50 cursor-pointer w-full text-left">
                <LogOut className="h-5 w-5 text-red-500" /> <span className="">Sign Out</span>
                </button>

            </div>
            </div>
        </div>
  )
}
