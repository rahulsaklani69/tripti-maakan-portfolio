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
            BOOKING & ENQUIRIES
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-wider">
            CONTACT
          </h1>
          <div className="w-16 h-[1px] bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-6 items-start">
          
          {/* Left Side: Agency representation info */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-white uppercase tracking-wide">
                REPRESENTATION
              </h2>
              <div className="w-12 h-[1px] bg-gold-500" />
              <p className="text-xs text-luxury-white-muted leading-relaxed font-light max-w-sm">
                For casting, runways, commercials, or editorial booking queries, please reach out directly to my local agents.
              </p>
            </div>

            <div className="space-y-6">
              {/* London Agency */}
              <div className="border-l border-gold-500/30 pl-4 space-y-1">
                <span className="text-[10px] tracking-widest text-gold-400 font-semibold uppercase">UK & EUROPE</span>
                <h4 className="font-serif text-white uppercase tracking-wider">Luxe Models London</h4>
                <p className="text-xs text-luxury-white-muted/80">booking@luxemodels.co.uk</p>
                <p className="text-xs text-luxury-white-muted/80">+44 20 7946 0192</p>
              </div>

              {/* NY Agency */}
              <div className="border-l border-gold-500/30 pl-4 space-y-1">
                <span className="text-[10px] tracking-widest text-gold-400 font-semibold uppercase">NORTH AMERICA</span>
                <h4 className="font-serif text-white uppercase tracking-wider">Apex Management NY</h4>
                <p className="text-xs text-luxury-white-muted/80">info@apexmgmt.com</p>
                <p className="text-xs text-luxury-white-muted/80">+1 (212) 555-0199</p>
              </div>

              {/* Direct Contacts */}
              <div className="border-l border-gold-500/30 pl-4 space-y-1">
                <span className="text-[10px] tracking-widest text-gold-400 font-semibold uppercase">DIRECT ENQUIRIES</span>
                <h4 className="font-serif text-white uppercase tracking-wider">Personal Booking</h4>
                <p className="text-xs text-luxury-white-muted/80">triptimaakan@gmail.com</p>
              </div>
            </div>

            {/* Social Connection */}
            <div className="space-y-3 pt-4">
              <span className="text-[10px] tracking-[0.2em] text-luxury-white-muted uppercase block font-semibold">FOLLOW DIGITAL PORTFOLIO</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-xs tracking-widest text-white hover:text-gold-400 transition-colors uppercase font-bold"
              >
                <Instagram className="h-4 w-4 text-gold-500" /> @triptimaakan
              </a>
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
                    Thank you for your enquiry. We will review your message and get back to you shortly or route it to the appropriate agency.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitStatus("idle")} className="mt-4">
                  SEND ANOTHER MESSAGE
                </Button>
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
