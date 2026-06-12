"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Image as ImageIcon, Pencil, X } from "lucide-react";

interface PortfolioItem {
  id: string;
  url: string;
  title: string | null;
  category: string;
  order_index: number;
}

export default function AdminGallery() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

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
      try {
        const { data, error } = await supabase
          .from("portfolio_items")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) throw error;
        setItems(data || []);
      } catch (err: any) {
        console.error("Supabase gallery fetch failed:", err);
        setErrorMsg(err.message || "Failed to fetch gallery items.");
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

    // Live mode upload
    if (!file) {
      setErrorMsg("Please select an image file to upload.");
      setUploading(false);
      return;
    }

    try {
      // Diagnostic check: verify session role
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Supabase Client Session:", session);
      console.log("User JWT Role Claim:", session?.user?.role);
      console.log("Authorization Headers Active:", session ? "Yes" : "No");

      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

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
      setErrorMsg(err.message || "Failed to upload image. Make sure your Storage bucket 'media' exists and RLS policies are set.");
    } finally {
      setUploading(false);
    }
  };

  // Handle Edit Submission (Update photo details)
  const handleEditPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase
        .from("portfolio_items")
        .update({
          title: editingItem.title || null,
          category: editingItem.category,
          order_index: editingItem.order_index,
        })
        .eq("id", editingItem.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? editingItem : item))
      );

      setSuccessMsg("Photo details updated successfully.");
      setEditingItem(null);
    } catch (err: any) {
      console.error("Edit failed:", err);
      setErrorMsg(err.message || "Failed to save photo modifications.");
    } finally {
      setSaving(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (id: string, url: string) => {
    if (!confirm("Delete this photo from your portfolio?")) return;

    try {
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
            placeholder=""
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
            <div className="text-center py-20 text-luxury-white-muted border border-dashed border-luxury-gray-800">
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
                    unoptimized
                  />
                  {/* Action overlays */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 bg-luxury-gray-900/80 border border-gold-500/25 rounded-full text-gold-400 hover:text-white hover:bg-gold-500/20 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(item.id, item.url)}
                        className="p-1.5 bg-red-950/80 border border-red-900/50 rounded-full text-red-400 hover:text-white hover:bg-red-900 transition-colors cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-[9px] text-left">
                      <span className="text-gold-400 font-bold block tracking-wider uppercase">
                        {item.category}
                      </span>
                      <span className="text-white block font-medium truncate uppercase mt-0.5">
                        {item.title || "Untitled"}
                      </span>
                      <span className="text-luxury-white-muted/40 block font-mono mt-0.5">
                        SORT: {item.order_index}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal Dialog */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-luxury-gray-900 border border-gold-500/20 p-6 md:p-8 space-y-6 relative rounded-none">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-luxury-white-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-xl text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800">
              EDIT PHOTO DETAILS
            </h3>

            <form onSubmit={handleEditPhoto} className="space-y-6">
              <Input
                label="PHOTO TITLE"
                value={editingItem.title || ""}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder=""
                disabled={saving}
              />

              <div className="space-y-1.5">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
                  DIVISION CATEGORY
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 text-xs px-4 py-3.5 text-white outline-none transition-all duration-300 uppercase font-semibold"
                  disabled={saving}
                >
                  <option value="EDITORIAL">EDITORIAL</option>
                  <option value="RUNWAY">RUNWAY</option>
                  <option value="COMMERCIAL">COMMERCIAL</option>
                  <option value="BEAUTY">BEAUTY</option>
                </select>
              </div>

              <Input
                label="ORDER INDEX (SORT)"
                type="number"
                value={editingItem.order_index}
                onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) || 0 })}
                placeholder=""
                disabled={saving}
              />

              {errorMsg && (
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wide">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-1/2"
                  onClick={() => setEditingItem(null)}
                  disabled={saving}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-1/2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...
                    </>
                  ) : (
                    "SAVE CHANGES"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
