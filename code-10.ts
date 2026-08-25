import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard": ["admin", "branch_manager", "cashier", "accountant"],
  "/dashboard/products": ["admin", "branch_manager"],
  "/dashboard/pos": ["admin", "branch_manager", "cashier"],
  "/dashboard/accounting": ["admin", "accountant"],
  "/dashboard/settings": ["admin"],
  "/dashboard/partners": ["admin", "branch_manager"],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sims_token")?.value;
  const path = req.nextUrl.pathname;

  if (!token && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
      for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
        if (path.startsWith(route) && !roles.includes(payload.role)) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
