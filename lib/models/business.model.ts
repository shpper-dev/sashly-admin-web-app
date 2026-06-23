
export interface Business {
  id:                 string;
  name:               string;
  joinCode:           string; //unique
  isActive:           boolean; //default true
  contactName:        string;
  contactPhone:       string;
  createdAt:          number;
    
}

export interface CatalogItem {
  name: string;
  price: number;

  category?: string | null;
  serviceType?: string | null;

  unit?: string | null;
  imageUrl?: string | null;

  isActive: boolean; //default true
  sortOrder?: number | null;

}

