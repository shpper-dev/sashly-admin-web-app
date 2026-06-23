import { Business } from "../models/business.model";

export function serializeBusiness(business: Partial<Business>) {
  return {
    name: business.name,
    
    joinCode: business.joinCode ?? "" ,
    isActive: business.isActive ?? true,
    
    contactName: business.contactName ?? "",
    contactPhone: business.contactPhone ?? "",

    createdAt: business.createdAt,
    
  };
}