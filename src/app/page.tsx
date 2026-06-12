import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Force cache validation check at most once every 60 seconds

const stats = [
  { label: "HEIGHT", value: "—" },
  { label: "BUST", value: "—" },
  { label: "WAIST", value: "—" },
  { label: "HIPS", value: "—" },
  { label: "EYES", value: "—" },
  { label: "HAIR", value: "—" },
  { label: "SHOES", value: "—" },
];

async function getHeroImage(): Promise<string | null> {
  if (!supabase) {
    console.warn("Supabase client not initialized.");
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from("media")
      .list("hero", {
        limit: 10,
        sortBy: { column: "name", order: "asc" }
      });

    if (error) {
      console.error("Supabase Storage error listing media/hero:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Filter to find the first file with an image extension
    const imageExtensions = [".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".heic", ".tiff"];
    const firstImageFile = data.find(file => {
      const lowerName = file.name.toLowerCase();
      return imageExtensions.some(ext => lowerName.endsWith(ext));
    });

    if (!firstImageFile) {
      return null;
    }

    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(`hero/${firstImageFile.name}`);

    return publicUrl;
  } catch (err) {
    console.error("Failed to retrieve hero image from Supabase:", err);
    return null;
  }
}

export default async function Home() {
  const heroImageUrl = await getHeroImage();

  return (
    <div className="relative w-full">
      {/* 1. Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt="Tripti Maakan Portrait Background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              quality={95}
            />
          ) : (
            // Premium luxury black-gold radial backdrop when no image is uploaded
            <div className="w-full h-full bg-black bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_60%)]" />
          )}
          {/* Dark luxury gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/35 z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl space-y-6">
          <p className="text-xs md:text-sm tracking-[0.4em] text-gold-400 font-semibold uppercase animate-fade-in">
            ELEGANCE • CONFIDENCE • PRESENCE
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-[0.15em] uppercase leading-tight font-light animate-fade-in-up">
            TRIPTI <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 font-normal">MAAKAN</span>
          </h1>
          <p className="text-xs md:text-sm tracking-[0.25em] text-luxury-white-muted uppercase max-w-2xl mx-auto leading-relaxed font-light">
            Grace, Confidence and Timeless Presence Captured Through Fashion, Editorial and Creative Storytelling
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
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
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-luxury-white-muted/60 text-[10px] tracking-[0.3em] uppercase animate-pulse z-20">
          <span>SCROLL</span>
          <div className="w-[1px] h-12 bg-gold-500/50" />
        </div>
      </section>

      {/* 2. Measurements & About Section */}
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
              Tripti Maakan is a model specializing in fashion, runway, editorial, and beauty campaigns. Her professional bio and portfolio updates will be available soon.
            </p>
            <p className="text-sm text-luxury-white-muted leading-relaxed font-light">
              Through editorial concepts, style showcases, and collaborative projects, Tripti works to build a visual presence that celebrates individuality, modern aesthetics, and visual storytelling.
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
            <div className="group relative h-[450px] overflow-hidden border border-gold-500/10 bg-gradient-to-br from-luxury-gray-900 to-black flex flex-col justify-between p-8">
              {/* Radial glow effect on hover */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Accent golden bar */}
              <div className="w-8 h-[1px] bg-gold-500/30 group-hover:w-16 transition-all duration-500 relative z-10" />
              <div className="flex flex-col text-left space-y-2 relative z-10 mt-auto">
                <h4 className="font-serif text-2xl text-white tracking-wide uppercase">EDITORIAL</h4>
                <p className="text-[10px] tracking-[0.2em] text-gold-400 uppercase">High-Fashion Concept & Editorial Photography</p>
                <Link href="/gallery" className="text-[10px] tracking-[0.25em] text-white font-bold uppercase underline underline-offset-4 hover:text-gold-400 transition-colors pt-2">
                  VIEW GALLERY
                </Link>
              </div>
            </div>

            {/* Division 2 */}
            <div className="group relative h-[450px] overflow-hidden border border-gold-500/10 bg-gradient-to-br from-luxury-gray-900 to-black flex flex-col justify-between p-8">
              {/* Radial glow effect on hover */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Accent golden bar */}
              <div className="w-8 h-[1px] bg-gold-500/30 group-hover:w-16 transition-all duration-500 relative z-10" />
              <div className="flex flex-col text-left space-y-2 relative z-10 mt-auto">
                <h4 className="font-serif text-2xl text-white tracking-wide uppercase">RUNWAY</h4>
                <p className="text-[10px] tracking-[0.2em] text-gold-400 uppercase">Catwalk, Designer Showcases & Runway Presentation</p>
                <Link href="/gallery" className="text-[10px] tracking-[0.25em] text-white font-bold uppercase underline underline-offset-4 hover:text-gold-400 transition-colors pt-2">
                  VIEW GALLERY
                </Link>
              </div>
            </div>

            {/* Division 3 */}
            <div className="group relative h-[450px] overflow-hidden border border-gold-500/10 bg-gradient-to-br from-luxury-gray-900 to-black flex flex-col justify-between p-8">
              {/* Radial glow effect on hover */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Accent golden bar */}
              <div className="w-8 h-[1px] bg-gold-500/30 group-hover:w-16 transition-all duration-500 relative z-10" />
              <div className="flex flex-col text-left space-y-2 relative z-10 mt-auto">
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
