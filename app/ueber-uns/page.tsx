import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { InfoCard } from "@/components/InfoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Users, 
  Target, 
  Heart,
  Lightbulb,
  Award,
  Building2,
  Mail,
  MapPin,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Über uns | EduFunds",
  description: "Lernen Sie das Team hinter EduFunds kennen. Wir helfen Schulen, Fördermittel zu finden und erfolgreich zu beantragen.",
};

const stats = [
  { value: "50+", label: "Förderprogramme", icon: Shield },
  { value: "500+", label: "Schulen unterstützt", icon: Users },
  { value: "90%", label: "Erfolgsquote", icon: TrendingUp },
  { value: "24/7", label: "Verfügbarkeit", icon: Clock },
];

const values = [
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Innovation",
    description: "Wir nutzen modernste KI-Technologie, um den Antragsprozess zu revolutionieren und effizienter zu gestalten."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Kundennähe",
    description: "Wir verstehen die Bedürfnisse von Schulen und entwickeln unsere Lösungen eng mit ihnen zusammen."
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Qualität",
    description: "Wir setzen höchste Standards für unsere Daten, unsere Software und unseren Support."
  },
];

const milestones = [
  { year: "2023", title: "Gründung", description: "EduFunds wird als Projekt der AITEMA GmbH gegründet." },
  { year: "2024", title: "Erste Kunden", description: "Die ersten Schulen nutzen EduFunds für ihre Förderanträge." },
  { year: "2025", title: "KI-Integration", description: "Launch des KI-gestützten Antragsassistenten." },
  { year: "2026", title: "Expansion", description: "Über 500 Schulen vertrauen auf EduFunds." },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <PageHero
          badge={{
            icon: <Heart className="w-3.5 h-3.5" />,
            text: "Unser Team"
          }}
          title="Wir machen"
          titleAccent="Fördermittel zugänglich"
          subtitle="EduFunds ist ein Projekt der AITEMA GmbH mit dem Ziel, Bildungseinrichtungen bei der Suche und Beantragung von Fördermitteln zu unterstützen."
          variant="dark"
        />

        {/* Stats Section */}
        <section style={{ backgroundColor: "#0a1628" }} className="pb-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group p-6 rounded-2xl text-center"
                  style={{
                    backgroundColor: "rgba(15, 31, 56, 0.6)",
                    border: "1px solid rgba(201, 162, 39, 0.1)",
                  }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: "#c9a227" }} />
                  </div>
                  <div className="text-3xl font-serif mb-1" style={{ color: "#f8f5f0" }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: "#94a3b8" }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section style={{ backgroundColor: "#0a1628" }} className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <InfoCard
                icon={<Rocket className="w-6 h-6" />}
                title="Unsere Mission"
                variant="dark"
                delay={0}
              >
                <p>
                  Wir glauben, dass jede Schule Zugang zu Fördermitteln haben sollte, um Bildungsprojekte zu realisieren. 
                  Unsere KI-gestützte Plattform macht den Antragsprozess einfacher, schneller und erfolgreicher.
                </p>
              </InfoCard>
              <InfoCard
                icon={<Target className="w-6 h-6" />}
                title="Unsere Vision"
                variant="highlight"
                delay={0.1}
              >
                <p>
                  Wir möchten Deutschlands führende Plattform für schulische Fördermittel werden und jährlich Tausenden 
                  von Schulen helfen, ihre Projekte zu finanzieren.
                </p>
              </InfoCard>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section style={{ backgroundColor: "#f8f5f0" }} className="py-24 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 geometric-grid opacity-8" />
          
          <div className="container mx-auto px-6 relative z-10">
            <SectionHeader
              label="Geschichte"
              title="Unsere"
              titleAccent="Entwicklung"
              description="Von der Idee bis zur Plattform – der Weg von EduFunds."
              variant="light"
            />

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div 
                  className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2"
                  style={{ background: "linear-gradient(to bottom, #c9a227, #e4c55a, #c9a227)" }}
                />
                
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative flex items-start gap-8 mb-12 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Year Badge */}
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
                      style={{ background: "linear-gradient(135deg, #c9a227, #e4c55a)" }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#0a1628" }} />
                    </div>
                    
                    {/* Content */}
                    <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                      index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                    }`}>
                      <span className="inline-block font-mono text-sm tracking-wider mb-2" style={{ color: "#c9a227" }}>
                        {milestone.year}
                      </span>
                      <h3 className="font-serif text-2xl mb-2" style={{ color: "#0a1628" }}>
                        {milestone.title}
                      </h3>
                      <p style={{ color: "#1e3a61" }}>{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section style={{ backgroundColor: "#0a1628" }} className="py-24 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 geometric-grid opacity-20" />
          <div 
            className="absolute top-20 right-10 w-72 h-72 hidden lg:block"
            style={{
              background: "linear-gradient(135deg, rgba(201, 162, 39, 0.05) 0%, transparent 100%)",
              borderRadius: "40% 60% 60% 40% / 60% 40% 60% 40%",
            }}
          />

          <div className="container mx-auto px-6 relative z-10">
            <SectionHeader
              label="Unsere Werte"
              title="Was uns"
              titleAccent="auszeichnet"
              variant="dark"
            />

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <InfoCard
                  key={value.title}
                  icon={value.icon}
                  title={value.title}
                  variant="dark"
                  delay={index * 0.1}
                >
                  {value.description}
                </InfoCard>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section style={{ backgroundColor: "#f8f5f0" }} className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <SectionHeader
                    label="Team"
                    title="Ein starkes"
                    titleAccent="Team"
                    description="Hinter EduFunds steht ein erfahrenes Team aus Bildungsexperten, Softwareentwicklern und Fördermittelspezialisten."
                    variant="light"
                    align="left"
                  />
                  <div className="space-y-4" style={{ color: "#1e3a61" }}>
                    <p className="leading-relaxed">
                      Gemeinsam bringen wir digitale Innovation in den Bildungssektor. Unser Team 
                      vereint langjährige Erfahrung in der Arbeit mit Schulen, tiefe Kenntnisse des 
                      Fördermittel-Ökosystems und technologische Expertise.
                    </p>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" style={{ color: "#c9a227" }} />
                      <span>Bildungsexperten</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" style={{ color: "#c9a227" }} />
                      <span>Softwareentwickler</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" style={{ color: "#c9a227" }} />
                      <span>Fördermittelspezialisten</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <InfoCard
                    icon={<Building2 className="w-6 h-6" />}
                    title="Ein Unternehmen der AITEMA GmbH"
                    variant="light"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#c9a227" }} />
                        <span>
                          Prenzlauer Allee 229<br />
                          10405 Berlin
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 shrink-0" style={{ color: "#c9a227" }} />
                        <a href="mailto:office@aitema.de" className="hover:text-c9a227 transition-colors">
                          office@aitema.de
                        </a>
                      </div>
                    </div>
                  </InfoCard>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ backgroundColor: "#0a1628" }} className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 dots-pattern opacity-5" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-serif text-4xl md:text-5xl mb-6" style={{ color: "#f8f5f0" }}>
                Möchten Sie mehr <span style={{ color: "#c9a227" }}>erfahren?</span>
              </h2>
              <p className="text-lg mb-10" style={{ color: "#94a3b8" }}>
                Haben Sie Fragen zu EduFunds oder möchten Sie mehr über unser Team erfahren? 
                Wir freuen uns auf Ihre Nachricht.
              </p>
              <Link
                href="/kontakt"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #c9a227, #e4c55a)",
                  color: "#0a1628",
                }}
              >
                <Mail className="w-5 h-5" />
                Kontaktieren Sie uns
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
