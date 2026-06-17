import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Driver } from "../models/driver.model";


export function mapDriver(doc: QueryDocumentSnapshot<DocumentData>): Driver {
    const data = doc.data();
    if(!data) {
        throw new Error(`Driver document ${doc.id} is empty.`);
    }

    return{
       id: doc.id,
       phoneNumber: data.phoneNumber ?? "",            
       name: data.name ?? "",
       email: data.email ?? "",
       profileImageUrl: data.profileImageUrl ?? "",
       
       designatedArea: data.designatedArea ?? null,
   
       fcmToken: data.fcmToken ?? "",
       isActive: data.isActive ?? true,              
       isOnline: data.isOnline ?? true, 
       
       enableDriverOfferResponse: data.enableDriverOfferResponse ?? false,
   
       createdAt: data.createdAt ?? 0,
       updatedAt: data.updatedAt ??  null,
    }
}