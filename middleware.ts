// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'pt'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals
  if (pathname.startsWith('/_next')) return NextResponse.next();

  // If cookie is already set, respect it
  const langCookie = request.cookies.get('app_lang')?.value;
  if (langCookie && SUPPORTED_LOCALES.includes(langCookie)) {
    return NextResponse.next();
  }

  // Else, auto-detect language from Accept-Language
  const acceptLang = request.headers.get('accept-language');
  let detectedLang: string = 'en';
  if (acceptLang) {
    const first = acceptLang.split(',')[0].trim().slice(0, 2);
    if (SUPPORTED_LOCALES.includes(first)) detectedLang = first;
  }

  // Set cookie for this and future requests
  const response = NextResponse.next();
  response.cookies.set('app_lang', detectedLang, { path: '/', httpOnly: false });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
