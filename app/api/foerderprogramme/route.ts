import { NextResponse } from 'next/server';
import foerderprogramme from '@/data/foerderprogramme.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Filter-Parameter
  const schulform = searchParams.get('schulform');
  const bundesland = searchParams.get('bundesland');
  const kategorie = searchParams.get('kategorie');
  const foerdergeberTyp = searchParams.get('foerdergeberTyp');
  const status = searchParams.get('status') || 'aktiv';
  
  let filtered = foerderprogramme;
  
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
  
  return NextResponse.json({
    count: filtered.length,
    programs: filtered,
    meta: {
      total: foerderprogramme.length,
      filters: { schulform, bundesland, kategorie, foerdergeberTyp, status }
    }
  });
}
