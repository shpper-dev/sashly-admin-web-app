import { cert, getApps , initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if(!getApps().length){
    initializeApp({
        credential: cert({
            projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    });
}

export const adminAuth = getAuth()