"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/admin/Sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
        } else if (session.user?.email !== "triptimaakan@gmail.com") {
          console.warn("Unauthorized admin session detected for email:", session.user?.email);
          await supabase.auth.signOut();
          router.push("/login?error=unauthorized");
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Set up real-time session listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setAuthorized(false);
        router.push("/login");
      } else if (session.user?.email !== "triptimaakan@gmail.com") {
        setAuthorized(false);
        await supabase.auth.signOut();
        router.push("/login?error=unauthorized");
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gold-500 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xs tracking-widest text-luxury-white-muted uppercase">
          Verifying Admin Session...
        </span>
      </div>
    );
  }

  // Prevent flash of content before redirecting
  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Admin navigation sidebar */}
      <Sidebar />

      {/* Main dashboard viewport */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
