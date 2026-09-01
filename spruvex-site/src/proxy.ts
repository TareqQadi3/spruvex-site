import { NextResponse, type NextRequest } from "next/server";
import { CSRF_COOKIE, generateCsrfToken } from "@/lib/csrfEdge";
import { isAdminRequestAuthenticated } from "@/lib/session";

const PROTECTED_ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // حماية مسارات لوحة الإدارة: أي شيء تحت /admin غير /admin/login يتطلب جلسة صالحة.
  if (pathname.startsWith(PROTECTED_ADMIN_PREFIX) && pathname !== ADMIN_LOGIN_PATH) {
    const authed = await isAdminRequestAuthenticated(req);
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();

  // رؤوس أمان أساسية
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // إصدار كوكي CSRF (httpOnly) عند أول زيارة — تقرأه الصفحات لحقن حقل مخفي بالنماذج.
  if (!req.cookies.get(CSRF_COOKIE)) {
    res.cookies.set(CSRF_COOKIE, generateCsrfToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * طبّق الـ middleware على كل شيء عدا الملفات الثابتة و_next/static
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|screens/|brand/).*)",
  ],
};
