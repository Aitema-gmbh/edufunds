import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Mail, 
  MapPin, 
  Phone,
  Clock,
  Send,
  MessageSquare,
  ArrowRight
} from "lucide-react";

export const metadata = {
  title: "Kontakt | EduFunds",
  description: "Kontaktieren Sie das EduFunds-Team. Wir helfen Ihnen bei Fragen zu Fördermitteln und unserer Plattform.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Kontakt</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
              Wir sind für Sie da
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Haben Sie Fragen zu Förderprogrammen, unserer Plattform oder benötigen Sie Unterstützung? 
              Kontaktieren Sie uns – wir helfen Ihnen gerne weiter.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Kontaktformular */}
            <section className="glass-strong rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                <Send className="h-6 w-6 text-orange-400" />
                Nachricht senden
              </h2>
              
              <form className="space-y-6" action="mailto:office@aitema.de" method="post" encType="text/plain">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Ihr Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="ihre@email.de"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                    Betreff *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
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
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Nachricht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    placeholder="Ihre Nachricht..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    name="privacy"
                    required
                    className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-800/50 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="privacy" className="text-sm text-slate-400">
                    Ich habe die <a href="/datenschutz" className="text-orange-400 hover:text-orange-300">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu. *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Nachricht senden
                </button>

                <p className="text-xs text-slate-500 text-center">
                  * Pflichtfelder
                </p>
              </form>
            </section>

            {/* Kontaktdaten */}
            <section className="space-y-8">
              <div className="glass-strong rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Direkter Kontakt</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100 mb-1">E-Mail</h3>
                      <a 
                        href="mailto:office@aitema.de" 
                        className="text-slate-400 hover:text-orange-400 transition-colors"
                      >
                        office@aitema.de
                      </a>
                      <p className="text-sm text-slate-500 mt-1">
                        Für allgemeine Anfragen und Support
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100 mb-1">Adresse</h3>
                      <div className="text-slate-400">
                        <p>AITEMA GmbH</p>
                        <p>Prenzlauer Allee 229</p>
                        <p>10405 Berlin</p>
                        <p className="text-slate-500">Deutschland</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100 mb-1">Erreichbarkeit</h3>
                      <p className="text-slate-400">
                        Montag – Freitag<br />
                        09:00 – 17:00 Uhr
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        (ausgenommen gesetzliche Feiertage)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schnell-Links */}
              <div className="glass rounded-3xl p-8">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Schnell-Links</h3>
                <div className="space-y-3">
                  <a 
                    href="/foerderprogramme" 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
                  >
                    <span className="text-slate-300">Förderprogramme entdecken</span>
                    <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
                  </a>
                  <a 
                    href="/agb" 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
                  >
                    <span className="text-slate-300">AGB lesen</span>
                    <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
                  </a>
                  <a 
                    href="/datenschutz" 
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
                  >
                    <span className="text-slate-300">Datenschutzerklärung</span>
                    <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* FAQ Teaser */}
          <section className="glass rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              Häufig gestellte Fragen
            </h2>
            <p className="text-slate-400 mb-6 max-w-xl mx-auto">
              Vielleicht finden Sie die Antwort auf Ihre Frage bereits in unseren FAQ.
            </p>
            <a 
              href="/hilfe"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-orange-500 hover:text-orange-400 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              FAQ ansehen
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
