import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Banner } from "../models/banner.model";

export function mapBanner(doc: QueryDocumentSnapshot<DocumentData>): Banner{
    const data = doc.data();

    if(!data){
        throw new Error(`Banner document ${doc.id} is empty.`);
    }

    return{
    id: doc.id,
    imageUrl: data.imageUrl ?? "",
    isActive: data.isActive ?? false,
    sortOrder: data.sortOrder ?? 0,
    actionType: data.actionType ?? "none",
    actionValue: data.actionValue ?? "",
    title: data.title ?? "",
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    createdAt: data.createdAt ?? 0,
}

}