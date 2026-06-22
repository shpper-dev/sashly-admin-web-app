import { serverTimestamp } from "firebase/firestore";
import { Driver } from "../models/driver.model";

export function serializeDriver(driver: Partial<Driver>){

    return{
       phoneNumber: driver.phoneNumber ?? "",            
       name: driver.name ?? "",
       email: driver.email ?? "",
       profileImageUrl: driver.profileImageUrl ?? "",
       
       designatedArea: driver.designatedArea ?? null,
   
       fcmToken: driver.fcmToken ?? "",
       isActive: driver.isActive ?? true,              
       isOnline: driver.isOnline ?? true,             
       
       enableDriverOfferResponse: driver.enableDriverOfferResponse ?? true,

       // counts
       activeOrderCount: driver.activeOrderCount ?? 0,
       ordersAssignedToday: driver.ordersAssignedToday ?? 0,
       ordersCompletedToday: driver.ordersCompletedToday ?? 0,
       maxActiveOrders: driver.maxActiveOrders ?? 5,
   
       // dates
       lastAssignedAt: driver.lastAssignedAt ??  null,

       createdAt: driver.createdAt ?? serverTimestamp(),
       updatedAt: driver.updatedAt ??  null,
    }
}