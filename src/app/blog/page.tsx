"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Loader2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "Behind the Scenes at Paris Fashion Week",
    slug: "behind-scenes-paris-fashion-week",
    excerpt: "A look at the chaotic elegance behind the runway, from quick beauty changes to final walk lineups.",
    cover_image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    published: true,
    published_at: "2026-06-10T12:00:00Z",
    created_at: "2026-06-10T12:00:00Z",
  },
  {
    id: "post-2",
    title: "Editorial Photography: Translating Art into Motion",
    slug: "editorial-photography-motion",
    excerpt: "Exploring how dynamic posing, lighting, and geometric posture shape Vogue editorial campaigns.",
    cover_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    published: true,
    published_at: "2026-05-25T14:30:00Z",
    created_at: "2026-05-25T14:30:00Z",
  },
  {
    id: "post-3",
    title: "Skincare and Hydration: A Model's Travel Survival Kit",
    slug: "skincare-travel-survival-kit",
    excerpt: "My essential travel routines, clean skincare favorites, and hydration habits during busy fashion weeks.",
    cover_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    published: true,
    published_at: "2026-04-12T09:15:00Z",
    created_at: "2026-04-12T09:15:00Z",
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      if (!supabase) {
        setPosts(MOCK_POSTS);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, cover_image, published, published_at, created_at")
          .eq("published", true)
          .order("published_at", { ascending: false });

        if (error) throw error;

        if (data) {
          // Generate excerpts client-side or maps them
          const mapped: BlogPost[] = data.map((item) => ({
            ...item,
            excerpt: "A personal entry detailing runway experiences, style portfolios, and modeling journals.",
          }));
          setPosts(mapped);
        }
      } catch (err) {
        console.error("Supabase fetch failed, fallback to mock posts:", err);
        setPosts(MOCK_POSTS);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="pt-28 pb-24 px-6 lg:px-12 bg-black min-h-screen">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] tracking-[0.4em] text-gold-500 font-semibold uppercase">
            THE MODEL'S JOURNAL
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-wider">
            JOURNEY
          </h1>
          <div className="w-16 h-[1px] bg-gold-500 mx-auto mt-4" />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gold-500 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs tracking-widest text-luxury-white-muted uppercase">LOADING ENTRIES...</span>
          </div>
        ) : (
          /* Blog Feed */
          <div className="space-y-16 pt-6">
            {posts.map((post) => {
              const formattedDate = post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Draft";

              return (
                <article
                  key={post.id}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-luxury-gray-800 pb-16 last:border-0"
                >
                  {/* Left Cover Image */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="md:col-span-5 relative aspect-[16/10] overflow-hidden bg-luxury-gray-900 border border-gold-500/5"
                  >
                    {post.cover_image && (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                  </Link>

                  {/* Right Post Info */}
                  <div className="md:col-span-7 space-y-4">
                    <span className="text-[10px] tracking-widest text-gold-400 font-semibold uppercase">
                      {formattedDate}
                    </span>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-wide group-hover:text-gold-400 transition-colors duration-300">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-xs md:text-sm text-luxury-white-muted leading-relaxed font-light">
                      {post.excerpt}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-xs tracking-widest font-semibold text-gold-500 hover:text-white uppercase group/btn transition-colors"
                      >
                        READ ARTICLE{" "}
                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 text-luxury-white-muted">
            <p className="text-xs tracking-widest uppercase">No journal entries published.</p>
          </div>
        )}
      </div>
    </div>
  );
}
