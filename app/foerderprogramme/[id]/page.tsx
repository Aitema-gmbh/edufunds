import { notFound } from "next/navigation";
import type { Foerderprogramm } from '@/lib/foerderSchema';
import foerderprogrammeData from '@/data/foerderprogramme.json';
import FoerderprogrammDetailClient from "./FoerderprogrammDetailClient";

const foerderprogramme = foerderprogrammeData as Foerderprogramm[];

// Statische Generierung für alle Förderprogramme
export function generateStaticParams() {
  return foerderprogramme.map((programm) => ({
    id: programm.id,
  }));
}

// Metadaten für SEO
export function generateMetadata({ params }: { params: { id: string } }) {
  const programm = foerderprogramme.find(p => p.id === params.id);
  
  if (!programm) {
    return {
      title: 'Programm nicht gefunden | EduFunds',
    };
  }

  return {
    title: `${programm.name} | EduFunds`,
    description: programm.kurzbeschreibung,
  };
}

export default function FoerderprogrammDetailPage({ params }: { params: { id: string } }) {
  const programm = foerderprogramme.find(p => p.id === params.id);

  if (!programm) {
    notFound();
  }

  return <FoerderprogrammDetailClient programm={programm} />;
}
