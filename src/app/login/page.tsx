"use client";

import { useState, useEffect } from "react";
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
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect to admin if already logged in
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push("/tm-private-dashboard-x9k7");
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkExistingSession();
  }, [router]);

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to admin panel
      router.push("/tm-private-dashboard-x9k7");
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gold-500 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xs tracking-widest text-luxury-white-muted uppercase">
          Checking Session...
        </span>
      </div>
    );
  }

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
            placeholder=""
            disabled={loading}
            required
          />

          <Input
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
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
      </div>
    </div>
  );
}
