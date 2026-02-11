"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/stripe/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.success ? "success" : "error");
        })
        .catch(() => setStatus("error"));
    } else {
      setStatus("success"); // Direkter Zugriff ohne Session
    }
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#c9a227] mx-auto" />
        <p className="text-slate-400 mt-4">Zahlung wird verifiziert...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Verifizierung fehlgeschlagen</h1>
        <p className="text-slate-400 mb-8">Bitte kontaktieren Sie uns.</p>
        <Link href="/kontakt" className="px-6 py-3 rounded-xl bg-[#c9a227] text-slate-900 font-semibold">
          Kontakt
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Zahlung erfolgreich!</h1>
      <p className="text-slate-400 mb-8">Vielen Dank für Ihren Kauf.</p>
      <Link href="/" className="px-6 py-3 rounded-xl bg-[#c9a227] text-slate-900 font-semibold">
        Zur Startseite
      </Link>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20" style={{ backgroundColor: "#0a1628" }}>
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Suspense fallback={
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#c9a227] mx-auto" />
                <p className="text-slate-400 mt-4">Laden...</p>
              </div>
            }>
              <SuccessContent />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
