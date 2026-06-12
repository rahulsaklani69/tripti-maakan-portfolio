"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Upload, Trash2, Image as ImageIcon, Loader2, Sparkles, Globe, Film, Award } from "lucide-react";

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

  const targetMediaKeys = [
    { key: "hero", label: "HERO IMAGE", description: "Full-screen landing page background image", icon: Sparkles },
    { key: "editorial", label: "EDITORIAL HIGHLIGHT IMAGE", description: "Background cover for Editorial card on homepage", icon: Award },
    { key: "runway", label: "RUNWAY HIGHLIGHT IMAGE", description: "Background cover for Runway card on homepage", icon: Film },
    { key: "beauty", label: "BEAUTY HIGHLIGHT IMAGE", description: "Background cover for Beauty card on homepage", icon: Globe }
  ];

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
          .select("*")
          .in("media_key", ["hero", "editorial", "runway", "beauty"]);

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
      const fileName = `${key}-${Date.now()}.${fileExt}`;
      const filePath = `site-media/${key}/${fileName}`;

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
      // Reset input
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
          Manage key website background assets and category visual covers
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
          {targetMediaKeys.map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="bg-luxury-gray-900 border border-gold-500/10 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-lg text-white uppercase tracking-wider flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gold-500" /> {label}
                </h2>
                <p className="text-[10px] text-luxury-white-muted uppercase tracking-wider">
                  {description}
                </p>
              </div>

              {/* Preview Area */}
              <div className="relative aspect-video w-full border border-luxury-gray-800 bg-black flex items-center justify-center overflow-hidden">
                {media[key] ? (
                  <Image
                    src={media[key].image_url}
                    alt={`${label} Preview`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <ImageIcon className="h-8 w-8 mx-auto text-luxury-white-muted/20" />
                    <span className="text-[9px] tracking-widest text-luxury-white-muted/40 uppercase block">
                      No active image (using fallback gradient)
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <label className="flex-grow flex items-center justify-center gap-2 text-[10px] tracking-wider font-semibold border border-gold-500/30 text-gold-400 hover:border-gold-500 py-3 uppercase transition-all duration-300 cursor-pointer text-center bg-transparent">
                  {uploading[key] ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> SAVING...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" /> {media[key] ? "REPLACE IMAGE" : "UPLOAD IMAGE"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(key, e)}
                    disabled={uploading[key]}
                    className="hidden"
                  />
                </label>

                {media[key] && (
                  <button
                    onClick={() => handleDelete(key)}
                    disabled={uploading[key]}
                    className="px-4 border border-red-900/30 text-red-400 hover:bg-red-950/20 hover:border-red-500 transition-colors uppercase text-[10px] tracking-widest font-semibold cursor-pointer"
                    title={`Remove ${label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
