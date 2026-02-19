import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get("accessToken")?.value;

    const { pathname } = request.nextUrl;

    // Public routes
    const publicRoutes = ["/login", "/register"];

    const isPublicRoute = publicRoutes.includes(pathname);

    // 🔐 If NOT logged in & trying to access protected route
    if (!accessToken && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 🔐 If logged in & trying to access login/register
    if (accessToken && isPublicRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
          Apply middleware to all routes except:
          - API routes
          - static files
          - images
          - favicon
        */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
