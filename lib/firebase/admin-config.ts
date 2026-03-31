import "server-only";
import { cert, getApps , initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if(!getApps().length){
    initializeApp({
        credential: cert({
            projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
}

export const adminAuth = getAuth();
export const adminStorage = getStorage().bucket();
export const adminDb = getFirestore();