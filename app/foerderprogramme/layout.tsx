import type { Metadata } from "next";
import foerderprogrammeData from "@/data/foerderprogramme.json";

export const metadata: Metadata = {
  title: "Förderprogramme für Grundschulen",
  description: `Entdecken Sie ${foerderprogrammeData.length} Förderprogramme für Grundschulen. Bundesmittel, Landesmittel, Stiftungen und EU-Programme - mit KI-Antragsassistent.`,
  openGraph: {
    title: "Förderprogramme für Grundschulen | EduFunds",
    description: `Über ${foerderprogrammeData.length} Förderprogramme im Überblick. Finden Sie passende Fördermittel für Ihre Schule.`,
    type: "website",
  },
};

export default function FoerderprogrammeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
