'use server'

import { adminAuth, adminDb } from '@/lib/firebase/admin-config'; 
import { FieldValue } from 'firebase-admin/firestore';
import { auth } from './config';
import { cookies } from 'next/headers';

export async function createAdminAccount(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  try {
    // check current user role and accordingly allow or deny access to this function
    const session = (await cookies()).get("session")?.value;
    if(!session){
      throw new Error("Unauthorized: no session");
    }
    const decodedToken = await adminAuth.verifySessionCookie(session, true);

    if(decodedToken.role !== "superadmin"){
      throw new Error("Unauthorized: insufficient permissions");
    }
    // Create the user in Firebase Auth using Admin SDK
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`,
    });

    const uid = userRecord.uid;

    // Set Custom Claims
    await adminAuth.setCustomUserClaims(uid, { role: data.role });

    // Sync to Firestore (using Admin SDK adminDb)
    const adminData = {
      uid,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: FieldValue.serverTimestamp(),
      isActive: true,
      isDeleted: false,
    };

    await adminDb.collection('admins').doc(uid).set(adminData);

    return { success: true, uid };
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return { success: false, error: error.message };
  } 
}

// temporary to sync custom claim role with current admins

export async function syncAdminRole(email:string){
    try{
        const user = await adminAuth.getUserByEmail(email);

        //set custom claim
        await adminAuth.setCustomUserClaims(user.uid,{
            role:"superadmin"
        });

        return {success:true , message:"Successfully admin added!"}
    }catch(err){
        console.error("Failed to add as admin: ", err); 
        return {success:false, error:"Failed to add as an admin."};
    }
}