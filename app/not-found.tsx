import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, ArrowLeft, Home, HelpCircle } from "lucide-react";
import Link from "next/link";
import foerderprogrammeData from "@/data/foerderprogramme.json";

export const metadata = {
  title: "Seite nicht gefunden",
  description: "Die gesuchte Seite existiert nicht. Entdecken Sie Förderprogramme für Schulen.",
};

export default function NotFound() {
  // Zufällige Programme für Vorschläge
  const randomPrograms = foerderprogrammeData
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* 404 */}
            <div className="text-9xl font-bold text-slate-800 mb-4">
              404
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-100 mb-4">
              Seite nicht gefunden
            </h1>

            {/* Description */}
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Die von Ihnen gesuchte Seite existiert leider nicht oder wurde verschoben.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                Zur Startseite
              </Link>
              
              <Link
                href="/foerderprogramme"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:border-slate-500 hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
                Programme durchsuchen
              </Link>
              
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:border-slate-500 hover:text-white transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                Hilfe
              </Link>
            </div>

            {/* Alternative Programme */}
            <div className="text-left">
              <h2 className="text-xl font-semibold text-slate-200 mb-6 text-center">
                Vielleicht interessiert Sie das:
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {randomPrograms.map((programm) => (
                  <Link
                    key={programm.id}
                    href={`/foerderprogramme/${programm.id}`}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/30 transition-all group"
                  >
                    <span className="text-xs font-medium text-orange-400 mb-2 block">
                      {programm.foerdergeberTyp.toUpperCase()}
                    </span>
                    <h3 className="font-medium text-slate-200 group-hover:text-orange-400 transition-colors line-clamp-2">
                      {programm.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
