import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const pathname = req.nextUrl.pathname;

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
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());

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

    const description = decoded?.description;

    if (!description) {
      return NextResponse.redirect(new URL("/", req.url));
    } else if (
      description == "IT" ||
      description.toUpperCase().includes("ADMIN")
    ) {
      // Jika user sudah di halaman admin, biarkan lewat
      if (pathname.startsWith("/admin")) {
        return NextResponse.next();
      }
      // Jika user bukan di halaman admin, redirect ke admin dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else {
      // Jika user sudah di halaman vendor, biarkan lewat
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
