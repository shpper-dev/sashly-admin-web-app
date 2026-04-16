import { db } from "@/lib/firebase/config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect } from "react";


export function useOrderServiceDowngrade(orderId: string, onUpdate?: () => void) {
  useEffect(() => {
    if (!orderId) return;

    const orderRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(orderRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      // downgrade logic
      if (data.serviceType === "express" && !data.isDelivered && !data.isCancelled) {
        
        const pickedUpDate = new Date(data.pickUpStartTime).setHours(0, 0, 0, 0);
        const today = new Date().setHours(0, 0, 0, 0);

        if (today > pickedUpDate) {
          try {
            console.log("Downgrade Triggered");
            await updateDoc(orderRef, {
              serviceType: "ordinary",
            //   add totalPrice adjustment here later
              updatedAt: Date.now(),
            });
            
           
            onUpdate?.(); 
          } catch (err) {
            console.error("Auto-downgrade failed:", err);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [orderId, onUpdate]);
}