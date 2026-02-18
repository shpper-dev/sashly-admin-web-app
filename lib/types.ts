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
  order_details: string[];
  pcs: number;
  total: number;
}