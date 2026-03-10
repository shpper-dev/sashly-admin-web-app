import { adminAuth } from "@/lib/firebase/admin-config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const runtime = "nodejs";


const SESSION_EXPIRES_IN = 5 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
    const {idToken} = await req.json();
    try{
        if(!idToken) {
            return NextResponse.json({error:"Missing id token"},{status: 401});
        }
        
        // verify id token
        const decoded = await adminAuth.verifyIdToken(idToken);

        // create session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken,{
            expiresIn: SESSION_EXPIRES_IN,
        });

        (await cookies()).set("session",sessionCookie,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: SESSION_EXPIRES_IN/1000,
            path:"/",
        });

        return NextResponse.json({uid: decoded.uid});


    }catch(err){
        console.error("Session creation failed: ", err);
        return NextResponse.json({error:"Unauthorized"}, {status: 401})
    }
    
}