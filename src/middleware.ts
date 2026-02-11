import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth/config";

const PROTECTED_ADMIN_ROUTES = ["/admin"];
const PROTECTED_VENDOR_ROUTES = ["/vendor/dashboard", "/vendor/products", "/vendor/orders", "/vendor/payouts"];
const PROTECTED_ACCOUNT_ROUTES = ["/account"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isVendorRoute = PROTECTED_VENDOR_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAccountRoute = PROTECTED_ACCOUNT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAdminRoute && !isVendorRoute && !isAccountRoute) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Not authenticated → redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (session.user as { role?: string }).role;

  // Admin routes: require admin role
  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Vendor routes: require vendor or admin role
  if (isVendorRoute && userRole !== "vendor" && userRole !== "admin") {
    return NextResponse.redirect(new URL("/vendor/register", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/dashboard/:path*", "/vendor/products/:path*", "/vendor/orders/:path*", "/vendor/payouts/:path*", "/account/:path*"],
};
