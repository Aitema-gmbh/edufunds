import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { motion } from "framer-motion";
import { 
  Mail, 
  MapPin, 
  Phone,
  Clock,
  Send,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Kontakt | EduFunds",
  description: "Kontaktieren Sie das EduFunds-Team. Wir helfen Ihnen bei Fragen zu Fördermitteln und unserer Plattform.",
};

const quickLinks = [
  { label: "Förderprogramme entdecken", href: "/foerderprogramme", description: "Durchsuchen Sie unsere Datenbank" },
  { label: "AGB lesen", href: "/agb", description: "Unsere Geschäftsbedingungen" },
  { label: "Datenschutzerklärung", href: "/datenschutz", description: "Ihre Daten sind sicher" },
];

const contactInfo = [
  {
    icon: <Mail className="w-6 h-6" />,
    title: "E-Mail",
    content: "office@aitema.de",
    href: "mailto:office@aitema.de",
    description: "Für allgemeine Anfragen und Support"
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Adresse",
    content: "Prenzlauer Allee 229, 10405 Berlin",
    description: "Deutschland"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Erreichbarkeit",
    content: "Mo – Fr, 09:00 – 17:00 Uhr",
    description: "Ausgenommen gesetzliche Feiertage"
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <PageHero
          badge={{
            icon: <MessageSquare className="w-3.5 h-3.5" />,
            text: "Kontakt"
          }}
          title="Wir sind für"
          titleAccent="Sie da"
          subtitle="Haben Sie Fragen zu Förderprogrammen, unserer Plattform oder benötigen Sie Unterstützung? Kontaktieren Sie uns – wir helfen Ihnen gerne weiter."
          variant="dark"
        />

        {/* Contact Section */}
        <section style={{ backgroundColor: "#0a1628" }} className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div
                  className="rounded-2xl p-8 relative overflow-hidden"
                  style={{
                    background: "rgba(15, 31, 56, 0.8)",
                    border: "1px solid rgba(201, 162, 39, 0.15)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {/* Corner Decoration */}
                  <div 
                    className="absolute top-0 right-0 w-24 h-24 opacity-20"
                    style={{
                      background: "linear-gradient(135deg, transparent 50%, #c9a227 50%)",
                    }}
                  />

                  <div className="flex items-center gap-3 mb-8">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}
                    >
                      <Send className="w-6 h-6" style={{ color: "#c9a227" }} />
                    </div>
                    <h2 className="font-serif text-2xl" style={{ color: "#f8f5f0" }}>
                      Nachricht senden
                    </h2>
                  </div>
                  
                  <form className="space-y-6" action="mailto:office@aitema.de" method="post" encType="text/plain">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: "rgba(10, 22, 40, 0.6)",
                            border: "1px solid rgba(201, 162, 39, 0.1)",
                            color: "#f8f5f0",
                          }}
                          placeholder="Ihr Name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                          E-Mail *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: "rgba(10, 22, 40, 0.6)",
                            border: "1px solid rgba(201, 162, 39, 0.1)",
                            color: "#f8f5f0",
                          }}
                          placeholder="ihre@email.de"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                        Betreff *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 cursor-pointer appearance-none"
                        style={{
                          backgroundColor: "rgba(10, 22, 40, 0.6)",
                          border: "1px solid rgba(201, 162, 39, 0.1)",
                          color: "#f8f5f0",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c9a227' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 16px center",
                        }}
                      >
                        <option value="">Bitte wählen</option>
                        <option value="frage">Allgemeine Frage</option>
                        <option value="foerdermittel">Frage zu Fördermitteln</option>
                        <option value="plattform">Technische Unterstützung</option>
                        <option value="partnerschaft">Partnerschaftsanfrage</option>
                        <option value="sonstiges">Sonstiges</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>
                        Nachricht *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                        style={{
                          backgroundColor: "rgba(10, 22, 40, 0.6)",
                          border: "1px solid rgba(201, 162, 39, 0.1)",
                          color: "#f8f5f0",
                        }}
                        placeholder="Ihre Nachricht..."
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        name="privacy"
                        required
                        className="mt-1 w-5 h-5 rounded cursor-pointer"
                        style={{
                          accentColor: "#c9a227",
                        }}
                      />
                      <label htmlFor="privacy" className="text-sm" style={{ color: "#94a3b8" }}>
                        Ich habe die <Link href="/datenschutz" className="hover:underline" style={{ color: "#c9a227" }}>Datenschutzerklärung</Link> gelesen und stimme der Verarbeitung meiner Daten zu. *
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full group flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: "linear-gradient(135deg, #c9a227, #e4c55a)",
                        color: "#0a1628",
                      }}
                    >
                      <Send className="w-5 h-5" />
                      Nachricht senden
                    </button>

                    <p className="text-xs text-center" style={{ color: "#64748b" }}>
                      * Pflichtfelder
                    </p>
                  </form>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="space-y-6"
              >
                {contactInfo.map((info, index) => (
                  <InfoCard
                    key={info.title}
                    icon={info.icon}
                    title={info.title}
                    variant="highlight"
                    delay={index * 0.1}
                  >
                    {info.href ? (
                      <a 
                        href={info.href} 
                        className="font-semibold block mb-1 hover:text-c9a227 transition-colors"
                        style={{ color: "#f8f5f0" }}
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="font-semibold block mb-1" style={{ color: "#f8f5f0" }}>
                        {info.content}
                      </p>
                    )}
                    <p style={{ color: "#94a3b8" }}>{info.description}</p>
                  </InfoCard>
                ))}

                {/* Quick Links */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(15, 31, 56, 0.6)",
                    border: "1px solid rgba(201, 162, 39, 0.1)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <h3 className="font-serif text-xl mb-4" style={{ color: "#f8f5f0" }}>
                    Schnell-Links
                  </h3>
                  <div className="space-y-3">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:translate-x-1"
                        style={{
                          backgroundColor: "rgba(10, 22, 40, 0.4)",
                          border: "1px solid rgba(201, 162, 39, 0.05)",
                        }}
                      >
                        <div>
                          <span className="block font-medium" style={{ color: "#f8f5f0" }}>
                            {link.label}
                          </span>
                          <span className="text-sm" style={{ color: "#64748b" }}>
                            {link.description}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: "#c9a227" }} />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section style={{ backgroundColor: "#f8f5f0" }} className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  backgroundColor: "rgba(10, 22, 40, 0.05)",
                  border: "1px solid rgba(10, 22, 40, 0.1)",
                }}
              >
                <HelpCircle className="w-4 h-4" style={{ color: "#c9a227" }} />
                <span className="text-sm font-medium" style={{ color: "#0a1628" }}>Hilfe-Center</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: "#0a1628" }}>
                Häufig gestellte Fragen
              </h2>
              <p className="text-lg mb-8" style={{ color: "#1e3a61" }}>
                Vielleicht finden Sie die Antwort auf Ihre Frage bereits in unseren FAQ.
              </p>
              <Link
                href="/hilfe"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
                style={{
                  border: "2px solid #0a1628",
                  color: "#0a1628",
                }}
              >
                <MessageSquare className="w-5 h-5" />
                FAQ ansehen
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
