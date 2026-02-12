import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mapping von alten/falschen URLs zu korrekten IDs
const REDIRECT_MAP: Record<string, string> = {
  'digitalpakt-2': 'bmbf-digitalpakt-2',
  'startchancen': 'bmbf-startchancen',
  // Weitere Mappings hier hinzufügen
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Prüfe ob es eine Förderprogramm-Detailseite ist
  const match = pathname.match(/^\/foerderprogramme\/(.+)$/);
  if (match) {
    const programmId = match[1];
    const correctId = REDIRECT_MAP[programmId];
    
    if (correctId) {
      // Redirect zur korrekten URL
      const newUrl = new URL(`/foerderprogramme/${correctId}`, request.url);
      return NextResponse.redirect(newUrl, 301);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/foerderprogramme/:path*',
};
