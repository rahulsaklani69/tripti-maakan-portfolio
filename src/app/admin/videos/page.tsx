"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Video, ImageIcon } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string;
  order_index: number;
}

const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "v-1",
    title: "Paris Haute Couture Runway Highlights",
    description: "Featured runway clips from Autumn/Winter Fashion Week.",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-makeup-40178-large.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    order_index: 1,
  },
];

export default function AdminVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch videos list
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      if (!supabase) {
        setVideos(MOCK_VIDEOS);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setVideos(data as VideoItem[]);
        } else {
          setVideos([]); // Set to empty array if live DB is connected but empty
        }
      } catch (err) {
        console.error("Supabase fetch failed, using mock:", err);
        setVideos(MOCK_VIDEOS);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Upload handles
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!title) {
      setErrorMsg("Video title is required.");
      setUploading(false);
      return;
    }

    if (!supabase) {
      // Mock mode simulation
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const newVideo: VideoItem = {
        id: `mock-v-${Date.now()}`,
        title,
        description: description || null,
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-studio-setting-42240-large.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        order_index: videos.length + 1,
      };

      setVideos((prev) => [...prev, newVideo]);
      setSuccessMsg("Video uploaded successfully (Simulated!).");
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setUploading(false);
      return;
    }

    // Live mode upload
    if (!videoFile) {
      setErrorMsg("Please select a video file (.mp4, .webm, etc.) to upload.");
      setUploading(false);
      return;
    }

    try {
      // 1. Upload Video File
      const videoExt = videoFile.name.split(".").pop();
      const videoName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${videoExt}`;
      const videoPath = `videos/${videoName}`;

      const { error: videoUploadError } = await supabase.storage
        .from("media")
        .upload(videoPath, videoFile);

      if (videoUploadError) throw videoUploadError;

      const { data: { publicUrl: finalVideoUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(videoPath);

      // 2. Upload Thumbnail File (or fallback to placeholder)
      let finalThumbnailUrl = "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80";

      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split(".").pop();
        const thumbName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${thumbExt}`;
        const thumbPath = `thumbnails/${thumbName}`;

        const { error: thumbUploadError } = await supabase.storage
          .from("media")
          .upload(thumbPath, thumbnailFile);

        if (thumbUploadError) throw thumbUploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(thumbPath);

        finalThumbnailUrl = publicUrl;
      }

      // 3. Write row to videos table
      const { data, error: insertError } = await supabase
        .from("videos")
        .insert([
          {
            title,
            description: description || null,
            video_url: finalVideoUrl,
            thumbnail_url: finalThumbnailUrl,
            order_index: videos.length + 1,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setVideos((prev) => [...prev, data]);
      }

      setSuccessMsg("Video campaign added successfully.");
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);

      // Reset file elements
      const vidInput = document.getElementById("video-input") as HTMLInputElement;
      if (vidInput) vidInput.value = "";
      const thumbInput = document.getElementById("thumb-input") as HTMLInputElement;
      if (thumbInput) thumbInput.value = "";
    } catch (err: any) {
      console.error("Video upload failed:", err);
      setErrorMsg(err.message || "Failed to upload video. Ensure your Storage bucket 'media' exists.");
    } finally {
      setUploading(false);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string, videoUrl: string, thumbnailUrl: string) => {
    if (!confirm("Are you sure you want to delete this video reel permanently?")) return;

    try {
      if (supabase) {
        // 1. Delete Video File from Storage
        if (videoUrl.includes("/storage/v1/object/public/media/")) {
          const videoPath = videoUrl.split("/storage/v1/object/public/media/").pop();
          if (videoPath) {
            await supabase.storage.from("media").remove([videoPath]);
          }
        }

        // 2. Delete Thumbnail File from Storage if it's not the default
        if (thumbnailUrl.includes("/storage/v1/object/public/media/")) {
          const thumbPath = thumbnailUrl.split("/storage/v1/object/public/media/").pop();
          if (thumbPath) {
            await supabase.storage.from("media").remove([thumbPath]);
          }
        }

        // 3. Delete row from table
        const { error } = await supabase.from("videos").delete().eq("id", id);
        if (error) throw error;
      }

      setVideos((prev) => prev.filter((v) => v.id !== id));
      setSuccessMsg("Video campaign deleted successfully.");
    } catch (err: any) {
      console.error("Deletion failed:", err);
      setErrorMsg(err.message || "Failed to delete video.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wider">
          VIDEO REELS MANAGER
        </h1>
        <p className="text-xs text-luxury-white-muted uppercase tracking-widest mt-1">
          Upload commercial clips and runway video reels
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Upload Form Column */}
        <form
          onSubmit={handleAddVideo}
          className="xl:col-span-5 bg-luxury-gray-900 border border-gold-500/10 p-6 md:p-8 space-y-6"
        >
          <h2 className="font-serif text-lg text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800">
            UPLOAD NEW VIDEO
          </h2>

          <Input
            label="VIDEO TITLE *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chanel Campaign Motion Reel"
            disabled={uploading}
            required
          />

          <Textarea
            label="VIDEO DESCRIPTION"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief details about client, casting director, or creative direction..."
            disabled={uploading}
            className="h-24"
          />

          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
              VIDEO FILE (.MP4, .WEBM) *
            </label>
            <div className="border border-dashed border-luxury-gray-800 hover:border-gold-500/50 p-6 text-center transition-colors cursor-pointer relative bg-black/35">
              <input
                id="video-input"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={uploading}
              />
              <Video className="h-8 w-8 mx-auto text-gold-500/40 mb-2" />
              <p className="text-xs text-white uppercase tracking-wider">
                {videoFile ? videoFile.name : "Select video from device"}
              </p>
              <p className="text-[10px] text-luxury-white-muted/50 mt-1 uppercase">
                MP4 Format recommended (Max 20MB)
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
              THUMBNAIL COVER (IMAGE FILE)
            </label>
            <input
              id="thumb-input"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 text-xs px-4 py-3 text-white outline-none"
              disabled={uploading}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wide">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-green-400 font-semibold uppercase tracking-wide">
              {successMsg}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> UPLOADING REEL...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> UPLOAD VIDEO
              </>
            )}
          </Button>
        </form>

        {/* Existing Videos Grid Column */}
        <div className="xl:col-span-7 bg-luxury-gray-900 border border-gold-500/10 p-6 space-y-4">
          <h2 className="font-serif text-lg text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800">
            CURRENT VIDEOS ({videos.length})
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gold-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-[10px] tracking-widest text-luxury-white-muted uppercase">
                LOADING VIDEOS...
              </span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 text-luxury-white-muted">
              <p className="text-xs tracking-widest uppercase">No video reels in list.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-black border border-luxury-gray-800 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={vid.thumbnail_url}
                      alt={vid.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteVideo(vid.id, vid.video_url, vid.thumbnail_url)}
                        className="p-3 bg-red-950/80 border border-red-900/50 rounded-full text-red-400 hover:text-white hover:bg-red-900 transition-colors cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-serif text-sm text-white uppercase tracking-wider truncate">
                      {vid.title}
                    </h3>
                    {vid.description && (
                      <p className="text-[10px] text-luxury-white-muted line-clamp-1">
                        {vid.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
