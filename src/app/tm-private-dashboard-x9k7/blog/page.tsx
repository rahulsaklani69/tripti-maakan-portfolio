"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader2, BookOpen, Eye, Check } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all posts (including drafts for admin)
  useEffect(() => {
    async function fetchAllPosts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err: any) {
        console.error("Supabase blog fetch failed:", err);
        setErrorMsg(err.message || "Failed to fetch blog articles.");
      } finally {
        setLoading(false);
      }
    }
    fetchAllPosts();
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingId) {
      const formattedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // replace spaces/specials with dash
        .replace(/(^-|-$)+/g, ""); // trim dashes at ends
      setSlug(formattedSlug);
    }
  };

  // Populate form for editing
  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setPublished(post.published);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setCoverFile(null);
    setPublished(false);
    setErrorMsg("");
    setSuccessMsg("");
    const fileInput = document.getElementById("cover-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Submit Form (Save / Update)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!title || !slug || !content) {
      setErrorMsg("Title, slug, and content are required.");
      setSubmitting(false);
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

      let finalCoverUrl: string | null = null;

      // 1. Upload cover image if selected
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `blog/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, coverFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(filePath);

        finalCoverUrl = publicUrl;
      }

      // Prepare row data
      const rowData: any = {
        title,
        slug,
        content,
        published,
        published_at: published ? new Date().toISOString() : null,
      };
      if (finalCoverUrl) {
        rowData.cover_image = finalCoverUrl;
      }

      if (editingId) {
        // Update existing post
        const { data, error } = await supabase
          .from("blog_posts")
          .update(rowData)
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;

        setPosts((prev) => prev.map((p) => (p.id === editingId ? data : p)));
        setSuccessMsg("Article updated successfully.");
      } else {
        // Create new post
        if (!finalCoverUrl) {
          // Default cover placeholder
          rowData.cover_image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        }

        const { data, error } = await supabase
          .from("blog_posts")
          .insert([rowData])
          .select()
          .single();

        if (error) throw error;

        setPosts((prev) => [data, ...prev]);
        setSuccessMsg("Article created successfully.");
      }

      resetForm();
    } catch (err: any) {
      console.error("Failed to save article:", err);
      setErrorMsg(err.message || "Failed to save article. Verify unique slug or RLS configurations.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string, coverUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this article permanently?")) return;

    try {
      // Delete cover image from bucket if exists
      if (coverUrl && coverUrl.includes("/storage/v1/object/public/media/")) {
        const filePath = coverUrl.split("/storage/v1/object/public/media/").pop();
        if (filePath) {
          await supabase.storage.from("media").remove([filePath]);
        }
      }

      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg("Article deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete article:", err);
      setErrorMsg(err.message || "Failed to delete article.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wider">
          JOURNAL MANAGER
        </h1>
        <p className="text-xs text-luxury-white-muted uppercase tracking-widest mt-1">
          Draft and publish blog articles about your career journey
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Editor Form Column */}
        <form
          onSubmit={handleSavePost}
          className="xl:col-span-6 bg-luxury-gray-900 border border-gold-500/10 p-6 md:p-8 space-y-6"
        >
          <h2 className="font-serif text-lg text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800 flex justify-between items-center">
            <span>{editingId ? "EDIT JOURNAL ARTICLE" : "CREATE NEW ARTICLE"}</span>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[9px] tracking-widest text-gold-500 hover:text-white uppercase font-bold"
              >
                Cancel Edit
              </button>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="ARTICLE TITLE *"
              value={title}
              onChange={handleTitleChange}
              placeholder=""
              disabled={submitting}
              required
            />
            <Input
              label="URL SLUG (AUTO-GENERATED) *"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder=""
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
              COVER IMAGE FILE (OPTIONAL)
            </label>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 text-xs px-4 py-3 text-white outline-none"
              disabled={submitting}
            />
          </div>

          <Textarea
            label="CONTENT (MARKDOWN SUPPORTED) *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder=""
            disabled={submitting}
            className="h-64 font-mono text-xs"
            required
          />

          {/* Toggle Published */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded accent-gold-500 cursor-pointer"
              disabled={submitting}
            />
            <label
              htmlFor="published"
              className="text-xs text-white uppercase tracking-wider font-semibold cursor-pointer select-none"
            >
              PUBLISH IMMEDIATELY (VISITORS CAN VIEW IT)
            </label>
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

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...
              </>
            ) : editingId ? (
              <>
                <Check className="mr-2 h-4 w-4" /> SAVE CHANGES
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> CREATE POST
              </>
            )}
          </Button>
        </form>

        {/* Existing Articles List Column */}
        <div className="xl:col-span-6 bg-luxury-gray-900 border border-gold-500/10 p-6 space-y-4">
          <h2 className="font-serif text-lg text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800">
            ARTICLE DATABASE ({posts.length})
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gold-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-[10px] tracking-widest text-luxury-white-muted uppercase">
                LOADING DATABASE...
              </span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-luxury-white-muted border border-dashed border-luxury-gray-800">
              <p className="text-xs tracking-widest uppercase">No articles in database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-black/40 border border-luxury-gray-800 p-4 flex justify-between items-center gap-4 hover:border-gold-500/20 transition-colors duration-300"
                >
                  <div className="space-y-1.5 max-w-[65%]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 tracking-widest uppercase border ${
                          post.published
                            ? "border-gold-500/30 text-gold-400 bg-gold-500/5"
                            : "border-luxury-gray-800 text-luxury-white-muted/50"
                        }`}
                      >
                        {post.published ? "PUBLISHED" : "DRAFT"}
                      </span>
                      <span className="text-[9px] text-luxury-white-muted/40 font-mono">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : "No Date"}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm text-white uppercase tracking-wide truncate">
                      {post.title}
                    </h3>
                    <p className="text-[10px] text-luxury-white-muted/50 font-mono truncate">
                      /{post.slug}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {post.published && (
                      <Link
                        href={`/journal/${post.slug}`}
                        target="_blank"
                        className="p-2 border border-luxury-gray-800 hover:border-gold-500/30 text-luxury-white-muted hover:text-white transition-colors"
                        title="View Article"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <button
                      onClick={() => startEdit(post)}
                      className="p-2 border border-luxury-gray-800 hover:border-gold-500/30 text-luxury-white-muted hover:text-gold-400 transition-colors cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id, post.cover_image)}
                      className="p-2 border border-transparent hover:bg-red-950/20 text-luxury-white-muted hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
