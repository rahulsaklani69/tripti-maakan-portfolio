import Link from "next/link";
import { Instagram, Mail, Globe, ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-luxury-black border-t border-gold-500/10 py-16 px-6 lg:px-12 text-luxury-white-muted text-sm mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        
        {/* Branding Column */}
        <div className="md:col-span-2 space-y-4">
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.2em] text-white hover:text-gold-400 transition-colors"
          >
            T R I P T I
          </Link>
          <p className="max-w-sm text-xs leading-relaxed text-luxury-white-muted/80">
            A premium visual portfolio exhibiting editorials, runways, commercial video reels, and personal journal updates. Represented worldwide by premier agencies.
          </p>
        </div>

        {/* Agency / Representation Column */}
        <div className="space-y-4">
          <h3 className="font-serif text-white tracking-wider text-xs uppercase border-b border-gold-500/20 pb-2">
            REPRESENTATION
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <span className="text-white block font-medium">Luxe Models (London)</span>
              <span className="text-luxury-white-muted/70">booking@luxemodels.co.uk</span>
            </li>
            <li>
              <span className="text-white block font-medium">Apex Mgmt (New York)</span>
              <span className="text-luxury-white-muted/70">info@apexmgmt.com</span>
            </li>
          </ul>
        </div>

        {/* Socials & Admin Column */}
        <div className="space-y-4">
          <h3 className="font-serif text-white tracking-wider text-xs uppercase border-b border-gold-500/20 pb-2">
            CONNECT
          </h3>
          <div className="flex space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-luxury-gray-800 rounded-full border border-gold-500/10 text-white hover:text-gold-400 hover:border-gold-500/50 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="mailto:triptimaakan@gmail.com"
              className="p-2 bg-luxury-gray-800 rounded-full border border-gold-500/10 text-white hover:text-gold-400 hover:border-gold-500/50 transition-all duration-300"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <Link
              href="/login"
              className="p-2 bg-luxury-gray-800 rounded-full border border-gold-500/10 text-white hover:text-gold-400 hover:border-gold-500/50 transition-all duration-300"
              aria-label="Admin Login"
            >
              <Globe className="h-4 w-4" />
            </Link>
          </div>
          <div className="text-xs pt-2">
            <Link href="/login" className="hover:text-gold-400 transition-colors duration-300">
              Admin Portal
            </Link>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-luxury-gray-800 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest gap-4">
        <div>
          &copy; {new Date().getFullYear()} TRIPTI MAAKAN. ALL RIGHTS RESERVED.
        </div>
        <div className="flex gap-6">
          <Link href="/gallery" className="hover:text-gold-400 transition-colors">PORTFOLIO</Link>
          <Link href="/videos" className="hover:text-gold-400 transition-colors">GALLERY</Link>
          <Link href="/#about" className="hover:text-gold-400 transition-colors">ABOUT</Link>
          <Link href="/contact" className="hover:text-gold-400 transition-colors">CONTACT</Link>
        </div>
      </div>
    </footer>
  );
}
