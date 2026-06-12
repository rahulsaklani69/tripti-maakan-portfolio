"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Play, X, Loader2 } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;      // URL to mp4 video file
  thumbnail_url: string;  // Cover photo url
  order_index: number;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      if (!supabase) {
        setVideos([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (data) {
          setVideos(data);
        }
      } catch (err) {
        console.error("Supabase fetch failed:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="pt-28 pb-24 px-6 lg:px-12 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] tracking-[0.4em] text-gold-500 font-semibold uppercase">
            MOTION REELS & CAMPAIGNS
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-wider">
            VIDEOS
          </h1>
          <div className="w-16 h-[1px] bg-gold-500 mx-auto mt-4" />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gold-500 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs tracking-widest text-luxury-white-muted uppercase">LOADING CLIPS...</span>
          </div>
        ) : (
          /* Videos Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setActiveVideo(vid)}
                className="group relative bg-luxury-gray-900 border border-gold-500/5 overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <Image
                    src={vid.thumbnail_url}
                    alt={vid.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                    <div className="p-4 bg-black/50 border border-gold-500/30 rounded-full text-gold-400 group-hover:scale-110 group-hover:text-white group-hover:border-gold-500 transition-all duration-300">
                      <Play className="h-6 w-6 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Details Container */}
                <div className="p-6 space-y-2 flex-grow">
                  <h3 className="font-serif text-lg text-white uppercase tracking-wide group-hover:text-gold-400 transition-colors duration-300">
                    {vid.title}
                  </h3>
                  {vid.description && (
                    <p className="text-xs text-luxury-white-muted/80 leading-relaxed font-light line-clamp-2">
                      {vid.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-20 text-luxury-white-muted">
            <p className="text-xs tracking-widest uppercase">No video campaigns found.</p>
          </div>
        )}
      </div>

      {/* 5. Custom HTML5 Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 text-luxury-white-muted hover:text-white p-2 cursor-pointer z-50"
            aria-label="Close Video Player"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Video Container */}
          <div
            className="relative w-full max-w-4xl aspect-video bg-black border border-gold-500/20"
            onClick={(e) => e.stopPropagation()} // Stop modal close on clicking player
          >
            <video
              src={activeVideo.video_url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
            
            {/* Title overlay at the bottom */}
            <div className="absolute -bottom-16 left-0 right-0 text-center space-y-1">
              <h2 className="font-serif text-lg md:text-xl text-white uppercase tracking-wider">
                {activeVideo.title}
              </h2>
              {activeVideo.description && (
                <p className="text-xs text-luxury-white-muted uppercase tracking-widest">
                  {activeVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
