"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error");
      setErrorMessage("Please fill out all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      if (supabase) {
        // Live mode: insert into Supabase
        const { error } = await supabase.from("contact_messages").insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject || null,
            message: formData.message,
            status: "unread",
          },
        ]);

        if (error) throw error;
      } else {
        // Mock mode: simulate network call
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setSubmitStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 px-6 lg:px-12 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] tracking-[0.4em] text-gold-500 font-semibold uppercase">
            COLLABORATIONS & BOOKINGS
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-wider">
            CONTACT
          </h1>
          <div className="w-16 h-[1px] bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-6 items-start">
          
          {/* Left Side: Direct enquiries info */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-white uppercase tracking-wide">
                DIRECT ENQUIRIES
              </h2>
              <div className="w-12 h-[1px] bg-gold-500" />
              <p className="text-xs text-luxury-white-muted leading-relaxed font-light max-w-sm">
                For casting, runways, brand campaigns, styling collaborations, or creative editorial projects, please reach out directly.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {/* Email Contact Item */}
              <div className="flex items-center gap-4 group border-l border-gold-500/30 pl-4 py-2 hover:border-gold-500 transition-colors duration-300">
                <span className="p-3 bg-gold-500/5 border border-gold-500/10 text-gold-400 group-hover:bg-gold-500/10 group-hover:border-gold-500/30 transition-all duration-300 rounded-none">
                  <Mail className="h-5 w-5" />
                </span>
                <div className="space-y-0.5">
                  <span className="text-[9px] tracking-widest text-gold-400 font-semibold uppercase block">EMAIL INQUIRIES</span>
                  <a
                    href="mailto:triptimaakan@gmail.com?subject=Portfolio%20Inquiry"
                    className="font-serif text-white uppercase tracking-wider text-sm hover:text-gold-400 transition-colors duration-300 block"
                  >
                    triptimaakan@gmail.com
                  </a>
                </div>
              </div>

              {/* Instagram Contact Item */}
              <div className="flex items-center gap-4 group border-l border-gold-500/30 pl-4 py-2 hover:border-gold-500 transition-colors duration-300">
                <span className="p-3 bg-gold-500/5 border border-gold-500/10 text-gold-400 group-hover:bg-gold-500/10 group-hover:border-gold-500/30 transition-all duration-300 rounded-none">
                  <Instagram className="h-5 w-5" />
                </span>
                <div className="space-y-0.5">
                  <span className="text-[9px] tracking-widest text-gold-400 font-semibold uppercase block">FOLLOW INSTAGRAM</span>
                  <a
                    href="https://www.instagram.com/hey.its.bebo_6t9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-white uppercase tracking-wider text-sm hover:text-gold-400 transition-colors duration-300 block"
                  >
                    @hey.its.bebo_6t9
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:col-span-7 bg-luxury-gray-900 border border-gold-500/10 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl" />
            
            {submitStatus === "success" ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-gold-500/10 border border-gold-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-gold-400 text-2xl">✓</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-white uppercase tracking-wider">MESSAGE SENT</h3>
                  <p className="text-xs text-luxury-white-muted max-w-sm mx-auto leading-relaxed">
                    Thank you for your enquiry. We will review your message and get back to you shortly.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:triptimaakan@gmail.com?subject=Portfolio%20Inquiry" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full">
                      SEND EMAIL DIRECTLY
                    </Button>
                  </a>
                  <Button variant="outline" onClick={() => setSubmitStatus("idle")} className="w-full sm:w-auto">
                    SEND ANOTHER MESSAGE
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-white uppercase tracking-wide">Let&apos;s Create Something Memorable</h3>
                  <p className="text-xs text-luxury-white-muted/80">For collaborations, portfolio inquiries, brand partnerships, or creative projects, feel free to get in touch.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="YOUR NAME *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    disabled={submitting}
                    required
                  />
                  <Input
                    label="EMAIL ADDRESS *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. name@company.com"
                    disabled={submitting}
                    required
                  />
                </div>

                <Input
                  label="SUBJECT"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Campaign Booking Fall 2026"
                  disabled={submitting}
                />

                <Textarea
                  label="MESSAGE / INQUIRY DETAILS *"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about the project, date, rates, and requirements..."
                  disabled={submitting}
                  required
                />

                {submitStatus === "error" && (
                  <p className="text-xs text-red-400 font-medium uppercase tracking-wide">
                    {errorMessage}
                  </p>
                )}

                <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> SENDING...
                    </>
                  ) : (
                    "SUBMIT INQUIRY"
                  )}
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
