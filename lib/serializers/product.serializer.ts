import { Category, Item, Service } from "../models/product.model";

export function serializeService(service: Partial<Service>) {
   
    return{
    name: service.name ?? "",
    arabicName: service.arabicName ?? "",
    searchTerms: service.searchTerms ?? [],
    description: service.description ?? null,
    arabicDescription: service.arabicDescription ?? null,
    price: service.price ?? 0,
    createdAt: service.createdAt ?? Date.now(),

    }
}

export function serializeCategory(category: Partial<Category>) {
   
    return{
    name: category.name ?? "",
    arabicName: category.arabicName ?? "",
    searchTerms: category.searchTerms ?? [],
    photoUrl: category.photoUrl ?? null,
    createdAt: category.createdAt ?? Date.now(),
    }
}

export function serializeItem(item: Partial<Item>) {
    return{
    name: item.name ?? "",
    arabicName: item.arabicName ?? "",
    searchTerms: item.searchTerms ?? [],
    description: item.description ?? null,
    arabicDescription: item.arabicDescription ?? null,
    categoryId: item.categoryId ?? "",
    photoUrl: item.photoUrl ?? null,
    services: item.services?.map((s) => ({
              id: s.id ?? "",
              name: s.name ?? "",
              arabicName: s.arabicName ?? "",
              searchTerms: s.searchTerms ?? [],
              description: s.description ?? null,
              arabicDescription: s.arabicDescription ?? null,
              price: s.price ?? 0,
              createdAt: s.createdAt ?? Date.now(),
            })) ?? [],
    createdAt: item.createdAt ?? Date.now(),

    }
}