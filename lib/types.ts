export type TableHeading = {
        id: string,
        title: string | null;
}

export interface OrderData {
  id: number;
  ready_by: {date: string, time:string};
  placed: string;
  placed_badge?: string;
  customer: string;
  order_details: {item_en:string,item_ar:string,qty:number,}[];
  pcs: number;
  total: number;
}

// delivery-manifest page
export type Order = {
  id: string;
  client: string;
  phone: string;
  address: string;
  summary: {item_en:string,item_ar:string,qty:number}[];
  amount: number;
  notes?: string;
  type: "PICKUP" | "DELIVERY";
  unpaid?: boolean;
};

export type Route = {
  id: string;
  driver: string;
  pickups: number;
  deliveries: number;
  orders: Order[];
};

// order reports
export interface ReportItem {
  name: string
  qty: number
}

export interface ReportGroup {
  date: string
  items: ReportItem[]
}