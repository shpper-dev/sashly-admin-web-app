import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Category, Service, Item } from "../models/product.model";

export function mapService(doc: QueryDocumentSnapshot<DocumentData>) : Service {
    const data = doc.data();

    if(!data){
        throw new Error(`Service document ${doc.id} is empty.`);
    }

    return{
    id: doc.id,
    name: data.name ?? "",
    arabicName: data.arabicName ?? "",
    searchTerms: data.searchTerms ?? [],
    description: data.description ?? null,
    arabicDescription: data.arabicDescription ?? null,
    price: data.price ?? 0,
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? 0,

    }
}

export function mapCategory(doc: QueryDocumentSnapshot<DocumentData>) : Category {
    const data = doc.data();

    if(!data){
        throw new Error(`Category document ${doc.id} is empty.`);
    }

    return{
    id: doc.id,
    name: data.name ?? "",
    arabicName: data.arabicName ?? "",
    searchTerms: data.searchTerms ?? [],
    photoUrl: data.photoUrl ?? null,
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? 0,

    }
}

export function mapItem(doc: QueryDocumentSnapshot<DocumentData>) : Item {
    const data = doc.data();

    if(!data){
        throw new Error(`Item document ${doc.id} is empty.`);
    }

    return{
    id: doc.id,
    name: data.name ?? "",
    arabicName: data.arabicName ?? "",
    searchTerms: data.searchTerms ?? [],
    description: data.description ?? null,
    arabicDescription: data.arabicDescription ?? null,
    categoryId: data.categoryId ?? "",
    photoUrl: data.photoUrl ?? null,
    services: Array.isArray(data.services)
      ? data.services.map((s: any, i: number) => ({
          id: s.id ?? `temp-${i}`,
          name: s.name ?? "",
          arabicName: s.arabicName ?? "",
          searchTerms: Array.isArray(s.searchTerms) ? s.searchTerms : [],
          description: s.description ?? null,
          arabicDescription: s.arabicDescription ?? null,
          price: s.price ?? 0,
          createdAt:
            s.createdAt?.toMillis?.() ??
            s.createdAt ??
            0,
        }))
      : [],
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? 0,

    }
}