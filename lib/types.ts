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