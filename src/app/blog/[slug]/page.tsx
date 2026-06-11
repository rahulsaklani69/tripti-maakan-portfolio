"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";
import { MOCK_POSTS } from "../page";

interface BlogPostDetails {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  published_at: string | null;
}

const MOCK_CONTENTS: Record<string, string> = {
  "behind-scenes-paris-fashion-week": `The energy backstage at Paris Fashion Week is unlike anything else in the world. For models, hair stylists, makeup artists, and designers, it is a culmination of months of intense preparation packed into a few hours of electric focus.

## The Morning Prep
The day begins at 5:00 AM. Arriving at the venue, the space is quiet but humming with anticipation. We check in, grab a quick espresso, and head straight to hair and makeup. Backstage prep is a highly coordinated dance. A stylist is working on your hair while a makeup artist is applying base layers, all while you are coordinating schedule details on your phone.

## The Chaos & Coordination
As the show hour approaches, the atmosphere shifts. Designers review lookbooks, seamstresses make final modifications to the garments, and casting directors walk us through the runway choreography. Every step is timed; every lighting change is synchronized.

### The Lineup
Five minutes before showtime, we stand in lineup order. The music starts—a deep, rhythmic bass echoing through the walls. Your heart beats in sync. You step out onto the runway under the bright spotlights, focusing on posture, pacing, and presence. For those sixty seconds on the walk, everything else fades away.`,

  "editorial-photography-motion": `High-fashion photography is more than just posing; it is a collaborative art form that uses movement, geometry, and negative space to tell a designer's story.

## The Concept of Motion
Unlike commercial headshots, editorial fashion photography values narrative and abstract shapes over traditional portraiture. In a recent shoot, the creative director wanted to explore "kinetic architecture." This meant using clothing as extensions of the surrounding physical structures.

## Working with Light & Shadows
As a model, understanding light is crucial. You must feel where the key light is coming from and know how to angle your face and body to catch or block it. Small changes—tilting the chin by two degrees, stretching a hand, or twisting the shoulders—can transform a simple photo into a striking piece of art.`,

  "skincare-travel-survival-kit": `Travelling constantly for fashion shoots and runway events can take a heavy toll on skin and wellness. Between dry airplane cabins, heavy backstage makeup, and lack of sleep, maintaining a healthy glow requires a dedicated and consistent routine.

## Hydration is Key
My absolute rule is hydration. Before boarding a flight, I remove all makeup and apply a thick layer of hyaluronic acid serum followed by a rich barrier cream. I also drink at least two liters of water during long-haul flights.

## Post-Show Detox
After a runway show, the priority is double cleansing. Backstage makeup is thick and designed to look good under bright lights, which means it can easily clog pores. I use an oil-based cleanser first to break down the makeup, followed by a gentle foaming cleanser.`,
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap the params promise using React.use()
  const { slug } = use(params);

  const [post, setPost] = useState<BlogPostDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPostDetails() {
      setLoading(true);
      if (!supabase) {
        loadMockPost();
        return;
      }

      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, content, cover_image, published_at")
          .eq("slug", slug)
          .single();

        if (error) throw error;

        if (data) {
          setPost(data);
        } else {
          loadMockPost();
        }
      } catch (err) {
        console.error("Supabase fetch failed, loading mock post:", err);
        loadMockPost();
      } finally {
        setLoading(false);
      }
    }

    function loadMockPost() {
      const parent = MOCK_POSTS.find((p) => p.slug === slug);
      if (parent) {
        setPost({
          id: parent.id,
          title: parent.title,
          slug: parent.slug,
          content: MOCK_CONTENTS[slug] || "Article content details.",
          cover_image: parent.cover_image,
          published_at: parent.published_at,
        });
      } else {
        setPost(null);
      }
      setLoading(false);
    }

    fetchPostDetails();
  }, [slug]);

  // Simple Markdown to HTML elements renderer
  const renderContent = (content: string) => {
    return content.split("\n\n").map((block, index) => {
      if (block.startsWith("### ")) {
        return (
          <h4
            key={index}
            className="text-lg md:text-xl font-serif text-white uppercase tracking-wider mt-8 mb-4 font-semibold"
          >
            {block.replace("### ", "")}
          </h4>
        );
      }
      if (block.startsWith("## ")) {
        return (
          <h3
            key={index}
            className="text-xl md:text-2xl font-serif text-white uppercase tracking-wider mt-10 mb-4 font-semibold border-b border-gold-500/10 pb-2"
          >
            {block.replace("## ", "")}
          </h3>
        );
      }
      if (block.startsWith("# ")) {
        return (
          <h2
            key={index}
            className="text-2xl md:text-3xl font-serif text-white uppercase tracking-wider mt-12 mb-6 font-semibold"
          >
            {block.replace("# ", "")}
          </h2>
        );
      }
      return (
        <p
          key={index}
          className="text-sm md:text-base text-luxury-white-muted leading-relaxed font-light mb-6 text-justify"
        >
          {block}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gold-500 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xs tracking-widest text-luxury-white-muted uppercase">LOADING ARTICLE...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6 text-center px-6 pt-24">
        <h1 className="font-serif text-4xl text-white uppercase tracking-widest">ARTICLE NOT FOUND</h1>
        <p className="text-sm text-luxury-white-muted uppercase tracking-wider">
          The article you are looking for does not exist or has been deleted.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center text-xs tracking-widest font-semibold text-gold-500 hover:text-white uppercase border border-gold-500/30 hover:border-gold-500 px-6 py-3 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO JOURNAL
        </Link>
      </div>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Draft";

  return (
    <div className="pt-28 pb-24 px-6 lg:px-12 bg-black min-h-screen">
      <article className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-xs tracking-widest font-semibold text-luxury-white-muted hover:text-gold-400 uppercase transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO JOURNAL
        </Link>

        {/* Post Metadata */}
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-serif text-white uppercase tracking-wide leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-luxury-white-muted/70 uppercase tracking-widest pt-2">
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gold-500" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-gold-500" />
              BY TRIPTI MAAKAN
            </span>
          </div>
        </div>

        {/* Large Cover Image */}
        {post.cover_image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-gold-500/10">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
            />
          </div>
        )}

        {/* Markdown Rendered Content */}
        <div className="pt-4 font-sans">
          {renderContent(post.content)}
        </div>

      </article>
    </div>
  );
}
