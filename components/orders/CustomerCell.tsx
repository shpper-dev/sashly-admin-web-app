"use client";
import { useState } from "react";
import { User } from "@/lib/models/user.model";
import { Business } from "@/lib/models/business.model";
import { getUserById } from "@/lib/firebase/user";
import { getBusinessById } from "@/lib/firebase/business";
import UserInfoDialog from "@/components/users/UserInfoDialog";
import BusinessInfoDialog from "@/components/business/BusinessInfoDialog";

interface CustomerCellProps {
  userId: string;
  userName: string;   // from order snapshot
  userPhone?: string;
  onDelete?: () => void;
}

export default function CustomerCell({ userId, userName, userPhone, onDelete }: CustomerCellProps) {
  const [user, setUser] = useState<User>();
  const [business, setBusiness] = useState<Business>();
  const [isBusiness, setIsBusiness] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleOpen = async () => {
    if (user || business) return; // already resolved, skip

    setFetching(true);
    try {
      const fetchedUser = await getUserById(userId);
      if (fetchedUser) {
        setUser(fetchedUser);
        return;
      }

      // not in the users collection — this order likely belongs to a business account
      const fetchedBusiness = await getBusinessById(userId);
      if (fetchedBusiness) {
        setBusiness(fetchedBusiness);
        setIsBusiness(true);
      }
    } finally {
      setFetching(false);
    }
  };

  const trigger = (
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
  );

  if (isBusiness) {
    return (
      <BusinessInfoDialog business={business} autoOpen>
        {trigger}
      </BusinessInfoDialog>
    );
  }

  return (
    <UserInfoDialog user={user as User} onDelete={onDelete}>
      {trigger}
    </UserInfoDialog>
  );
}