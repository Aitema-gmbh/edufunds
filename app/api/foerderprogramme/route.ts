import { NextResponse } from 'next/server';
import foerderprogramme from '@/data/foerderprogramme.json';

// Cache für 1 Stunde mit stale-while-revalidate
export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Filter-Parameter
  const schulform = searchParams.get('schulform');
  const bundesland = searchParams.get('bundesland');
  const kategorie = searchParams.get('kategorie');
  const foerdergeberTyp = searchParams.get('foerdergeberTyp');
  const status = searchParams.get('status'); // Kein Default mehr - alle anzeigen
  
  let filtered = [...foerderprogramme];
  
  // Filter anwenden
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  
  if (schulform) {
    filtered = filtered.filter(p => 
      p.schulformen.includes(schulform as any) || p.schulformen.includes('alle')
    );
  }
  
  if (bundesland) {
    filtered = filtered.filter(p => 
      p.bundeslaender.includes(bundesland) || 
      p.bundeslaender.includes('alle')
    );
  }
  
  if (kategorie) {
    filtered = filtered.filter(p => 
      p.kategorien.some(k => k.toLowerCase().includes(kategorie.toLowerCase()))
    );
  }
  
  if (foerdergeberTyp) {
    filtered = filtered.filter(p => p.foerdergeberTyp === foerdergeberTyp);
  }
  
  // Direktes Array zurückgeben für einfacheres Handling im Frontend
  // Mit Caching-Headern
  return new NextResponse(JSON.stringify(filtered), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Vercel-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
