// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'pt', 'fr', 'es'];
const LEGAL_PATHS = ['/PrivacyPolicy', '/TermsOfService', '/FAQ'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals
  if (pathname.startsWith('/_next')) return NextResponse.next();

  const preferEnglish = LEGAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Store reviewers / crawlers must see English policy with static contact details.
  if (preferEnglish) {
    const response = NextResponse.next();
    response.cookies.set('app_lang', 'en', { path: '/', httpOnly: false });
    return response;
  }

  // If cookie is already set, respect it
  const langCookie = request.cookies.get('app_lang')?.value;
  if (langCookie && SUPPORTED_LOCALES.includes(langCookie)) {
    return NextResponse.next();
  }

  // Else, auto-detect language from Accept-Language (default English)
  const acceptLang = request.headers.get('accept-language');
  let detectedLang = 'en';
  if (acceptLang) {
    const first = acceptLang.split(',')[0].trim().slice(0, 2);
    if (SUPPORTED_LOCALES.includes(first)) detectedLang = first;
  }

  const response = NextResponse.next();
  response.cookies.set('app_lang', detectedLang, { path: '/', httpOnly: false });
  return response;
}

export const config = {
  // Next.js 16 compiles middleware as proxy.ts. A catch-all matcher makes
  // valid App Router pages (AllProducts, HomeScreen, LoginScreenUser, …)
  // return 404 in `next dev`. Only run on legal pages that need English.
  matcher: [
    '/PrivacyPolicy',
    '/PrivacyPolicy/:path*',
    '/TermsOfService',
    '/TermsOfService/:path*',
    '/FAQ',
    '/FAQ/:path*',
  ],
};
