"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MapPin, Heart, ArrowRight, Sparkles, Send } from "lucide-react";

const footerLinks = {
  product: {
    title: "Produkt",
    links: [
      { label: "Förderprogramme", href: "/foerderprogramme" },
      { label: "KI-Antragsassistent", href: "/ki-antragsassistent" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Preise", href: "/preise" }
    ]
  },
  resources: {
    title: "Ressourcen",
    links: [
      { label: "So funktioniert's", href: "/wie-es-funktioniert" },
      { label: "Hilfe-Center", href: "/hilfe" },
      { label: "Blog", href: "/blog" },
      { label: "Erfolgsgeschichten", href: "/erfolgsgeschichten" }
    ]
  },
  company: {
    title: "Unternehmen",
    links: [
      { label: "Über uns", href: "/ueber-uns" },
      { label: "Karriere", href: "/karriere" },
      { label: "Presse", href: "/presse" },
      { label: "Kontakt", href: "/kontakt" }
    ]
  },
  legal: {
    title: "Rechtliches",
    links: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB", href: "/agb" }
    ]
  }
};

const stats = [
  { value: "40+", label: "Förderprogramme" },
  { value: "500+", label: "Schulen" },
  { value: "90%", label: "Erfolgsquote" },
  { value: "24h", label: "Support" }
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      {/* Stats Bar */}
      <div className="relative border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient group-hover:scale-105 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2"
          >
            <Link href="/" className="inline-block mb-6 group">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-shadow">
                  <span className="text-xl font-bold text-white">€</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-slate-100">EduFunds</span>
                  <span className="text-xs text-slate-400 -mt-1">Schulförderung</span>
                </div>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Die intelligente Plattform für Schulförderung. Finden Sie passende Programme und erstellen Sie erfolgreiche Anträge mit KI-Unterstützung.
            </p>
            <div className="space-y-3 mb-6">
              <a href="mailto:office@aitema.de" className="flex items-center gap-3 text-sm text-slate-400 hover:text-orange-400 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                office@aitema.de
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                Berlin, Deutschland
              </div>
            </div>
            <div className="flex gap-3">
              {["twitter", "linkedin", "github"].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com/edufunds`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social}
                  className="w-10 h-10 rounded-xl glass hover:bg-orange-500/20 hover:border-orange-500/30 border border-slate-700/50 flex items-center justify-center transition-all duration-300"
                >
                  <span className="text-slate-400 hover:text-orange-400 text-xs font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + sectionIndex * 0.1 }}
            >
              <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1 group"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative py-10 px-8 rounded-3xl glass-strong mb-10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4"
            >
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Bleiben Sie informiert</span>
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-100 mb-3">Newsletter abonnieren</h3>
            <p className="text-slate-400 mb-6">Erhalten Sie wöchentlich Updates zu neuen Förderprogrammen, Tipps für erfolgreiche Anträge und exklusive Einblicke.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="ihre@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl btn-primary flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <Send className="h-4 w-4" />
                {subscribed ? "Abonniert!" : "Abonnieren"}
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4">Kein Spam, jederzeit abmeldbar. Wir respektieren Ihre Privatsphäre.</p>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-800/50 text-sm text-slate-500"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>© {currentYear} EduFunds.</span>
            <span>Ein Projekt der</span>
            <a href="https://aitema.de" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">AITEMA GmbH</a>
          </div>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            <span>in Berlin</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
