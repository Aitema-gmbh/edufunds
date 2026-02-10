"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Kontakt | EduFunds",
  description: "Kontaktieren Sie das EduFunds-Team. Wir helfen Ihnen bei Fragen zu Fördermitteln.",
};

export default function KontaktPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ backgroundColor: "#0a1628" }}>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(201, 162, 39, 0.15) 0%, transparent 50%)`,
            }} />
          </div>
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-block px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase mb-6"
                style={{ backgroundColor: "rgba(201, 162, 39, 0.1)", color: "#c9a227" }}>
                Kontakt
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#f8f5f0" }}>
                Wir sind für Sie <span style={{ color: "#c9a227" }}>da</span>
              </h1>
              <p className="text-lg" style={{ color: "#94a3b8" }}>
                Haben Sie Fragen zu Fördermitteln oder unserer Plattform? 
                Kontaktieren Sie uns - wir helfen gerne weiter.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-8" style={{ color: "#f8f5f0" }}>
                  So erreichen Sie uns
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}>
                      <Mail className="w-5 h-5" style={{ color: "#c9a227" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "#f8f5f0" }}>E-Mail</h3>
                      <a href="mailto:office@aitema.de" className="hover:text-amber-400 transition-colors"
                        style={{ color: "#94a3b8" }}>
                        office@aitema.de
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}>
                      <Phone className="w-5 h-5" style={{ color: "#c9a227" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "#f8f5f0" }}>Telefon</h3>
                      <a href="tel:+491234567890" className="hover:text-amber-400 transition-colors"
                        style={{ color: "#94a3b8" }}>
                        +49 (0) 123 456 7890
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}>
                      <Clock className="w-5 h-5" style={{ color: "#c9a227" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "#f8f5f0" }}>Erreichbarkeit</h3>
                      <p style={{ color: "#94a3b8" }}>
                        Mo-Fr: 9:00 - 17:00 Uhr
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}>
                      <MapPin className="w-5 h-5" style={{ color: "#c9a227" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "#f8f5f0" }}>Anschrift</h3>
                      <p style={{ color: "#94a3b8" }}>
                        EduFunds by Aitema GmbH<br />
                        Musterstraße 123<br />
                        10115 Berlin
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-8 rounded-2xl"
                style={{ backgroundColor: "rgba(30, 58, 97, 0.3)", border: "1px solid rgba(201, 162, 39, 0.2)" }}
              >
                <h2 className="text-2xl font-bold mb-6" style={{ color: "#f8f5f0" }}>
                  Nachricht senden
                </h2>
                
                <form className="space-y-4" action="/api/contact" method="POST">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: "rgba(10, 22, 40, 0.5)",
                        borderColor: "rgba(201, 162, 39, 0.3)",
                        color: "#f8f5f0"
                      }}
                      placeholder="Ihr Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: "rgba(10, 22, 40, 0.5)",
                        borderColor: "rgba(201, 162, 39, 0.3)",
                        color: "#f8f5f0"
                      }}
                      placeholder="ihre@email.de"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                      Betreff *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: "rgba(10, 22, 40, 0.5)",
                        borderColor: "rgba(201, 162, 39, 0.3)",
                        color: "#f8f5f0"
                      }}
                      placeholder="Worum geht es?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                      Nachricht *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none"
                      style={{ 
                        backgroundColor: "rgba(10, 22, 40, 0.5)",
                        borderColor: "rgba(201, 162, 39, 0.3)",
                        color: "#f8f5f0"
                      }}
                      placeholder="Ihre Nachricht..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="datenschutz"
                      required
                      className="mt-1"
                    />
                    <label className="text-sm" style={{ color: "#94a3b8" }}>
                      Ich habe die <Link href="/datenschutz" className="underline hover:text-amber-400">Datenschutzerklärung</Link> gelesen und stimme zu. *
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ backgroundColor: "#c9a227", color: "#0a1628" }}
                  >
                    <Send className="w-5 h-5" />
                    Nachricht senden
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
