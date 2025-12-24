import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { ROLE, TokenPayload } from "./types/tokenPayload";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const pathname = req.nextUrl.pathname;

  const DRIVER_VENDOR = ["vendor/dashboard"];
  const ADMIN_VENDOR = [
    "vendor/dashboard",
    "vendor/booking",
    "vendor/history",
    "vendor/member-management",
    "vendor/reports",
  ];

  const USER_ORGANIZATION = [
    "/admin/dashboard",
    "/admin/booking",
    "/admin/history",
    "/admin/member-management",
    "/admin/reports",
  ];
  // ADMIN_ORGANIZATION = wildcard

  // Jika di halaman login, biarkan lewat (tidak perlu check token)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Jika tidak ada access_token
  if (!token) {
    // Jika ada refresh_token, biarkan lewat (biarkan axios handle refresh saat API call)
    // Axios interceptor akan otomatis refresh token jika diperlukan
    if (refreshToken) {
      return NextResponse.next();
    }
    // Jika tidak ada keduanya, redirect ke login
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // === Manual decode JWT ===
    // Decode token untuk check expiration dan role
    const payload = token.split(".")[1];
    const decoded: TokenPayload = JSON.parse(
      Buffer.from(payload, "base64").toString()
    );

    // Check token expiration (exp adalah timestamp dalam detik)
    const exp = decoded?.exp;
    if (exp && exp * 1000 < Date.now()) {
      // Token expired, tapi ada refresh_token - biarkan lewat
      // Axios interceptor akan handle refresh
      if (refreshToken) {
        return NextResponse.next();
      }
      // Token expired dan tidak ada refresh_token, redirect ke login
      return NextResponse.redirect(new URL("/", req.url));
    }

    const role: ROLE = decoded?.role;
    const am_i_vendor = decoded?.vendorName ? true : false;

    if (!role) {
      //ini belum login maka lempar ke landing page
      return NextResponse.redirect(new URL("/", req.url));
    } else if (
      //ini akun yang bukan bagian vendor tapi organisasi org dalam
      !am_i_vendor
    ) {
      if (role == ROLE.ADMIN_ORGANIZATION) {
        // admin organization (IT only)
        return NextResponse.next();
      } else {
        //user organization
        return NextResponse.redirect(new URL("/", req.url));
      }
    } else {
      // ini orang luar (vendor)
      // supir

      if (pathname.startsWith("/vendor")) {
        return NextResponse.next();
      }
      // Jika user bukan di halaman vendor, redirect ke vendor dashboard
      return NextResponse.redirect(new URL("/vendor/dashboard", req.url));
    }
  } catch (err) {
    // Token invalid/malformed
    // Jika ada refresh_token, biarkan lewat (biarkan axios handle refresh)
    if (refreshToken) {
      return NextResponse.next();
    }
    // Token invalid dan tidak ada refresh_token, redirect ke login
    return NextResponse.redirect(new URL("/", req.url));
  }
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|csi-logo.png|login|forgot-password|forbidden|unauthorized).*)",
  ],
};
