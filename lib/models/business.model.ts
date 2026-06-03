
export interface Business {
  id:                 string;
  name:               string;
  arabicName:         string;
  ownerName:          string;
  email:              string;
  phone:              string;
  pricing:            ItemPricing[]; 
  address?:           string | null;
  logoUrl?:           string | null;
  rating?:            number | null;
  totalOrders?:       number | null;
  isDeleted:          boolean;
  createdAt:          number;
  updatedAt:          number;
    
}

export interface ItemServicePrice {
  serviceId:   string;
  serviceName: string;
  price:       number;
  enabled:     boolean;
}

export interface ItemPricing {
  itemId:      string;
  itemName:    string;
  arabicName:  string;
  enabled:     boolean;
  services:    ItemServicePrice[];
}

