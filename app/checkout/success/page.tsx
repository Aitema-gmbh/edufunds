"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (sessionId) {
      // Verifiziere die Zahlung
      fetch(`/api/stripe/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus("success");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    }
  }, [sessionId]);

  if (status === "loading") {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-20" style={{ backgroundColor: "#0a1628" }}>
          <div className="container mx-auto px-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#c9a227] mx-auto" />
            <p className="text-slate-400 mt-4">Zahlung wird verifiziert...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-20" style={{ backgroundColor: "#0a1628" }}>
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Verifizierung fehlgeschlagen
              </h1>
              <p className="text-slate-400 mb-8">
                Die Zahlung konnte nicht verifiziert werden. Bitte kontaktieren Sie uns.
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c9a227] text-slate-900 font-semibold"
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20" style={{ backgroundColor: "#0a1628" }}>
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Zahlung erfolgreich!
              </h1>
              <p className="text-slate-400 mb-8">
                Vielen Dank für Ihren Kauf. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
              </p>
              
              <div className="p-6 rounded-2xl border border-[#c9a227]/20 bg-slate-800/50 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Was passiert jetzt?
                </h2>
                <ul className="text-left space-y-3 text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-[#c9a227]">1.</span>
                    <span>Sie erhalten eine Bestätigungs-E-Mail mit Ihren Zugangsdaten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c9a227]">2.</span>
                    <span>Melden Sie sich mit Ihrer E-Mail-Adresse an</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c9a227]">3.</span>
                    <span>Starten Sie Ihren ersten KI-Antrag</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/foerderprogramme"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c9a227] text-slate-900 font-semibold hover:bg-[#b8941f] transition-colors"
                >
                  Programme entdecken
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1e3a61] text-[#94a3b8] hover:border-[#c9a227] hover:text-[#c9a227] transition-colors"
                >
                  Zur Startseite
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
