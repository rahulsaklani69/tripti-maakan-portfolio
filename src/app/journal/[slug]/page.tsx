"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";

interface BlogPostDetails {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  published_at: string | null;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap the params promise using React.use()
  const { slug } = use(params);

  const [post, setPost] = useState<BlogPostDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPostDetails() {
      setLoading(true);
      if (!supabase) {
        setPost(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, content, cover_image, published_at")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (error) throw error;

        if (data) {
          setPost(data);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Supabase fetch failed:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPostDetails();
  }, [slug]);

  // Simple Markdown to HTML elements renderer
  const renderContent = (content: string) => {
    if (!content) return null;
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
          href="/journal"
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
          href="/journal"
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
              unoptimized
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
