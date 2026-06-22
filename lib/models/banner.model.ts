import { Timestamp } from "firebase/firestore";

type BannerActionType = "none" | "url" | "offers";

export interface Banner {
  id: string;
  imageUrl: string;           
  isActive: boolean;           
  sortOrder: number;           
  actionType: BannerActionType;
  actionValue?: string | null; // the URL when actionType === "url"
  title?: string | null;
  startDate?: Timestamp | null;
  endDate?: Timestamp | null;
  createdAt: Timestamp;
}