"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

interface PortfolioItem {
  id: string;
  url: string;
  title: string | null;
  category: string;
  order_index: number;
}

// Curated high-resolution placeholder photos
const categories = ["ALL", "EDITORIAL", "RUNWAY", "COMMERCIAL", "BEAUTY"];

export default function GalleryPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch photos from Supabase
  useEffect(() => {
    async function fetchGallery() {
      setLoading(true);
      if (!supabase) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("portfolio_items")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (data) {
          setItems(data);
        }
      } catch (err) {
        console.error("Supabase fetch failed:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Filter items based on active tab
  const filteredItems =
    activeFilter === "ALL" ? items : items.filter((item) => item.category === activeFilter);

  // Handle lightbox navigation
  const openLightbox = (id: string) => {
    const index = filteredItems.findIndex((item) => item.id === id);
    if (index !== -1) setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev! - 1));
    }
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev! + 1));
    }
  };

  // Listen for keyboard arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev! - 1));
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev! + 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems]);

  return (
    <div className="pt-28 pb-24 px-6 lg:px-12 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] tracking-[0.4em] text-gold-500 font-semibold uppercase">
            VISUAL PORTFOLIO
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-wider">
            GALLERY
          </h1>
          <div className="w-16 h-[1px] bg-gold-500 mx-auto mt-4" />
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`text-[10px] tracking-[0.25em] font-semibold py-2 px-1 transition-all duration-300 border-b relative uppercase cursor-pointer ${
                activeFilter === cat
                  ? "text-gold-400 border-gold-500"
                  : "text-luxury-white-muted/60 border-transparent hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gold-500 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs tracking-widest text-luxury-white-muted uppercase">LOADING ASSETS...</span>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item.id)}
                className="group relative aspect-[2/3] overflow-hidden bg-luxury-gray-900 border border-gold-500/5 cursor-pointer"
              >
                {/* Image */}
                <Image
                  src={item.url}
                  alt={item.title || "Model Portfolio Photo"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  unoptimized
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left" />

                {/* Hover Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 space-y-1">
                  <span className="text-[9px] tracking-[0.2em] text-gold-400 font-bold uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-base text-white uppercase tracking-wide truncate">
                    {item.title || "Editorial Shoot"}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20 text-luxury-white-muted">
            <p className="text-xs tracking-widest uppercase">No items found in this division.</p>
          </div>
        )}
      </div>

      {/* 5. Lightbox Slider Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-luxury-white-muted hover:text-white p-2 cursor-pointer z-50"
            aria-label="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={showPrev}
            className="absolute left-6 text-luxury-white-muted hover:text-white p-3 cursor-pointer z-50 bg-black/30 backdrop-blur-md rounded-full border border-luxury-gray-800"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Center Image Container */}
          <div
            className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Don't close when clicking image
          >
            <Image
              src={filteredItems[lightboxIndex].url}
              alt={filteredItems[lightboxIndex].title || "Full Screen Portfolio"}
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1200px"
              priority
              unoptimized
            />
          </div>

          {/* Right Arrow */}
          <button
            onClick={showNext}
            className="absolute right-6 text-luxury-white-muted hover:text-white p-3 cursor-pointer z-50 bg-black/30 backdrop-blur-md rounded-full border border-luxury-gray-800"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Caption */}
          <div
            className="absolute bottom-8 text-center space-y-1 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[9px] tracking-[0.25em] text-gold-400 font-bold uppercase">
              {filteredItems[lightboxIndex].category}
            </span>
            <h2 className="font-serif text-lg md:text-xl text-white uppercase tracking-wider">
              {filteredItems[lightboxIndex].title || "Untitled Editorial"}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
