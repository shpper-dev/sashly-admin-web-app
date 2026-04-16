import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db} from "@/lib/firebase/config";
import { Category, Item, Service } from "../models/product.model";
import { uploadImage } from "../utils";
import { mapCategory, mapItem, mapService } from "../mappers/product.mappper";

// category

export async function createCategory(data: {
  name: string;
  arabicName: string;
  searchTerms: string[];
  photo?: File | null;
}): Promise<void> {
  let photoUrl: string | null = null;

  // Upload image if provided
  if (data.photo) {
    photoUrl = await uploadImage(data.photo,"categories");
  }

  // Create Firestore document
  const docRef = await addDoc(collection(db, "Categories"), {
    name: data.name,
    arabicName: data.arabicName,
    searchTerms: data.searchTerms,
    photoUrl,
    createdAt: Date.now(),
  });

  // Save generated id
  await updateDoc(docRef, {
    id: docRef.id,
  });
}

export const updateCategory = async (
  id: string,
  data: {
    name: string;
    arabicName: string;
    searchTerms: string[];
    photo?: File | null;
    existingPhotoUrl?: string | null;
    photoRemoved?: boolean;
  }
) => {

  let photoUrl: string | null = data.existingPhotoUrl ?? null;

  // Upload new photo if provided
  if (data.photo) {
    photoUrl = await uploadImage(data.photo, "categories");
  }

  // Remove photo
  if (data.photoRemoved) {
    photoUrl = null;
  }

  await updateDoc(doc(db, "Categories", id), {
    name: data.name,
    arabicName: data.arabicName,
    searchTerms: data.searchTerms,
    photoUrl,
  });
};

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, "Categories", id));
  
}

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(collection(db, "Categories"));
  const rows = snap.docs.map(mapCategory);
  return rows;
  
}

// service

export async function createService(data:{
  name: string;
  arabicName: string;
  searchTerms: string[];
  description?: string;
  arabicDescription?: string;
  price: number;
}): Promise<void> {
  const docRef = await addDoc(collection(db,"Services"),{
    ...data,
    description: data.description ?? null,
    arabicDescription: data.arabicDescription ?? null,
    createdAt: Date.now()
  });

  await updateDoc(docRef, {id: docRef.id})
  
}

export const updateService = async (
  id: string,
  data: {
    name: string;
    arabicName: string;
    description?: string | null;
    arabicDescription?: string | null;
    price: number;
    searchTerms: string[];
  }
) => {

  await updateDoc(doc(db, "Services", id), {
    name: data.name,
    arabicName: data.arabicName,
    description: data.description ?? null,
    arabicDescription: data.arabicDescription ?? null,
    price: data.price,
    searchTerms: data.searchTerms,
  });

};

export async function deleteService(id: string) {
  await deleteDoc(doc(db, "Services", id));
}

export async function getServices(): Promise<Service[]> {
  const snap = await getDocs(collection(db, "Services"));
  return snap.docs.map(mapService);
};

// items
export async function createItem(data:{
  name: string;
  arabicName: string;
  searchTerms: string[];
  description?: string;
  arabicDescription?: string;
  categoryId: string;
  photo?: File | null;
  selectedServices : Service[];
}) {
   let photoUrl: string | null = null
        if (data.photo) {
          photoUrl = await uploadImage(data.photo,"items")
        }
        
        const docRef = await addDoc(collection(db, "Items"), {
          name: data.name,
          arabicName: data.arabicName,
          searchTerms: data.searchTerms,
          description: data.description ?? null,
          arabicDescription: data.arabicDescription ?? null,
          categoryId: data.categoryId,
          photoUrl: photoUrl,
          services: data.selectedServices,
          createdAt: Date.now(),
        })
  
        await updateDoc(docRef, { id: docRef.id })
  
}

export async function updateItem(id: string, data: {
  name: string;
  arabicName: string;
  searchTerms: string[];
  description?: string;
  arabicDescription?: string;
  categoryId: string;
  photo?: File | null;
  existingPhotoUrl?: string | null;
  photoRemoved?: boolean;
  selectedServices: Service[];
}) {
  let photoUrl: string | null = data.existingPhotoUrl ?? null

  if (data.photo) {
    photoUrl = await uploadImage(data.photo, "items")
  }

  if (data.photoRemoved) photoUrl = null

  await updateDoc(doc(db, "Items", id), {
    name: data.name,
    arabicName: data.arabicName,
    searchTerms: data.searchTerms,
    description: data.description ?? null,
    arabicDescription: data.arabicDescription ?? null,
    categoryId: data.categoryId,
    photoUrl,
    services: data.selectedServices,
  })
}

export async function deleteItem(id: string) {
  await deleteDoc(doc(db, 'Items', id));
}

export async function getItems() : Promise<Item[]>{
  const snap = await getDocs(collection(db, "Items"));
  return snap.docs.map(mapItem);
};
