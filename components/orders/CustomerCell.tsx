"use client";
import { useState } from "react";
import { User } from "@/lib/models/user.model";
import { getUserById } from "@/lib/firebase/user";
import UserInfoDialog from "@/components/users/UserInfoDialog";

interface CustomerCellProps {
  userId: string;
  userName: string;   // from order snapshot 
  userPhone?: string; 
  onDelete?: () => void;
}

export default function CustomerCell({ userId, userName, userPhone, onDelete }: CustomerCellProps) {
  const [user, setUser] = useState<User>();
  const [fetching, setFetching] = useState(false);

  const handleOpen = async () => {
    if (user) return; // already fetched, skip
    setFetching(true);
    try {
      const fetched = await getUserById(userId);
      if(fetched){
        setUser(fetched);
      }

    } finally {
      setFetching(false);
    }
  };

  return (
    <UserInfoDialog
      user={user as User}
      onDelete={onDelete}
    >
      <div className="flex flex-col cursor-pointer" onClick={handleOpen}>
        <span className="font-medium text-slate-800 hover:text-purple-600 hover:underline">
          {userName}
        </span>
        {userPhone && (
          <span className="text-xs text-slate-400">{userPhone}</span>
        )}
        {fetching && (
          <span className="text-[10px] text-slate-300">Loading...</span>
        )}
      </div>
    </UserInfoDialog>
  );
}