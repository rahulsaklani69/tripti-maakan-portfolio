import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import HighlightCard from "@/components/portfolio/HighlightCard";

export const revalidate = 60; // Force cache validation check at most once every 60 seconds

async function getModelDetails(): Promise<any | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("model_details")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Failed to fetch model details:", err);
    return null;
  }
}

// cm to inches conversion: round(cm / 2.54)
function formatMeasurement(cm: number | null | undefined): string {
  if (cm === null || cm === undefined || isNaN(Number(cm))) return "—";
  const inches = Math.round(Number(cm) / 2.54);
  return `${cm} cm / ${inches}"`;
}

// height cm to feet/inches conversion
function formatHeight(cm: number | null | undefined): string {
  if (cm === null || cm === undefined || isNaN(Number(cm))) return "—";
  const totalInches = Math.round(Number(cm) / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${cm} cm / ${feet}'${inches}"`;
}

async function getSiteMedia(): Promise<Record<string, string>> {
  if (!supabase) return {};
  try {
    const { data, error } = await supabase
      .from("site_media")
      .select("media_key, image_url")
      .in("media_key", ["hero", "editorial", "runway", "beauty"]);

    if (error) throw error;

    const mediaMap: Record<string, string> = {};
    data?.forEach((item: any) => {
      mediaMap[item.media_key] = item.image_url;
    });
    return mediaMap;
  } catch (err) {
    console.error("Failed to fetch site media:", err);
    return {};
  }
}

export default async function Home() {
  const mediaMap = await getSiteMedia();
  const details = await getModelDetails();

  const stats = [
    { label: "HEIGHT", value: details ? formatHeight(details.height_cm) : "—" },
    { label: "BUST", value: details ? formatMeasurement(details.bust_cm) : "—" },
    { label: "WAIST", value: details ? formatMeasurement(details.waist_cm) : "—" },
    { label: "HIPS", value: details ? formatMeasurement(details.hips_cm) : "—" },
    { label: "EYES", value: details?.eye_color || "—" },
    { label: "HAIR", value: details?.hair_color || "—" },
    { label: "SHOES", value: details?.shoe_size || "—" },
  ];

  return (
    <div className="relative w-full">
      {/* 1. Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {mediaMap.hero ? (
            <Image
              src={mediaMap.hero}
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
            FASHION • BEAUTY • COMMERCIAL MODEL
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white tracking-[0.15em] uppercase leading-tight font-light animate-fade-in-up">
            TRIPTI <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 font-normal">MAAKAN</span>
          </h1>
          <p className="text-xs md:text-sm tracking-[0.25em] text-luxury-white-muted uppercase max-w-3xl mx-auto leading-relaxed font-light animate-fade-in">
            Based in Haridwar | Available for Runway, Editorial and Brand Campaigns
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
              Tripti Maakan is a fashion and commercial model based in Haridwar, actively building a versatile portfolio across runway, beauty, lifestyle, jewellery, and commercial modelling. She has participated in runway events and collaborated on professional jewellery and portfolio shoots, developing a strong understanding of posing, expression, and camera presence.
            </p>
            <p className="text-sm text-luxury-white-muted leading-relaxed font-light">
              Known for her professionalism, adaptability, and attention to detail, Tripti approaches every project with dedication and enthusiasm. Her portfolio reflects a balance of elegance, confidence, and contemporary style, making her suitable for fashion campaigns, editorial concepts, jewellery promotions, lifestyle branding, e-commerce projects, and creative collaborations.
            </p>
            <p className="text-sm text-luxury-white-muted leading-relaxed font-light">
              She is available for assignments, photoshoots, campaigns, and brand partnerships across Uttarakhand, Delhi NCR, Noida, Rajasthan, West Uttar Pradesh, Himachal Pradesh, and other locations throughout North India.
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
            {details?.updated_at && (
              <div className="text-[9px] text-luxury-white-muted/40 tracking-widest text-center mt-6 uppercase">
                Last Updated: {new Date(details.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
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
            
            {/* Division 1 - Commercial */}
            <HighlightCard
              mediaUrl={mediaMap.editorial}
              category="COMMERCIAL"
              subtext="Commercial Campaigns & Lifestyle Branding"
              fallbackGradient="bg-gradient-to-br from-luxury-gray-900 to-black"
            />

            {/* Division 2 - Runway */}
            <HighlightCard
              mediaUrl={mediaMap.runway}
              category="RUNWAY"
              subtext="Catwalk, Designer Showcases & Runway Presentation"
              fallbackGradient="bg-gradient-to-br from-luxury-gray-900 to-black"
            />

            {/* Division 3 - Beauty */}
            <HighlightCard
              mediaUrl={mediaMap.beauty}
              category="BEAUTY"
              subtext="Cosmetic Campaigns, Portrait & Close-Up Editorial"
              fallbackGradient="bg-gradient-to-br from-luxury-gray-900 to-black"
            />

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
