"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Archive, Calendar, Building2, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Foerderprogramm } from '@/lib/foerderSchema';
import foerderprogrammeData from '@/data/foerderprogramme.json';
const foerderprogramme = foerderprogrammeData as Foerderprogramm[];

// Filtere abgelaufene Programme
const archivProgramme = foerderprogramme.filter((p) => p.status === "abgelaufen");

// Hilfsfunktion für Fördergeber-Typ Badge
function getFoerdergeberBadgeClass(typ: string) {
  switch (typ) {
    case 'bund':
      return 'bg-slate-700/50 text-slate-400 border-slate-600';
    case 'land':
      return 'bg-slate-700/50 text-slate-400 border-slate-600';
    case 'stiftung':
      return 'bg-slate-700/50 text-slate-400 border-slate-600';
    case 'eu':
      return 'bg-slate-700/50 text-slate-400 border-slate-600';
    default:
      return 'bg-slate-700/50 text-slate-400 border-slate-600';
  }
}

function getFoerdergeberLabel(typ: string) {
  switch (typ) {
    case 'bund':
      return 'Bund';
    case 'land':
      return 'Land';
    case 'stiftung':
      return 'Stiftung';
    case 'eu':
      return 'EU';
    case 'sonstige':
      return 'Sonstige';
    default:
      return typ;
  }
}

// Archiv-Card Komponente
function ArchivCard({ programm }: { programm: Foerderprogramm }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-6 opacity-75 hover:opacity-100 transition-opacity"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs border ${getFoerdergeberBadgeClass(programm.foerdergeberTyp)}`}>
              {getFoerdergeberLabel(programm.foerdergeberTyp)}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-500 border border-slate-700">
              Abgelaufen
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-1">
            {programm.name}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {programm.foerdergeber}
          </p>
        </div>
      </div>

      {/* Beschreibung */}
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {programm.kurzbeschreibung}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Letzte Frist</span>
          </div>
          <div className="text-slate-400 font-medium">
            {programm.bewerbungsfristText}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">Fördersumme</span>
          </div>
          <div className="text-slate-400 font-medium">
            {programm.foerdersummeText}
          </div>
        </div>
      </div>

      {/* Archiv-Hinweis */}
      {programm.bemerkung && (
        <div className="flex items-start gap-2 p-3 bg-slate-800/30 rounded-lg text-xs text-slate-500">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-600" />
          <p className="line-clamp-2">{programm.bemerkung}</p>
        </div>
      )}

      {/* Info-Link (optional) */}
      {programm.infoLink && (
        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <a
            href={programm.infoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1"
          >
            Zur Archiv-Information →
          </a>
        </div>
      )}
    </motion.div>
  );
}

export default function ArchivPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/30 border border-slate-600/30 mb-6">
              <Archive className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-400">Archiv</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-300 mb-4">
              Abgelaufene Förderprogramme
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Diese Programme sind abgelaufen. Neue Runden werden angekündigt.
              <br />
              <span className="text-sm">Hinweis: Bitte prüfen Sie direkt beim Fördergeber für aktuelle Ausschreibungen.</span>
            </p>
          </div>

          {/* Zurück-Link */}
          <div className="mb-8">
            <Link
              href="/foerderprogramme"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zu aktuellen Programmen
            </Link>
          </div>

          {/* Info-Box */}
          <div className="mb-10 p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-700/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-300 mb-2">
                  Information zum Archiv
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Abgelaufene Programme können in neuen Runden wieder ausgeschrieben werden. 
                  Die hier aufgeführten Daten dienen als Referenz. Für aktuelle Fristen und 
                  Bedingungen kontaktieren Sie bitte direkt den jeweiligen Fördergeber.
                </p>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="mb-8 text-center">
            <span className="text-slate-500 text-sm">
              {archivProgramme.length} abgelaufene Programme im Archiv
            </span>
          </div>

          {/* Programme-Liste */}
          {archivProgramme.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Archive className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                Keine abgelaufenen Programme
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Derzeit befinden sich keine abgelaufenen Programme im Archiv.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {archivProgramme.map((programm) => (
                <ArchivCard key={programm.id} programm={programm} />
              ))}
            </div>
          )}

          {/* Tabelle-Alternative für detaillierte Übersicht */}
          {archivProgramme.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-slate-300 mb-6">
                Übersichtstabelle
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="py-3 px-4 text-sm font-medium text-slate-400">Programm</th>
                      <th className="py-3 px-4 text-sm font-medium text-slate-400">Fördergeber</th>
                      <th className="py-3 px-4 text-sm font-medium text-slate-400">Letzte Frist</th>
                      <th className="py-3 px-4 text-sm font-medium text-slate-400">Fördersumme</th>
                      <th className="py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivProgramme.map((programm, index) => (
                      <tr 
                        key={programm.id} 
                        className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${index % 2 === 0 ? 'bg-slate-800/10' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-300">{programm.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{programm.kurzbeschreibung}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400">{programm.foerdergeber}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">{programm.bewerbungsfristText}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">{programm.foerdersummeText}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400 border border-slate-600">
                            Abgelaufen
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hinweis unten */}
          <div className="mt-12 text-center p-6 bg-slate-800/20 rounded-2xl border border-slate-700/30">
            <p className="text-slate-500 text-sm">
              Sollten Sie neue Ausschreibungen zu einem dieser Programme kennen, 
              <Link href="/kontakt" className="text-slate-400 hover:text-slate-300 underline ml-1">
                kontaktieren Sie uns
              </Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
