"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

interface PortfolioItem {
  id: string;
  url: string;
  title: string | null;
  category: string;
  order_index: number;
}

const MOCK_ITEMS: PortfolioItem[] = [
  { id: "mock-1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80", title: "Vogue Italia Editorial Shoot", category: "EDITORIAL", order_index: 1 },
  { id: "mock-2", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", title: "Paris Runway Fall/Winter", category: "RUNWAY", order_index: 2 },
  { id: "mock-3", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80", title: "Chanel Beauty Campaign", category: "BEAUTY", order_index: 3 },
];

export default function AdminGallery() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("EDITORIAL");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch gallery items
  useEffect(() => {
    async function fetchGallery() {
      setLoading(true);
      if (!supabase) {
        setItems(MOCK_ITEMS);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("portfolio_items")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(MOCK_ITEMS);
        }
      } catch (err) {
        console.error("Supabase gallery fetch failed, using mock:", err);
        setItems(MOCK_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Handle Form Submission (Add photo)
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!supabase) {
      // Mock mode upload simulation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Select a random portrait photo from Unsplash for testing
      const randomUnsplashIds = [
        "photo-1506794778202-cad84cf45f1d", // Male model
        "photo-1531746020798-e6953c6e8e04", // Female model
        "photo-1507003211169-0a1dd7228f2d", // Male portrait
        "photo-1544005313-94ddf0286df2", // Female portrait
      ];
      const randomIdx = Math.floor(Math.random() * randomUnsplashIds.length);
      const mockUrl = `https://images.unsplash.com/${randomUnsplashIds[randomIdx]}?auto=format&fit=crop&w=800&q=80`;

      const newItem: PortfolioItem = {
        id: `mock-${Date.now()}`,
        url: mockUrl,
        title: title || "Untitled Upload",
        category: category,
        order_index: items.length + 1,
      };

      setItems((prev) => [...prev, newItem]);
      setSuccessMsg("Photo uploaded successfully (Simulated!).");
      setTitle("");
      setFile(null);
      setUploading(false);
      return;
    }

    // Live mode upload
    if (!file) {
      setErrorMsg("Please select an image file to upload.");
      setUploading(false);
      return;
    }

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // 2. Insert reference row into portfolio_items table
      const { data, error: insertError } = await supabase
        .from("portfolio_items")
        .insert([
          {
            url: publicUrl,
            title: title || null,
            category: category,
            order_index: items.length + 1,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setItems((prev) => [...prev, data]);
      }
      setSuccessMsg("Photo uploaded successfully.");
      setTitle("");
      setFile(null);
      // Reset input element
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMsg(err.message || "Failed to upload image. Make sure your Storage bucket 'media' exists.");
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (id: string, url: string) => {
    if (!confirm("Delete this photo from your portfolio?")) return;

    try {
      if (supabase) {
        // 1. If URL belongs to our Supabase Storage, delete file from bucket
        if (url.includes("/storage/v1/object/public/media/")) {
          const filePath = url.split("/storage/v1/object/public/media/").pop();
          if (filePath) {
            await supabase.storage.from("media").remove([filePath]);
          }
        }

        // 2. Delete row from table
        const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
        if (error) throw error;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccessMsg("Photo deleted successfully.");
    } catch (err: any) {
      console.error("Deletion failed:", err);
      setErrorMsg(err.message || "Failed to delete photo.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wider">
          PORTFOLIO MANAGER
        </h1>
        <p className="text-xs text-luxury-white-muted uppercase tracking-widest mt-1">
          Upload new images to divisions or delete items
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Upload Form Column */}
        <form
          onSubmit={handleAddPhoto}
          className="xl:col-span-5 bg-luxury-gray-900 border border-gold-500/10 p-6 md:p-8 space-y-6"
        >
          <h2 className="font-serif text-lg text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800">
            UPLOAD NEW PHOTO
          </h2>

          <Input
            label="PHOTO TITLE (OPTIONAL)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dior Campaign SS26"
            disabled={uploading}
          />

          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
              DIVISION CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 text-xs px-4 py-3.5 text-white outline-none transition-all duration-300 uppercase font-semibold"
              disabled={uploading}
            >
              <option value="EDITORIAL">EDITORIAL</option>
              <option value="RUNWAY">RUNWAY</option>
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="BEAUTY">BEAUTY</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
              IMAGE FILE *
            </label>
            <div className="border border-dashed border-luxury-gray-800 hover:border-gold-500/50 p-6 text-center transition-colors cursor-pointer relative bg-black/35">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={uploading}
              />
              <ImageIcon className="h-8 w-8 mx-auto text-gold-500/40 mb-2" />
              <p className="text-xs text-white uppercase tracking-wider">
                {file ? file.name : "Select photo from device"}
              </p>
              <p className="text-[10px] text-luxury-white-muted/50 mt-1 uppercase">
                JPG, PNG, WEBP (Max 5MB)
              </p>
            </div>
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> UPLOADING...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> UPLOAD TO GALLERY
              </>
            )}
          </Button>
        </form>

        {/* Existing Gallery Grid Column */}
        <div className="xl:col-span-7 bg-luxury-gray-900 border border-gold-500/10 p-6 space-y-4">
          <h2 className="font-serif text-lg text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800">
            CURRENT GALLERY ({items.length})
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gold-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-[10px] tracking-widest text-luxury-white-muted uppercase">
                LOADING PORTFOLIO...
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-luxury-white-muted">
              <p className="text-xs tracking-widest uppercase">No items in the gallery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-[2/3] overflow-hidden bg-black border border-luxury-gray-800"
                >
                  <Image
                    src={item.url}
                    alt={item.title || "Portfolio Photo"}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover"
                  />
                  {/* Delete overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    <button
                      onClick={() => handleDeletePhoto(item.id, item.url)}
                      className="p-1.5 bg-red-950/80 border border-red-900/50 rounded-full text-red-400 hover:text-white hover:bg-red-900 transition-colors self-end cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="text-[9px] text-left">
                      <span className="text-gold-400 font-bold block tracking-wider uppercase">
                        {item.category}
                      </span>
                      <span className="text-white block font-medium truncate uppercase mt-0.5">
                        {item.title || "Untitled"}
                      </span>
                    </div>
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
