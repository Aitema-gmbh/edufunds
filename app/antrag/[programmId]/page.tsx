"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, FileText, Shield, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { KIAntragAssistent } from "@/components/KIAntragAssistent";
import foerderprogramme from "@/data/foerderprogramme.json";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AntragPage() {
  const params = useParams();
  const programmId = params.programmId as string;
  
  const programm = foerderprogramme.find(p => p.id === programmId);

  if (!programm) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-100 mb-4">
                Programm nicht gefunden
              </h1>
              <p className="text-slate-400 mb-6">
                Das angeforderte Förderprogramm konnte nicht gefunden werden.
              </p>
              <Link 
                href="/foerderprogramme" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück zur Übersicht
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Prüfen ob das Programm für KI-Antrag geeignet ist
  const isKiGeeignet = programm.kiAntragGeeignet !== false;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Link */}
          <Link 
            href={`/foerderprogramme/${programmId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Programm
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
              Antrag erstellen
            </h1>
            <p className="text-slate-400 mb-4">
              Für: <span className="text-orange-400 font-medium">{programm.name}</span>
            </p>
            
            {/* Programm-Info-Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                {programm.foerdergeber}
              </Badge>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                {programm.foerdersummeText}
              </Badge>
              {programm.kategorien.slice(0, 3).map((kat) => (
                <Badge key={kat} variant="outline" className="border-slate-700 text-slate-400">
                  {kat.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          </div>

          {/* KI-Assistent oder Hinweis */}
          {isKiGeeignet ? (
            <KIAntragAssistent programm={programm} />
          ) : (
            <Card className="border-yellow-500/30">
              <CardContent className="pt-8 pb-8">
                <div className="text-center max-w-lg mx-auto">
                  <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-100 mb-2">
                    KI-Assistent nicht verfügbar
                  </h2>
                  <p className="text-slate-400 mb-6">
                    Für dieses Programm steht der KI-Antragsassistent derzeit nicht zur Verfügung. 
                    Bitte nutzen Sie das offizielle Antragsformular des Fördergebers.
                  </p>
                  <Link
                    href={programm.antragUrl || programm.website || "#"}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    Zum offiziellen Antragsformular
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info-Box */}
          <Card className="mt-8 border-slate-700/50 bg-slate-800/30">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">
                    Datenschutz & Verantwortung
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Der KI-Antragsassistent unterstützt Sie bei der Erstellung eines professionellen 
                    Antragstextes. Beachten Sie bitte:
                  </p>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      Überprüfen Sie alle generierten Inhalte vor der Einreichung
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      Passen Sie den Text an Ihre spezifische Situation an
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      Beachten Sie die aktuellen Antragsrichtlinien des Fördergebers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      Bei erfolgreicher Förderung: Melden Sie sich gerne bei uns!
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
