import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./lib/firebase/admin-config";
// export const runtime = "nodejs";
const publicRoutes =["/login"];

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    // get session
    const session = req.cookies.get("session")?.value;

    // public route and session available
    if(isPublicRoute && session){
        try{
            await adminAuth.verifySessionCookie(session,true);
            return NextResponse.redirect(new URL("/", req.nextUrl));
        }catch{
            const response = NextResponse.next();
            response.cookies.delete("session");
            return response;
        }
    }

    // protected route and no session
    if(!isPublicRoute && !session){
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // protected route and session
    if(!isPublicRoute && session){
        try{
            await adminAuth.verifySessionCookie(session, true);
            return NextResponse.next()
        }catch{
            const response = NextResponse.redirect(new URL("/login", req.nextUrl));
            response.cookies.delete("session");
            return response;
        }
    }
    return NextResponse.next();
    
}

// matches everything except _next, api favicon.ico
export const config ={
    matcher:[
        "/((?!_next|api/auth|favicon.ico).*)",
    ]
        
}