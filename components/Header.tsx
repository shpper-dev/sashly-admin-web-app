import { Bell, MessageSquare, Search } from "lucide-react"

interface HeaderProps{
    title: string
}
export default function Header({title = "Dashboard"}: HeaderProps) {
  return (
    <div className="fixed bg-white top-0 h-12 left-60 right-0 border-b border-b-blue-500/30 z-10">
        <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center px-4 py-1.5 bg-slate-200/50 rounded-lg text-sm  gap-2">
                <Search className="h-4 w-4 text-gray-500 shrink-0" />
                <input type="text" placeholder="Search order, drivers, etc" className="bg-transparent border-none outline-none text-sm placeholder:text-gray-400" />
            </div>
            {/* right section -message and notification */}
        <div className="flex items-center">
          <div className="w-px h-5 bg-slate-300"></div>
            <button
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Messages"
          >
            <MessageSquare className="h-5 w-5 text-gray-500"  />
          </button>
            
            <button
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-500" />
            {/* Notification badge : add it after*/}
            {/* <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span> */}
          </button>
        </div>
        </div>
        
    </div>
  )
}
