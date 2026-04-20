import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

// create route
export async function createRoute(data: any) {
    const routeRef = doc(db, "routes", data.properties.areaName);
    await setDoc(routeRef, data);
    
}

export async function updateRouteCoordinates(routeId: string, updates: any) {
    const routeRef = doc(db, "routes", routeId);
      await updateDoc(routeRef, updates);
    
}