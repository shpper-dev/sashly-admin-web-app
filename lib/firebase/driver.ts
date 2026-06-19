import { collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { DesignatedArea, Driver } from "../models/driver.model";
import { db } from "./config";
import { mapDriver } from "../mappers/driver.mapper";
import { serializeDriver } from "../serializers/driver.serializer";
import { Order } from "../models/order.model";

export async function getDrivers(activeOnly = false): Promise<Driver[]> {
  const constraints = activeOnly
    ? [where("isActive", "==", true), orderBy("createdAt", "desc")]
    : [orderBy("createdAt", "desc")];

  const q = query(collection(db, "drivers"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapDriver);
}

// to update drivers
export async function updateDriver(driverId: string, updates:Partial<Driver>) {
    const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

   await updateDoc(doc(db, "drivers", driverId), {
     ...cleanUpdates,
     updatedAt: serverTimestamp(),
   });
    
}


export async function createDriver(data: {
  phoneNumber: string; 
  name: string;
  email?: string;
  profileImageUrl?: string | null;
  designatedArea?: DesignatedArea | null;
}) {
  // Strip the "+" if it exists, otherwise use the number as is
  const driverId = data.phoneNumber.startsWith('+') 
    ? data.phoneNumber.slice(1).trim() 
    : data.phoneNumber.trim();

  const driverRef = doc(db, "drivers", driverId);

  // Initial driver state
  const newDriver: Partial<Driver> = {
    ...data,
    id: driverId, // ID without the +
    isActive: true,
    isOnline: false,
    designatedArea: data.designatedArea ?? null ,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  // Sanitize and save
  const sanitizedData = serializeDriver(newDriver);
  await setDoc(driverRef, sanitizedData);

  return driverId;
}


//Real-time subscription to all active orders assigned to a specific driver */
export function subscribeToActiveOrdersByDriverId(
  driverId: string,
  callback: (orders: Order[]) => void
): () => void {
  const q = query(
    collection(db, "orders"),
    where("assignedDriverId", "==", driverId),
    where("isDelivered", "==", false),
    where("isCancelled", "==", false),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
    callback(orders);
  });
}

//Real-time subscription to ALL orders for a driver 
export function subscribeToAllOrdersByDriverId(
  driverId: string,
  callback: (orders: Order[]) => void
): () => void {
  const q = query(
    collection(db, "orders"),
    where("assignedDriverId", "==", driverId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
    callback(orders);
  });
}