import { Banner } from "../models/banner.model";

export function serializeBanner(banner: Partial<Banner>){
    return{
    imageUrl: banner.imageUrl ?? "",
    isActive: banner.isActive ?? false,
    sortOrder: banner.sortOrder ?? 0,

    actionType: banner.actionType ?? "none",
    actionValue: banner.actionValue ?? "",

    title: banner.title ?? "",
    
    startDate: banner.startDate ?? null,
    endDate: banner.endDate ?? null,
    createdAt: banner.createdAt ?? 0,
}
}