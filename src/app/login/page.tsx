"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      if (supabase) {
        // Live mode: Sign in using Supabase Auth
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect to admin panel
        router.push("/admin");
      } else {
        // Mock mode: local testing credentials
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        if (email.toLowerCase() === "admin@triptimaakan.com" && password === "admin123") {
          // Store dummy session in localStorage
          localStorage.setItem("tripti_admin_session", "true");
          router.push("/admin");
        } else {
          setErrorMsg("Invalid credentials. In mock mode, use admin@triptimaakan.com / admin123.");
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-6 pt-24 pb-12">
      <div className="w-full max-w-md bg-luxury-gray-900 border border-gold-500/10 p-8 md:p-12 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl" />

        {/* Branding header */}
        <div className="text-center space-y-2">
          <span className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-400 inline-flex mb-2">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-3xl text-white uppercase tracking-wider">
            ADMIN LOGIN
          </h1>
          <p className="text-[10px] tracking-[0.2em] text-luxury-white-muted uppercase">
            Tripti Maakan Admin Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="EMAIL ADDRESS"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@triptimaakan.com"
            disabled={loading}
            required
          />

          <Input
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            required
          />

          {errorMsg && (
            <p className="text-xs text-red-400 font-medium uppercase tracking-wide">
              {errorMsg}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> VERIFYING...
              </>
            ) : (
              "SIGN IN"
            )}
          </Button>
        </form>

        <div className="text-center border-t border-luxury-gray-800 pt-6 text-[10px] text-luxury-white-muted/60 uppercase tracking-widest space-y-1">
          <p>MOCK LOGINS ENABLED FOR OFFLINE TESTING</p>
          <p className="text-gold-500 font-semibold">EMAIL: admin@triptimaakan.com | PASS: admin123</p>
        </div>
      </div>
    </div>
  );
}
