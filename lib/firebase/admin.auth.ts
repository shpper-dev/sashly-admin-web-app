
import { createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updatePassword, UserCredential } from "firebase/auth";
import { Admin, AdminRole } from "../models/admin.model";
import { auth, db } from "./config";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { deleteSession } from "../session";
import { redirect } from "next/navigation";


// admin login
export async function loginAdmin(email: string, password: string, remember: boolean ) : Promise<Admin>{
    const credential : UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // get firestore doc
    const adminDoc = await getDoc(doc(db,'admins',uid));

    if(!adminDoc.exists()){
        await signOut(auth);
        throw new Error("NOT_ADMIN");
    }

    const data = adminDoc.data();

    if(!data.isActive){
        await signOut(auth);
        throw new Error("ACCOUNT_DISABLED");
    }
    
    // since only used for admin panel..adding the session creation here
    const idToken = await credential.user.getIdToken();
    const res = await fetch(`/api/auth/login`,{
        method: "POST",
        headers :{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({idToken, remember}),
    });
   

    if(!res.ok){
        await signOut(auth);
        throw new Error("SESSION_FAILED");
    }

    return {
        uid,
        email: data.email,
        firstName : data.firstName,
        lastName : data.lastName,
        role: data.role,
        createdAt: data.createdAt?.toDate(),
        isActive: data.isActive,
        isDeleted: data.isDeleted,
    }

}

// createAdmin
export async function createAdmin(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: AdminRole = 'admin'
): Promise<Admin> {
    const credential = await createUserWithEmailAndPassword(auth, email,password);
    const uid = credential.user.uid;

    const adminData = {
        uid,
        email,
        firstName,
        lastName,
        role,
        createdAt : serverTimestamp(),
        isActive : true,
        isDeleted : false,
    }

    await setDoc(doc(db,'admins',uid), adminData);

    return {...adminData, createdAt: new Date()}
    
}

// change password


// logout
export async function logoutAdmin(): Promise<void> {
    await signOut(auth);
    await deleteSession();
    redirect("/login");
}
export async function changePassword(currentPassword: string, newPassword: string): Promise<void>{
    const user = auth.currentUser;
    if(!user) throw new Error("User not authenticated");

    try{
        // re authenticate user
        const credential = EmailAuthProvider.credential(user.email || "", currentPassword.trim());
        await reauthenticateWithCredential(user,credential);

        // update password
        await updatePassword(user, newPassword.trim());
  
    }catch(err){
        console.error("Password change failed: ", err);
        throw new Error("Password change failed!")
    }
}
// getAdminProfile
export async function getCurrentUser():Promise<Admin | null> {
    const user = auth.currentUser;
    if(!user) return null;
    const uid = user.uid;
    const snap = await getDoc(doc(db,'admins',uid));
    if(!snap.exists()) return null;
     return {id: snap.id, ...snap.data() } as unknown as Admin
    
}
export async function getAdmins(): Promise<Admin[]> {
    const q = query(collection(db, "admins"));
    const snap = await getDocs(q);
    const admins = snap.docs.map((d) => d.data() as Admin)
    return admins
}

export async function getAdminById(adminId: string) {
    const adminSnap = await getDoc(doc(db,"admins",adminId));
    const adminData = adminSnap.data() as Admin;

    return adminData
    
}


