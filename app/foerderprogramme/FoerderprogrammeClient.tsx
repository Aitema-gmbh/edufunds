"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Search, Filter, Building2, Euro, Calendar, MapPin, ArrowRight, School, X } from "lucide-react";
import Link from "next/link";
import foerderprogramme from "@/data/foerderprogramme.json";
import { useState, useMemo } from "react";

// Schulformen-Optionen
const SCHULFORMEN = [
  { value: "", label: "Alle Schulformen" },
  { value: "grundschule", label: "Grundschule" },
  { value: "hauptschule", label: "Hauptschule" },
  { value: "realschule", label: "Realschule" },
  { value: "gymnasium", label: "Gymnasium" },
  { value: "gesamtschule", label: "Gesamtschule" },
  { value: "foerderschule", label: "Förderschule" },
  { value: "berufsschule", label: "Berufsschule" },
];

// Bundesländer-Optionen
const BUNDESLAENDER = [
  { value: "", label: "Alle Bundesländer" },
  { value: "DE-BW", label: "Baden-Württemberg" },
  { value: "DE-BY", label: "Bayern" },
  { value: "DE-BE", label: "Berlin" },
  { value: "DE-BB", label: "Brandenburg" },
  { value: "DE-HB", label: "Bremen" },
  { value: "DE-HH", label: "Hamburg" },
  { value: "DE-HE", label: "Hessen" },
  { value: "DE-MV", label: "Mecklenburg-Vorpommern" },
  { value: "DE-NI", label: "Niedersachsen" },
  { value: "DE-NW", label: "Nordrhein-Westfalen" },
  { value: "DE-RP", label: "Rheinland-Pfalz" },
  { value: "DE-SL", label: "Saarland" },
  { value: "DE-SN", label: "Sachsen" },
  { value: "DE-ST", label: "Sachsen-Anhalt" },
  { value: "DE-SH", label: "Schleswig-Holstein" },
  { value: "DE-TH", label: "Thüringen" },
];

// Fördergeber-Typen
const FOERDERGEBER_TYPEN = [
  { value: "", label: "Alle Typen" },
  { value: "bund", label: "Bund" },
  { value: "land", label: "Land" },
  { value: "stiftung", label: "Stiftung" },
  { value: "eu", label: "EU" },
];

// Kategorien aus den Daten sammeln
const ALLE_KATEGORIEN = Array.from(new Set(foerderprogramme.flatMap(p => p.kategorien))).sort();
const KATEGORIEN = [
  { value: "", label: "Alle Kategorien" },
  ...ALLE_KATEGORIEN.map(kat => ({ value: kat, label: kat.charAt(0).toUpperCase() + kat.slice(1).replace(/-/g, " ") }))
];

// Statistiken berechnen
const stats = {
  total: foerderprogramme.length,
  bund: foerderprogramme.filter(p => p.foerdergeberTyp === 'bund').length,
  land: foerderprogramme.filter(p => p.foerdergeberTyp === 'land').length,
  stiftung: foerderprogramme.filter(p => p.foerdergeberTyp === 'stiftung').length,
  eu: foerderprogramme.filter(p => p.foerdergeberTyp === 'eu').length,
};

export default function FoerderprogrammePage() {
  // Filter-States
  const [suchbegriff, setSuchbegriff] = useState("");
  const [schulform, setSchulform] = useState("");
  const [bundesland, setBundesland] = useState("");
  const [foerdergeberTyp, setFoerdergeberTyp] = useState("");
  const [kategorie, setKategorie] = useState("");

  // Gefilterte Programme berechnen
  const gefilterteProgramme = useMemo(() => {
    return foerderprogramme.filter((programm) => {
      // Suchbegriff-Filter (Name + Beschreibung)
      if (suchbegriff) {
        const suche = suchbegriff.toLowerCase();
        const nameMatch = programm.name.toLowerCase().includes(suche);
        const beschreibungMatch = programm.kurzbeschreibung.toLowerCase().includes(suche);
        const foerdergeberMatch = programm.foerdergeber.toLowerCase().includes(suche);
        if (!nameMatch && !beschreibungMatch && !foerdergeberMatch) {
          return false;
        }
      }

      // Schulform-Filter
      if (schulform && !programm.schulformen.includes(schulform)) {
        return false;
      }

      // Bundesland-Filter
      if (bundesland) {
        const bundeslaenderArray = programm.bundeslaender;
        if (!bundeslaenderArray.includes("alle") && !bundeslaenderArray.includes(bundesland)) {
          return false;
        }
      }

      // Fördergeber-Typ-Filter
      if (foerdergeberTyp && programm.foerdergeberTyp !== foerdergeberTyp) {
        return false;
      }

      // Kategorie-Filter
      if (kategorie && !programm.kategorien.includes(kategorie)) {
        return false;
      }

      return true;
    });
  }, [suchbegriff, schulform, bundesland, foerdergeberTyp, kategorie]);

  // Reset-Funktion
  const resetFilter = () => {
    setSuchbegriff("");
    setSchulform("");
    setBundesland("");
    setFoerdergeberTyp("");
    setKategorie("");
  };

  // Prüfen ob Filter aktiv sind
  const hatAktiveFilter = suchbegriff || schulform || bundesland || foerdergeberTyp || kategorie;

  // Anzahl aktiver Filter
  const aktiveFilterCount = [suchbegriff, schulform, bundesland, foerdergeberTyp, kategorie].filter(Boolean).length;

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <School className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Förderfinder</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              Förderprogramme für Schulen
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Finden Sie passende Förderungen für Ihre Schule. 
              Aktuell {stats.total} Programme im Überblick.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.total}</div>
              <div className="text-xs text-slate-500">Programme</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{stats.bund}</div>
              <div className="text-xs text-slate-500">Bund</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.land}</div>
              <div className="text-xs text-slate-500">Länder</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.stiftung}</div>
              <div className="text-xs text-slate-500">Stiftungen</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.eu}</div>
              <div className="text-xs text-slate-500">EU</div>
            </div>
          </div>

          {/* Filter-Bereich */}
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-orange-400" />
                <h2 className="font-semibold text-slate-200">Filter</h2>
                {aktiveFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400">
                    {aktiveFilterCount} aktiv
                  </span>
                )}
              </div>
              {hatAktiveFilter && (
                <button
                  onClick={resetFilter}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
                >
                  <X className="h-4 w-4" />
                  Filter zurücksetzen
                </button>
              )}
            </div>

            {/* Filter-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Suchfeld */}
              <div className="relative">
                <label className="block text-xs text-slate-500 mb-1.5">Suche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Name, Beschreibung..."
                    value={suchbegriff}
                    onChange={(e) => setSuchbegriff(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                  />
                  {suchbegriff && (
                    <button
                      onClick={() => setSuchbegriff("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Schulform-Dropdown */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Schulform</label>
                <select
                  value={schulform}
                  onChange={(e) => setSchulform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  {SCHULFORMEN.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bundesland-Dropdown */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Bundesland</label>
                <select
                  value={bundesland}
                  onChange={(e) => setBundesland(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  {BUNDESLAENDER.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fördergeber-Typ-Dropdown */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Fördergeber</label>
                <select
                  value={foerdergeberTyp}
                  onChange={(e) => setFoerdergeberTyp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  {FOERDERGEBER_TYPEN.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kategorie-Dropdown */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Kategorie</label>
                <select
                  value={kategorie}
                  onChange={(e) => setKategorie(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  {KATEGORIEN.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ergebnis-Anzeige */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100">
              {gefilterteProgramme.length === stats.total 
                ? `Alle Programme (${stats.total})`
                : `${gefilterteProgramme.length} von ${stats.total} Programmen gefunden`
              }
            </h2>
          </div>

          {/* Programm-Liste */}
          <div className="space-y-6">
            {gefilterteProgramme.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">
                  Keine Programme gefunden
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  Versuchen Sie es mit anderen Filterkriterien oder setzen Sie die Filter zurück.
                </p>
                <button
                  onClick={resetFilter}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-sm font-medium"
                >
                  <X className="h-4 w-4" />
                  Filter zurücksetzen
                </button>
              </div>
            ) : (
              gefilterteProgramme.map((programm) => (
                <article 
                  key={programm.id}
                  className="glass rounded-2xl p-6 md:p-8 hover:border-orange-500/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${programm.foerdergeberTyp === 'bund' ? 'bg-cyan-500/20 text-cyan-400' : ''}
                          ${programm.foerdergeberTyp === 'land' ? 'bg-purple-500/20 text-purple-400' : ''}
                          ${programm.foerdergeberTyp === 'stiftung' ? 'bg-green-500/20 text-green-400' : ''}
                          ${programm.foerdergeberTyp === 'eu' ? 'bg-blue-500/20 text-blue-400' : ''}
                        `}>
                          {programm.foerdergeberTyp.toUpperCase()}
                        </span>
                        {programm.kiAntragGeeignet && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                            KI-geeignet
                          </span>
                        )}
                        {programm.status === 'aktiv' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            Aktiv
                          </span>
                        )}
                      </div>

                      {/* Titel */}
                      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-orange-400 transition-colors">
                        {programm.name}
                      </h3>

                      {/* Fördergeber */}
                      <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {programm.foerdergeber}
                      </p>

                      {/* Beschreibung */}
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        {programm.kurzbeschreibung}
                      </p>

                      {/* Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                        {programm.foerdersummeText && (
                          <span className="flex items-center gap-1">
                            <Euro className="h-4 w-4 text-slate-500" />
                            {programm.foerdersummeText}
                          </span>
                        )}
                        {programm.bewerbungsfristText && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            {programm.bewerbungsfristText}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          {programm.bundeslaender.includes('alle') 
                            ? 'Alle Bundesländer' 
                            : `${programm.bundeslaender.length} Bundesländer`
                          }
                        </span>
                      </div>

                      {/* Kategorien */}
                      <div className="flex flex-wrap gap-2">
                        {programm.kategorien.slice(0, 5).map(kat => (
                          <span 
                            key={kat}
                            className="px-2 py-1 rounded-md text-xs bg-slate-800 text-slate-400"
                          >
                            {kat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-3 md:items-end">
                      <Link
                        href={`/foerderprogramme/${programm.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-sm font-medium whitespace-nowrap"
                      >
                        Details ansehen
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      {(programm as any).antragsLink && (
                        <Link
                          href={`/antrag/${programm.id}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-outline text-sm font-medium whitespace-nowrap"
                        >
                          Antrag starten
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Hinweis */}
          <div className="mt-12 glass rounded-2xl p-8 text-center">
            <Search className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              Mehr Programme werden ergänzt
            </h3>
            <p className="text-slate-400 max-w-xl mx-auto">
              Unsere Datenbank wächst stetig. Wir erfassen aktuell Programme 
              von Bund, Ländern, Stiftungen und der EU. Haben Sie ein Programm gefunden, 
              das hier fehlt? Melden Sie sich bei uns.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
