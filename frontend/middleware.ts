import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { TokenPayload } from "./types/tokenPayload";
import { ROLE } from "./types/shared.type";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const pathname = req.nextUrl.pathname;

  const DRIVER_VENDOR = ["/vendor/driver-menu"];

  const ADMIN_VENDOR = [
    "/vendor/dashboard",
    "/vendor/booking",
    "/vendor/history",
    "/vendor/member-management",
    "/vendor/reports",
    "/admin/all-warehouse",
  ];

  const USER_ORGANIZATION = [
    "/admin/dashboard",
    "/admin/gate",
    "/admin/booking",
    "/admin/busy-times",
    "/admin/queue",
    "/admin/reports",
    "/admin/vehicles",
    "/admin/my-warehouse",
    "/admin/settings",
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
        if (USER_ORGANIZATION.includes(pathname)) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
    } else {
      // ini orang luar (vendor)
      if (role == ROLE.DRIVER_VENDOR) {
        // admin vendor
        if (DRIVER_VENDOR.includes(pathname)) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/forbidden", req.url));
      } else {
        //ini supir vendor
        if (ADMIN_VENDOR.includes(pathname)) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/forbidden", req.url));
      }
      // Jika user bukan di halaman vendor, redirect ke vendor dashboard
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
    "/((?!_next/static|_next/image|favicon.ico|csi-logo.png|login|forgot-password|forbidden|unauthorized|docs).*)",
  ],
};
