import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Server, Mail, Lock, UserCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Datenschutz | EduFunds",
  description: "Datenschutzerklärung der EduFunds Plattform gemäß DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">DSGVO-konform</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              Datenschutz
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Datenschutzerklärung gemäß der Datenschutz-Grundverordnung (DSGVO)
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Überblick */}
            <section className="glass-strong rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-slate-100 mb-6">1. Datenschutz auf einen Blick</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-3">Allgemeine Hinweise</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                    personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
                    Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-3">Datenerfassung auf dieser Website</h3>
                  <p className="text-slate-300 leading-relaxed mb-3">
                    <strong className="text-slate-200">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
                    Dessen Kontaktdaten können Sie dem Abschnitt „Verantwortlicher" in dieser 
                    Datenschutzerklärung entnehmen.
                  </p>
                </div>
              </div>
            </section>

            {/* Verantwortlicher */}
            <section className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100">2. Verantwortlicher</h2>
              </div>
              
              <div className="text-slate-300 space-y-4">
                <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
                <div className="glass-strong rounded-xl p-6 space-y-2">
                  <p className="font-medium text-slate-100">AITEMA GmbH i.G.</p>
                  <p>Prenzlauer Allee 229</p>
                  <p>10405 Berlin</p>
                  <p className="text-slate-500">Deutschland</p>
                  <div className="pt-2">
                    <p className="text-slate-400">Vertreten durch:</p>
                    <p className="font-medium text-slate-200">Kolja Schumann (Geschäftsführer)</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-slate-400">E-Mail:</p>
                    <a 
                      href="mailto:office@aitema.de" 
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      office@aitema.de
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Hosting */}
            <section className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Server className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100">3. Hosting und Content Delivery Network</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-3">Hetzner</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Wir hosten unsere Website bei der Hetzner Online GmbH, Industriestr. 25, 
                    91710 Gunzenhausen, Deutschland. Die Server stehen ausschließlich in Deutschland.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-3">Cloudflare</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Wir nutzen das Content Delivery Network (CDN) von Cloudflare, Inc., 
                    101 Townsend St., San Francisco, CA 94107, USA. Cloudflare ist unter dem 
                    EU-US Data Privacy Framework zertifiziert.
                  </p>
                </div>
              </div>
            </section>

            {/* Kontaktformular */}
            <section className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100">4. Kontaktformular</h2>
              </div>

              <div className="text-slate-300 space-y-4">
                <p className="leading-relaxed">
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben 
                  aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten 
                  zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns 
                  gespeichert.
                </p>

                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-3">E-Mail-Versand via Resend</h3>
                  <p className="leading-relaxed">
                    Für den Versand von E-Mails über das Kontaktformular nutzen wir den Dienst 
                    Resend (Resend, Inc., San Francisco, CA, USA). Resend ist unter dem EU-US 
                    Data Privacy Framework zertifiziert.
                  </p>
                </div>
              </div>
            </section>

            {/* Ihre Rechte */}
            <section className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100">5. Ihre Rechte</h2>
              </div>

              <p className="text-slate-300 mb-4">Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
              
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Recht auf Auskunft (Art. 15 DSGVO)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Recht auf Berichtigung (Art. 16 DSGVO)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Recht auf Löschung (Art. 17 DSGVO)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</span>
                </li>
              </ul>

              <p className="text-slate-300 mt-4">
                Zur Ausübung Ihrer Rechte kontaktieren Sie bitte:{' '}
                <a 
                  href="mailto:office@aitema.de" 
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  office@aitema.de
                </a>
              </p>
            </section>

            {/* SSL */}
            <section className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-100">6. SSL-/TLS-Verschlüsselung</h2>
              </div>

              <p className="text-slate-300 leading-relaxed">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher 
                Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen 
                Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt 
                und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
            </section>
          </div>

          {/* Stand */}
          <p className="text-center text-slate-500 text-sm mt-12">
            Stand: Februar 2026
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
