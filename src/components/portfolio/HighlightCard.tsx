"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface HighlightCardProps {
  mediaUrl: string | null | undefined;
  category: string;
  subtext: string;
  fallbackGradient: string;
}

export default function HighlightCard({
  mediaUrl,
  category,
  subtext,
  fallbackGradient,
}: HighlightCardProps) {
  const [inView, setInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0.15, // Trigger when 15% of the card is visible
      }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative h-[450px] overflow-hidden border border-gold-500/10 bg-black flex flex-col justify-between p-8"
    >
      {mediaUrl ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={mediaUrl}
            alt={`${category} Highlight`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
              inView
                ? "grayscale-0 md:grayscale md:group-hover:grayscale-0"
                : "grayscale md:grayscale-100"
            }`}
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 z-10 transition-opacity duration-500 group-hover:opacity-90" />
        </div>
      ) : (
        <div className={`absolute inset-0 ${fallbackGradient} z-0`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      {/* Accent golden bar */}
      <div className="w-8 h-[1px] bg-gold-500/30 group-hover:w-16 transition-all duration-500 relative z-10" />
      <div className="flex flex-col text-left space-y-2 relative z-10 mt-auto">
        <h4 className="font-serif text-2xl text-white tracking-wide uppercase">{category}</h4>
        <p className="text-[10px] tracking-[0.2em] text-gold-400 uppercase">{subtext}</p>
        <Link
          href="/gallery"
          className="text-[10px] tracking-[0.25em] text-white font-bold uppercase underline underline-offset-4 hover:text-gold-400 transition-colors pt-2"
        >
          VIEW GALLERY
        </Link>
      </div>
    </div>
  );
}
