"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle, ArrowLeft, CreditCard, Shield, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const features = [
  "1 KI-generierter Antrag",
  "PDF-Export",
  "30 Tage E-Mail-Support",
  "Antrags-Review",
  "Unbegrenzte Suche",
  "Keine Laufzeit",
];

export default function CheckoutEinzelPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    alert("Zahlungssystem wird noch eingerichtet. Bitte kontaktieren Sie uns direkt.");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20" style={{ backgroundColor: "#0a1628" }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link
                href="/preise"
                className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#c9a227] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zu den Preisen
              </Link>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Plan Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="p-8 rounded-2xl h-full"
                  style={{
                    backgroundColor: "rgba(15, 31, 56, 0.6)",
                    border: "1px solid rgba(201, 162, 39, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}
                    >
                      <Sparkles className="w-6 h-6 text-[#c9a227]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl" style={{ color: "#f8f5f0" }}>
                        Einzelantrag
                      </h2>
                      <p style={{ color: "#94a3b8" }}>Für spontane Projekte</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-5xl" style={{ color: "#c9a227" }}>
                        29 €
                      </span>
                      <span style={{ color: "#94a3b8" }}>einmalig</span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: "#64748b" }}>
                      zzgl. MwSt. | Einmalige Zahlung, kein Abo
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold" style={{ color: "#f8f5f0" }}>
                      Enthaltene Leistungen:
                    </h3>
                    <ul className="space-y-3">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-[#c9a227] flex-shrink-0" />
                          <span style={{ color: "#94a3b8" }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t" style={{ borderColor: "rgba(201, 162, 39, 0.1)" }}>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2" style={{ color: "#64748b" }}>
                        <Shield className="w-4 h-4" />
                        Sichere Zahlung
                      </div>
                      <div className="flex items-center gap-2" style={{ color: "#64748b" }}>
                        <Clock className="w-4 h-4" />
                        Sofortiger Zugriff
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  className="p-8 rounded-2xl h-full flex flex-col"
                  style={{
                    backgroundColor: "rgba(15, 31, 56, 0.6)",
                    border: "1px solid rgba(201, 162, 39, 0.1)",
                  }}
                >
                  <h3 className="font-serif text-xl mb-6" style={{ color: "#f8f5f0" }}>
                    Zahlung
                  </h3>

                  {/* Payment Methods */}
                  <div className="space-y-3 mb-6">
                    <div
                      className="p-4 rounded-xl border-2 border-[#c9a227] flex items-center gap-3 cursor-pointer"
                      style={{ backgroundColor: "rgba(201, 162, 39, 0.05)" }}
                    >
                      <CreditCard className="w-5 h-5 text-[#c9a227]" />
                      <span style={{ color: "#f8f5f0" }}>Kreditkarte</span>
                      <span className="ml-auto text-xs px-2 py-1 rounded bg-[#c9a227]/20 text-[#c9a227]">
                        Demnächst
                      </span>
                    </div>
                    <div
                      className="p-4 rounded-xl border border-[#1e3a61] flex items-center gap-3 opacity-50"
                    >
                      <FileText className="w-5 h-5" style={{ color: "#64748b" }} />
                      <span style={{ color: "#94a3b8" }}>Rechnung</span>
                      <span className="ml-auto text-xs px-2 py-1 rounded bg-[#1e3a61] text-[#64748b]">
                        Bald verfügbar
                      </span>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div
                    className="p-4 rounded-xl mb-6"
                    style={{ backgroundColor: "rgba(201, 162, 39, 0.05)" }}
                  >
                    <p className="text-sm" style={{ color: "#94a3b8" }}>
                      <strong style={{ color: "#c9a227" }}>Hinweis:</strong> Das Zahlungssystem wird 
                      aktuell eingerichtet. Bitte kontaktieren Sie uns direkt für Ihren Kauf:
                    </p>
                    <a
                      href="mailto:office@aitema.de?subject=EduFunds Einzelantrag Kauf"
                      className="inline-flex items-center gap-2 mt-3 text-[#c9a227] hover:underline"
                    >
                      office@aitema.de
                    </a>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto space-y-3">
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl btn-gold font-semibold disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Wird verarbeitet...
                        </>
                      ) : (
                        <>
                          Jetzt kaufen
                          <Sparkles className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <Link
                      href="/kontakt"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#1e3a61] text-[#94a3b8] hover:border-[#c9a227] hover:text-[#c9a227] transition-colors"
                    >
                      Fragen? Kontaktieren Sie uns
                    </Link>
                  </div>

                  <p className="mt-4 text-xs text-center" style={{ color: "#64748b" }}>
                    Durch den Kauf akzeptieren Sie unsere{" "}
                    <Link href="/agb" className="text-[#c9a227] hover:underline">
                      AGB
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
