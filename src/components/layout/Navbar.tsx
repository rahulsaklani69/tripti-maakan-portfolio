"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "PORTFOLIO", href: "/gallery" },
  { name: "GALLERY", href: "/videos" },
  { name: "JOURNAL", href: "/journal" },
  { name: "ABOUT", href: "/#about" },
  { name: "CONTACT", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Change background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when page changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md py-4 border-b border-gold-500/20"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* Branding Logo */}
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl tracking-[0.25em] text-white hover:text-gold-400 transition-colors duration-300"
        >
          T R I P T I
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.2em] font-medium transition-all duration-300 relative py-1 hover:text-white ${
                  isActive ? "text-gold-400" : "text-luxury-white-muted"
                }`}
              >
                {link.name}
                {/* Gold underline indicator */}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[1px] bg-gold-500 origin-left transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  } hover:scale-x-100`}
                />
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white focus:outline-none p-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6 text-gold-400" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 top-[73px] bg-black/95 backdrop-blur-xl z-40 md:hidden flex flex-col items-center justify-center space-y-8 transition-all duration-500 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg tracking-[0.25em] font-serif transition-colors duration-300 ${
                isActive ? "text-gold-400 font-medium" : "text-luxury-white-muted"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
