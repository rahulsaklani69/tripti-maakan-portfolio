"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Upload, Trash2, Image as ImageIcon, Loader2, Sparkles, Globe, ShieldAlert, Lock } from "lucide-react";

interface MediaItem {
  id: string;
  media_key: string;
  title: string | null;
  image_url: string;
}

export default function SiteMediaManager() {
  const [media, setMedia] = useState<Record<string, MediaItem>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch current site media records on mount
  useEffect(() => {
    async function fetchSiteMedia() {
      setLoading(true);
      setErrorMsg("");
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("site_media")
          .select("*");

        if (error) throw error;

        if (data) {
          const mediaMap: Record<string, MediaItem> = {};
          data.forEach((item: MediaItem) => {
            mediaMap[item.media_key] = item;
          });
          setMedia(mediaMap);
        }
      } catch (err: any) {
        console.error("Error fetching site media:", err);
        setErrorMsg("Failed to load site media. Please verify database tables.");
      } finally {
        setLoading(false);
      }
    }

    fetchSiteMedia();
  }, []);

  // File Validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, PNG, and WEBP image formats are supported.";
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return "Maximum file size allowed is 10 MB.";
    }

    return null;
  };

  // Upload/Replace Media Action
  const handleUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    
    setErrorMsg("");
    setSuccessMsg("");

    if (validationError) {
      setErrorMsg(validationError);
      // Reset input element
      e.target.value = "";
      return;
    }

    setUploading((prev) => ({ ...prev, [key]: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.email !== "triptimaakan@gmail.com") {
        throw new Error("Unauthorized: Only the whitelisted administrator email can modify site assets.");
      }

      // Storage Cleanup: If previous image exists, delete it first to prevent orphaned files
      const existingMedia = media[key];
      if (existingMedia) {
        try {
          const oldPath = existingMedia.image_url.split("/public/media/")[1];
          if (oldPath) {
            await supabase.storage.from("media").remove([oldPath]);
          }
        } catch (cleanupErr) {
          console.warn("Failed to delete previous storage file. Proceeding with new upload.", cleanupErr);
        }
      }

      // Generate storage filepath under: site-media/<group>/<filename>
      const fileExt = file.name.split(".").pop();
      const folderKey = key === "video-thumbnail" ? "video-thumbnails" : key;
      const fileName = `${key}-${Date.now()}.${fileExt}`;
      const filePath = `site-media/${folderKey}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // Upsert dynamic reference in database
      const { data, error: dbError } = await supabase
        .from("site_media")
        .upsert(
          {
            media_key: key,
            title: `${key.toUpperCase()} Image`,
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "media_key" }
        )
        .select()
        .single();

      if (dbError) throw dbError;

      if (data) {
        setMedia((prev) => ({ ...prev, [key]: data }));
        setSuccessMsg(`Successfully updated the ${key} image.`);
      }
    } catch (err: any) {
      console.error(`Upload error for ${key}:`, err);
      setErrorMsg(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
      // Reset input element
      e.target.value = "";
    }
  };

  // Delete Media Action
  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the ${key} image permanently?`)) return;

    setErrorMsg("");
    setSuccessMsg("");
    const existingMedia = media[key];
    if (!existingMedia) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.email !== "triptimaakan@gmail.com") {
        throw new Error("Unauthorized: Only the whitelisted administrator email can delete site assets.");
      }

      // 1. Delete file from Storage
      const filePath = existingMedia.image_url.split("/public/media/")[1];
      if (filePath) {
        const { error: storageError } = await supabase.storage.from("media").remove([filePath]);
        if (storageError) throw storageError;
      }

      // 2. Delete reference row from Database
      const { error: dbError } = await supabase
        .from("site_media")
        .delete()
        .eq("media_key", key);

      if (dbError) throw dbError;

      // Update state locally
      setMedia((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      setSuccessMsg(`Successfully deleted the ${key} image.`);
    } catch (err: any) {
      console.error(`Deletion error for ${key}:`, err);
      setErrorMsg(err.message || "Failed to delete image.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wider">
          SITE MEDIA MANAGER
        </h1>
        <p className="text-xs text-luxury-white-muted uppercase tracking-widest mt-1">
          Manage core website-specific images separately from portfolio content
        </p>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 text-xs font-semibold uppercase tracking-wide">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-gold-500/5 border border-gold-500/20 text-gold-400 p-4 text-xs font-semibold uppercase tracking-wide">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gold-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-[10px] tracking-widest text-luxury-white-muted uppercase">
            LOADING MEDIA ASSETS...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Hero Background */}
          <div className="bg-luxury-gray-900 border border-gold-500/10 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-500" /> HERO IMAGE
              </h2>
              <p className="text-[10px] text-luxury-white-muted uppercase tracking-wider">
                Full-screen landing page background image
              </p>
            </div>

            {/* Preview Area */}
            <div className="relative aspect-video w-full border border-luxury-gray-800 bg-black flex items-center justify-center overflow-hidden">
              {media["hero"] ? (
                <Image
                  src={media["hero"].image_url}
                  alt="Hero Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center space-y-2 p-4">
                  <ImageIcon className="h-8 w-8 mx-auto text-luxury-white-muted/20" />
                  <span className="text-[9px] tracking-widest text-luxury-white-muted/40 uppercase block">
                    No active hero image (using radial gradient)
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <label className="flex-grow flex items-center justify-center gap-2 text-[10px] tracking-wider font-semibold border border-gold-500/30 text-gold-400 hover:border-gold-500 py-3 uppercase transition-all duration-300 cursor-pointer text-center bg-transparent">
                {uploading["hero"] ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> SAVING...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" /> {media["hero"] ? "REPLACE IMAGE" : "UPLOAD IMAGE"}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload("hero", e)}
                  disabled={uploading["hero"]}
                  className="hidden"
                />
              </label>

              {media["hero"] && (
                <button
                  onClick={() => handleDelete("hero")}
                  disabled={uploading["hero"]}
                  className="px-4 border border-red-900/30 text-red-400 hover:bg-red-950/20 hover:border-red-500 transition-colors uppercase text-[10px] tracking-widest font-semibold cursor-pointer"
                  title="Remove Hero background"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Card 2: About Section Image */}
          <div className="bg-luxury-gray-900 border border-gold-500/10 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold-500" /> ABOUT SECTION IMAGE
              </h2>
              <p className="text-[10px] text-luxury-white-muted uppercase tracking-wider">
                Portrait photograph displayed beside biography on home page
              </p>
            </div>

            {/* Preview Area */}
            <div className="relative aspect-video w-full border border-luxury-gray-800 bg-black flex items-center justify-center overflow-hidden">
              {media["about"] ? (
                <Image
                  src={media["about"].image_url}
                  alt="About Profile Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-center space-y-2 p-4">
                  <ImageIcon className="h-8 w-8 mx-auto text-luxury-white-muted/20" />
                  <span className="text-[9px] tracking-widest text-luxury-white-muted/40 uppercase block">
                    No active profile photo uploaded
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <label className="flex-grow flex items-center justify-center gap-2 text-[10px] tracking-wider font-semibold border border-gold-500/30 text-gold-400 hover:border-gold-500 py-3 uppercase transition-all duration-300 cursor-pointer text-center bg-transparent">
                {uploading["about"] ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> SAVING...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" /> {media["about"] ? "REPLACE IMAGE" : "UPLOAD IMAGE"}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload("about", e)}
                  disabled={uploading["about"]}
                  className="hidden"
                />
              </label>

              {media["about"] && (
                <button
                  onClick={() => handleDelete("about")}
                  disabled={uploading["about"]}
                  className="px-4 border border-red-900/30 text-red-400 hover:bg-red-950/20 hover:border-red-500 transition-colors uppercase text-[10px] tracking-widest font-semibold cursor-pointer"
                  title="Remove Profile photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Card 3: SEO / Social Sharing Image (Reserved Section) */}
          <div className="bg-luxury-gray-900/40 border border-luxury-gray-800 p-6 flex flex-col justify-between space-y-6 opacity-40 select-none cursor-not-allowed relative">
            <div className="space-y-2">
              <h2 className="font-serif text-lg text-luxury-white-muted uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> SEO / SOCIAL SHARING IMAGE
              </h2>
              <p className="text-[10px] text-luxury-white-muted/60 uppercase tracking-wider">
                Default metadata card image preview used by links shared on social media
              </p>
            </div>

            <div className="relative aspect-video w-full border border-luxury-gray-850 bg-luxury-black/60 flex items-center justify-center">
              <div className="text-center space-y-1 p-4">
                <Lock className="h-6 w-6 mx-auto text-luxury-white-muted/20" />
                <span className="text-[9px] tracking-widest text-luxury-white-muted/40 uppercase block">
                  Future Reserved Feature
                </span>
              </div>
            </div>

            <button disabled className="w-full flex items-center justify-center gap-2 text-[10px] tracking-wider font-semibold border border-luxury-gray-800 text-luxury-white-muted/40 py-3 uppercase cursor-not-allowed">
              LOCKED
            </button>
          </div>

          {/* Card 4: Promotional Banners & Future Reserved Assets */}
          <div className="bg-luxury-gray-900/40 border border-luxury-gray-800 p-6 flex flex-col justify-between space-y-6 opacity-40 select-none cursor-not-allowed relative">
            <div className="space-y-2">
              <h2 className="font-serif text-lg text-luxury-white-muted uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> FUTURE RESERVED ASSETS
              </h2>
              <p className="text-[10px] text-luxury-white-muted/60 uppercase tracking-wider">
                Promotional banners, splash covers, and homepage typography backing assets
              </p>
            </div>

            <div className="relative aspect-video w-full border border-luxury-gray-850 bg-luxury-black/60 flex items-center justify-center">
              <div className="text-center space-y-1 p-4">
                <Lock className="h-6 w-6 mx-auto text-luxury-white-muted/20" />
                <span className="text-[9px] tracking-widest text-luxury-white-muted/40 uppercase block">
                  Future Reserved Feature
                </span>
              </div>
            </div>

            <button disabled className="w-full flex items-center justify-center gap-2 text-[10px] tracking-wider font-semibold border border-luxury-gray-800 text-luxury-white-muted/40 py-3 uppercase cursor-not-allowed">
              LOCKED
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
