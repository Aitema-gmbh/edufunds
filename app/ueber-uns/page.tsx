import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Rocket, 
  Users, 
  Target, 
  Heart,
  Lightbulb,
  Award,
  Building2,
  Mail,
  MapPin
} from "lucide-react";

export const metadata = {
  title: "Über uns | EduFunds",
  description: "Lernen Sie das Team hinter EduFunds kennen. Wir helfen Schulen, Fördermittel zu finden und erfolgreich zu beantragen.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <Heart className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Unser Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6">
              Wir machen <span className="text-gradient">Fördermittel</span> zugänglich
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              EduFunds ist ein Projekt der AITEMA GmbH mit dem Ziel, Bildungseinrichtungen 
              bei der Suche und Beantragung von Fördermitteln zu unterstützen.
            </p>
          </div>

          {/* Mission */}
          <section className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="glass-strong rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-6">
                <Rocket className="h-6 w-6 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Unsere Mission</h2>
              <p className="text-slate-400 leading-relaxed">
                Wir glauben, dass jede Schule Zugang zu Fördermitteln haben sollte, 
                um Bildungsprojekte zu realisieren. Unsere KI-gestützte Plattform 
                macht den Antragsprozess einfacher, schneller und erfolgreicher.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Unsere Vision</h2>
              <p className="text-slate-400 leading-relaxed">
                Wir möchten Deutschlands führende Plattform für schulische Fördermittel werden 
                und jährlich Tausenden von Schulen helfen, ihre Projekte zu finanzieren.
              </p>
            </div>
          </section>

          {/* Werte */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-slate-100 text-center mb-12">Unsere Werte</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Innovation</h3>
                <p className="text-slate-400">
                  Wir nutzen modernste KI-Technologie, um den Antragsprozess zu revolutionieren.
                </p>
              </div>

              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Kundennähe</h3>
                <p className="text-slate-400">
                  Wir verstehen die Bedürfnisse von Schulen und entwickeln unsere Lösungen 
                  eng mit ihnen zusammen.
                </p>
              </div>

              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                  <Award className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Qualität</h3>
                <p className="text-slate-400">
                  Wir setzen höchste Standards für unsere Daten, unsere Software 
                  und unseren Support.
                </p>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="glass-strong rounded-3xl p-8 md:p-12 mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-100 mb-6">
                  Ein starkes Team
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Hinter EduFunds steht ein erfahrenes Team aus Bildungsexperten, 
                  Softwareentwicklern und Fördermittelspezialisten. Gemeinsam bringen 
                  wir digitale Innovation in den Bildungssektor.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Unser Team vereint langjährige Erfahrung in der Arbeit mit Schulen, 
                  tiefe Kenntnisse des Fördermittel-Ökosystems und technologische Expertise.
                </p>
              </div>
              <div className="glass rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-orange-400" />
                  Ein Unternehmen der AITEMA GmbH
                </h3>
                <div className="space-y-4 text-slate-400">
                  <p className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      Prenzlauer Allee 229<br />
                      10405 Berlin
                    </span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-500 shrink-0" />
                    <a href="mailto:office@aitema.de" className="text-orange-400 hover:text-orange-300 transition-colors">
                      office@aitema.de
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Zahlen */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">50+</div>
              <div className="text-slate-500 text-sm">Förderprogramme</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">500+</div>
              <div className="text-slate-500 text-sm">Schulen unterstützt</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">90%</div>
              <div className="text-slate-500 text-sm">Erfolgsquote</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-slate-500 text-sm">Verfügbarkeit</div>
            </div>
          </section>

          {/* CTA */}
          <section className="glass-strong rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              Möchten Sie mehr erfahren?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Haben Sie Fragen zu EduFunds oder möchten Sie mehr über unser Team erfahren? 
              Wir freuen uns auf Ihre Nachricht.
            </p>
            <a 
              href="/kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Mail className="h-5 w-5" />
              Kontaktieren Sie uns
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
