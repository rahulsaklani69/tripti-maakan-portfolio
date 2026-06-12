import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stats = [
  { label: "HEIGHT", value: "175 CM / 5'9\"" },
  { label: "BUST", value: "82 CM / 32\"" },
  { label: "WAIST", value: "60 CM / 24\"" },
  { label: "HIPS", value: "88 CM / 34.5\"" },
  { label: "EYES", value: "DARK BROWN" },
  { label: "HAIR", value: "BLACK" },
  { label: "SHOES", value: "38 EU / 7 US" },
];

export default function Home() {
  return (
    <div className="relative w-full">
      {/* 1. Hero Section (Split-Screen Layout) */}
      <section className="relative min-h-screen md:h-screen w-full bg-black grid grid-cols-1 md:grid-cols-12 border-b border-gold-500/10 overflow-hidden pt-20 md:pt-0">
        
        {/* Left Side: Portrait Image Column */}
        <div className="md:col-span-5 h-full w-full flex items-center justify-center p-6 md:p-12 bg-black relative border-b md:border-b-0 md:border-r border-gold-500/10">
          <div className="absolute inset-0 bg-radial-gradient from-gold-500/5 to-transparent pointer-events-none" />
          <div className="relative w-full max-w-[420px] aspect-[3/4.5] md:h-[80%] border border-gold-500/20 p-2 bg-luxury-gray-900/50 backdrop-blur-sm group hover:border-gold-500/50 transition-colors duration-500">
            {/* Elegant corner brackets */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-gold-500" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-gold-500" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-gold-500" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-gold-500" />
            
            <div className="relative w-full h-full overflow-hidden bg-black">
              <Image
                src="https://eqtpxvapqaitotcdyqbg.supabase.co/storage/v1/object/public/media/hero_image.webp"
                alt="Tripti Maakan Portrait"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Side: Content Column */}
        <div className="md:col-span-7 h-full w-full flex flex-col justify-center p-8 md:p-16 lg:p-24 relative bg-black space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <p className="text-xs md:text-sm tracking-[0.4em] text-gold-400 font-semibold uppercase animate-fade-in">
              ELEGANCE • CONFIDENCE • PRESENCE
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-[0.1em] uppercase leading-tight font-light">
              TRIPTI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 font-normal">MAAKAN</span>
            </h1>
            <div className="w-24 h-[1px] bg-gold-500 mt-2" />
          </div>

          <p className="text-sm md:text-base tracking-[0.15em] text-luxury-white-muted uppercase max-w-xl leading-relaxed font-light">
            Grace, Confidence and Timeless Presence Captured Through Fashion, Editorial and Creative Storytelling.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link href="/gallery" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-8 py-4 text-xs tracking-widest font-bold">
                VIEW PORTFOLIO
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-4 text-xs tracking-widest font-bold">
                GET IN TOUCH
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 right-12 hidden md:flex flex-col items-center gap-2 text-luxury-white-muted/40 text-[9px] tracking-[0.3em] uppercase animate-pulse">
          <span>SCROLL</span>
          <div className="w-[1px] h-10 bg-gold-500/30" />
        </div>
      </section>

      {/* 2. Measurements / Metrics & About Section */}
      <section id="about" className="bg-luxury-black py-24 px-6 lg:px-12 border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: About Text */}
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] text-gold-500 font-semibold uppercase">
              ABOUT ME
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-white uppercase leading-tight">
              A Story of Confidence <br />and Expression
            </h2>
            <div className="w-20 h-[1px] bg-gold-500" />
            <p className="text-sm text-luxury-white-muted leading-relaxed font-light">
              Tripti Maakan is an aspiring model with a natural passion for fashion, elegance, and creative expression. Her work reflects confidence, versatility, and a modern aesthetic, bringing authenticity to every frame.
            </p>
            <p className="text-sm text-luxury-white-muted leading-relaxed font-light">
              Through editorial concepts, lifestyle campaigns, and collaborative creative projects, Tripti continues to build a portfolio that celebrates individuality, style, and visual storytelling.
            </p>
            <div className="pt-4">
              <Link href="/contact" className="inline-flex items-center text-xs tracking-[0.2em] font-semibold text-gold-500 hover:text-white uppercase transition-colors group">
                Get In Touch <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: Measurements Table */}
          <div className="bg-luxury-gray-900 border border-gold-500/10 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl" />
            <h3 className="font-serif text-white tracking-widest text-lg uppercase mb-8 pb-3 border-b border-gold-500/10 text-center">
              MODEL DETAILS
            </h3>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-luxury-gray-800 last:border-0 text-xs">
                  <span className="tracking-[0.2em] text-luxury-white-muted font-medium uppercase">{stat.label}</span>
                  <span className="tracking-[0.1em] text-white font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. Featured Categories (Visual Previews) */}
      <section className="bg-black py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-xs tracking-[0.3em] text-gold-500 font-semibold uppercase">
              VISUAL PORTFOLIO
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-white uppercase">
              PORTFOLIO HIGHLIGHTS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Division 1 */}
            <div className="group relative h-[450px] overflow-hidden border border-gold-500/10">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent transition-opacity duration-300" />
              <div className="absolute bottom-8 left-8 right-8 flex flex-col justify-end text-left space-y-2">
                <h4 className="font-serif text-2xl text-white tracking-wide uppercase">EDITORIAL</h4>
                <p className="text-[10px] tracking-[0.2em] text-gold-400 uppercase">High-Fashion Concept & Editorial Photography</p>
                <Link href="/gallery" className="text-[10px] tracking-[0.25em] text-white font-bold uppercase underline underline-offset-4 hover:text-gold-400 transition-colors pt-2">
                  VIEW GALLERY
                </Link>
              </div>
            </div>

            {/* Division 2 */}
            <div className="group relative h-[450px] overflow-hidden border border-gold-500/10">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent transition-opacity duration-300" />
              <div className="absolute bottom-8 left-8 right-8 flex flex-col justify-end text-left space-y-2">
                <h4 className="font-serif text-2xl text-white tracking-wide uppercase">RUNWAY</h4>
                <p className="text-[10px] tracking-[0.2em] text-gold-400 uppercase">Catwalk, Designer Showcases & Runway Presentation</p>
                <Link href="/gallery" className="text-[10px] tracking-[0.25em] text-white font-bold uppercase underline underline-offset-4 hover:text-gold-400 transition-colors pt-2">
                  VIEW GALLERY
                </Link>
              </div>
            </div>

            {/* Division 3 */}
            <div className="group relative h-[450px] overflow-hidden border border-gold-500/10">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent transition-opacity duration-300" />
              <div className="absolute bottom-8 left-8 right-8 flex flex-col justify-end text-left space-y-2">
                <h4 className="font-serif text-2xl text-white tracking-wide uppercase">BEAUTY</h4>
                <p className="text-[10px] tracking-[0.2em] text-gold-400 uppercase">Cosmetic Campaigns, Portrait & Close-Up Editorial</p>
                <Link href="/gallery" className="text-[10px] tracking-[0.25em] text-white font-bold uppercase underline underline-offset-4 hover:text-gold-400 transition-colors pt-2">
                  VIEW GALLERY
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Creative Journey Section */}
      <section id="journey" className="bg-luxury-gray-900 py-24 px-6 lg:px-12 border-t border-gold-500/10">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
          
          <div className="space-y-3 relative z-10">
            <p className="text-xs tracking-[0.3em] text-gold-500 font-semibold uppercase">
              EXPLORING ART & REFLECTIONS
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-white uppercase tracking-wider">
              CREATIVE JOURNEY
            </h2>
            <div className="w-16 h-[1px] bg-gold-500 mx-auto mt-4" />
          </div>

          <p className="text-sm md:text-base text-luxury-white-muted leading-relaxed font-light max-w-2xl mx-auto relative z-10">
            Modeling is more than presentation—it is a study of form, character, and visual storytelling. Tripti documents behind-the-scenes insights, styling reflections, and artistic milestones in her personal journal, sharing the evolution of her craft.
          </p>

          <div className="pt-6 relative z-10">
            <Link href="/journal">
              <Button variant="outline" className="border-gold-500/30 hover:border-gold-500 text-gold-400 hover:text-white px-8 py-6">
                EXPLORE THE JOURNAL
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
