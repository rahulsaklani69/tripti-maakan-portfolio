"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Sliders, Save } from "lucide-react";

interface ModelDetailsData {
  height_cm: number | "";
  bust_cm: number | "";
  waist_cm: number | "";
  hips_cm: number | "";
  eye_color: string;
  hair_color: string;
  shoe_size: string;
  updated_at?: string;
}

export default function ModelDetailsManager() {
  const [formData, setFormData] = useState<ModelDetailsData>({
    height_cm: "",
    bust_cm: "",
    waist_cm: "",
    hips_cm: "",
    eye_color: "",
    hair_color: "",
    shoe_size: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const SINGLETON_ID = "00000000-0000-0000-0000-000000000000";

  // Fetch model details on mount
  useEffect(() => {
    async function fetchModelDetails() {
      setLoading(true);
      setErrorMsg("");
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("model_details")
          .select("*")
          .eq("id", SINGLETON_ID)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData({
            height_cm: Number(data.height_cm),
            bust_cm: Number(data.bust_cm),
            waist_cm: Number(data.waist_cm),
            hips_cm: Number(data.hips_cm),
            eye_color: data.eye_color || "",
            hair_color: data.hair_color || "",
            shoe_size: data.shoe_size || "",
            updated_at: data.updated_at,
          });
        }
      } catch (err: any) {
        console.error("Error fetching model details:", err);
        setErrorMsg("Failed to load model details. Please verify your database connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchModelDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["height_cm", "bust_cm", "waist_cm", "hips_cm"].includes(name)
        ? value === "" ? "" : Number(value)
        : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validation
    const height = Number(formData.height_cm);
    const bust = Number(formData.bust_cm);
    const waist = Number(formData.waist_cm);
    const hips = Number(formData.hips_cm);

    if (isNaN(height) || height <= 0) {
      setErrorMsg("Please enter a valid height in centimeters.");
      return;
    }
    if (isNaN(bust) || bust <= 0) {
      setErrorMsg("Please enter a valid bust measurement in centimeters.");
      return;
    }
    if (isNaN(waist) || waist <= 0) {
      setErrorMsg("Please enter a valid waist measurement in centimeters.");
      return;
    }
    if (isNaN(hips) || hips <= 0) {
      setErrorMsg("Please enter a valid hips measurement in centimeters.");
      return;
    }
    if (!formData.eye_color.trim()) {
      setErrorMsg("Eye color cannot be empty.");
      return;
    }
    if (!formData.hair_color.trim()) {
      setErrorMsg("Hair color cannot be empty.");
      return;
    }
    if (!formData.shoe_size.trim()) {
      setErrorMsg("Shoe size cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.email !== "triptimaakan@gmail.com") {
        throw new Error("Unauthorized: Only the whitelisted administrator email can modify model details.");
      }

      const { data, error } = await supabase
        .from("model_details")
        .upsert({
          id: SINGLETON_ID,
          height_cm: height,
          bust_cm: bust,
          waist_cm: waist,
          hips_cm: hips,
          eye_color: formData.eye_color.trim(),
          hair_color: formData.hair_color.trim(),
          shoe_size: formData.shoe_size.trim(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          height_cm: Number(data.height_cm),
          bust_cm: Number(data.bust_cm),
          waist_cm: Number(data.waist_cm),
          hips_cm: Number(data.hips_cm),
          eye_color: data.eye_color || "",
          hair_color: data.hair_color || "",
          shoe_size: data.shoe_size || "",
          updated_at: data.updated_at,
        });
        setSuccessMsg("Model details updated successfully.");
      }
    } catch (err: any) {
      console.error("Error saving model details:", err);
      setErrorMsg(err.message || "Failed to save details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wider">
          MODEL DETAILS MANAGER
        </h1>
        <p className="text-xs text-luxury-white-muted uppercase tracking-widest mt-1">
          Manage physical details and specifications for your profile
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
            LOADING MODEL DETAILS...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-luxury-gray-900 border border-gold-500/10 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-luxury-gray-800">
            <Sliders className="h-5 w-5 text-gold-500" />
            <h2 className="font-serif text-lg text-white uppercase tracking-wider">
              Measurements & Stats
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Height */}
            <div className="space-y-2">
              <label htmlFor="height_cm" className="block text-[10px] tracking-widest text-luxury-white-muted uppercase font-semibold">
                Height (cm)
              </label>
              <input
                id="height_cm"
                name="height_cm"
                type="number"
                step="any"
                value={formData.height_cm}
                onChange={handleChange}
                className="w-full bg-black border border-luxury-gray-800 focus:border-gold-500 text-white px-4 py-3 text-xs tracking-wider uppercase focus:outline-none transition-colors"
                placeholder="e.g. 172"
                required
              />
            </div>

            {/* Bust */}
            <div className="space-y-2">
              <label htmlFor="bust_cm" className="block text-[10px] tracking-widest text-luxury-white-muted uppercase font-semibold">
                Bust (cm)
              </label>
              <input
                id="bust_cm"
                name="bust_cm"
                type="number"
                step="any"
                value={formData.bust_cm}
                onChange={handleChange}
                className="w-full bg-black border border-luxury-gray-800 focus:border-gold-500 text-white px-4 py-3 text-xs tracking-wider uppercase focus:outline-none transition-colors"
                placeholder="e.g. 84"
                required
              />
            </div>

            {/* Waist */}
            <div className="space-y-2">
              <label htmlFor="waist_cm" className="block text-[10px] tracking-widest text-luxury-white-muted uppercase font-semibold">
                Waist (cm)
              </label>
              <input
                id="waist_cm"
                name="waist_cm"
                type="number"
                step="any"
                value={formData.waist_cm}
                onChange={handleChange}
                className="w-full bg-black border border-luxury-gray-800 focus:border-gold-500 text-white px-4 py-3 text-xs tracking-wider uppercase focus:outline-none transition-colors"
                placeholder="e.g. 61"
                required
              />
            </div>

            {/* Hips */}
            <div className="space-y-2">
              <label htmlFor="hips_cm" className="block text-[10px] tracking-widest text-luxury-white-muted uppercase font-semibold">
                Hips (cm)
              </label>
              <input
                id="hips_cm"
                name="hips_cm"
                type="number"
                step="any"
                value={formData.hips_cm}
                onChange={handleChange}
                className="w-full bg-black border border-luxury-gray-800 focus:border-gold-500 text-white px-4 py-3 text-xs tracking-wider uppercase focus:outline-none transition-colors"
                placeholder="e.g. 89"
                required
              />
            </div>

            {/* Eye Color */}
            <div className="space-y-2">
              <label htmlFor="eye_color" className="block text-[10px] tracking-widest text-luxury-white-muted uppercase font-semibold">
                Eye Color
              </label>
              <input
                id="eye_color"
                name="eye_color"
                type="text"
                value={formData.eye_color}
                onChange={handleChange}
                className="w-full bg-black border border-luxury-gray-800 focus:border-gold-500 text-white px-4 py-3 text-xs tracking-wider uppercase focus:outline-none transition-colors"
                placeholder="e.g. Green"
                required
              />
            </div>

            {/* Hair Color */}
            <div className="space-y-2">
              <label htmlFor="hair_color" className="block text-[10px] tracking-widest text-luxury-white-muted uppercase font-semibold">
                Hair Color
              </label>
              <input
                id="hair_color"
                name="hair_color"
                type="text"
                value={formData.hair_color}
                onChange={handleChange}
                className="w-full bg-black border border-luxury-gray-800 focus:border-gold-500 text-white px-4 py-3 text-xs tracking-wider uppercase focus:outline-none transition-colors"
                placeholder="e.g. Dark Brown"
                required
              />
            </div>

            {/* Shoe Size */}
            <div className="space-y-2">
              <label htmlFor="shoe_size" className="block text-[10px] tracking-widest text-luxury-white-muted uppercase font-semibold">
                Shoe Size
              </label>
              <input
                id="shoe_size"
                name="shoe_size"
                type="text"
                value={formData.shoe_size}
                onChange={handleChange}
                className="w-full bg-black border border-luxury-gray-800 focus:border-gold-500 text-white px-4 py-3 text-xs tracking-wider uppercase focus:outline-none transition-colors"
                placeholder="e.g. 39"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-luxury-gray-800">
            {formData.updated_at ? (
              <span className="text-[10px] text-luxury-white-muted uppercase tracking-wider">
                Last Updated: {new Date(formData.updated_at).toLocaleString()}
              </span>
            ) : (
              <span className="text-[10px] text-luxury-white-muted uppercase tracking-wider">
                Not updated yet
              </span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] tracking-wider font-semibold border border-gold-500/30 text-gold-400 hover:border-gold-500 py-3.5 px-8 uppercase transition-all duration-300 cursor-pointer bg-transparent"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> SAVING DETAILS...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> SAVE DETAILS
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
