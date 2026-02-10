"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Sparkles,
  Search,
  LayoutDashboard,
  Info,
  CreditCard,
} from "lucide-react";

const navItems = [
  {
    href: "/foerderprogramme",
    label: "Förderprogramme",
    badge: "20+",
    icon: Search,
  },
  {
    href: "/preise",
    label: "Preise",
    icon: CreditCard,
  },
  {
    href: "/ueber-uns",
    label: "Über uns",
    icon: Info,
  },
  {
    href: "/kontakt",
    label: "Kontakt",
    icon: CreditCard,
  },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      // Calculate scroll progress
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-orange-500 focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Zum Hauptinhalt springen
      </a>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "glass-strong" : "glass"
        }`}
        role="banner"
      >
        <div className="container mx-auto flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2" aria-label="EduFunds - Zur Startseite">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-shadow">
              <span className="text-xl font-bold text-white">€</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-100">EduFunds</span>
              <span className="text-[10px] text-slate-400 -mt-1">Schulförderung</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1" role="navigation" aria-label="Hauptnavigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:text-orange-400 rounded-lg hover:bg-slate-800/50"
              >
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/20">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <Link
              href="/kontakt"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
            >
              Kontakt
            </Link>
            <Link
              href="/foerderprogramme"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Programme entdecken
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl glass hover:bg-slate-800/50 transition-colors"
            aria-label={isOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {isOpen ? <X className="w-5 h-5 text-slate-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
          </button>
        </div>

        {/* Scroll progress */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700/30">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 pt-16"
          >
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative container mx-auto px-4 py-6"
            >
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-slate-800/50 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-orange-400" />
                      <span className="text-slate-200">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="mt-6 space-y-3"
              >
                <Link
                  href="/kontakt"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center p-4 rounded-xl border border-slate-600 text-slate-300 hover:border-orange-500 hover:text-orange-400 transition-colors"
                >
                  Kontakt
                </Link>
                <Link
                  href="/foerderprogramme"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center p-4 rounded-xl btn-primary"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Programme entdecken
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
