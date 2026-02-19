import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronDown, KeyRound, User } from "lucide-react";

interface UserDropDownProps{
    user: string;
}
export default function UserDropDown({user}:UserDropDownProps) {
    
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between px-3 py-5 items-center text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50 focus:text-indigo-600 focus:bg-slate-200/50 rounded-lg transition-all duration-200 cursor-pointer"
        >
        <div className="flex gap-3 w-full justify-start items-center">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/" />
            <AvatarFallback className="bg-blue-500 text-white text-xs font-bold">
             <User />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{user}</span>
        </div>
        <ChevronDown className="text-slate-500 h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        side="top"
        className="w-48 ml-2"
      >
        <DropdownMenuLabel className="text-slate-500">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
