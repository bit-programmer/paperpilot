import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { NON_PROTECTED_ROUTES, PROTECTED_ROUTES } from "./app/utils/routes";
import { clientPaths } from "./app/utils/path.client";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    const pathname = request.nextUrl.pathname;
    if(PROTECTED_ROUTES.includes(pathname) && !session) {
        return NextResponse.redirect(new URL(clientPaths.signin.path, request.url));
    }
    if(NON_PROTECTED_ROUTES.includes(pathname) && session) {
        return NextResponse.redirect(new URL(clientPaths.dashboard.path, request.url));
    }
    return NextResponse.next();
}

export const config = {
  matcher: ["/ui/:path"],
};