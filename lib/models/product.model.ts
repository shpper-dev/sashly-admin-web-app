export interface Category{
    id : string;
    name : string;
    arabicName: string;
    searchTerms: string[];
    photoUrl?: string | null;
    createdAt: number;

}

export interface Service{
    id: string;
    name: string;
    arabicName: string;
    searchTerms: string[];
    description?: string | null;
    arabicDescription?: string | null;
    price: number;
    createdAt: number;

}

export interface Item{
    id: string;
    name: string;
    arabicName: string;
    searchTerms: string[];
    description?: string | null;
    arabicDescription?: string | null;
    categoryId: string;
    photoUrl?: string | null;
    services: Service[];
    createdAt: number;

}