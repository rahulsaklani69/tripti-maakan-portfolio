"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Inbox, Image as ImageIcon, Video, BookOpen, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Signout error:", err);
    }
    router.push("/login");
  };

  const navItems = [
    { name: "MESSAGES (INBOX)", href: "/tm-private-dashboard-x9k7", icon: Inbox },
    { name: "MANAGE GALLERY", href: "/tm-private-dashboard-x9k7/gallery", icon: ImageIcon },
    { name: "MANAGE VIDEOS", href: "/tm-private-dashboard-x9k7/videos", icon: Video },
    { name: "MANAGE JOURNAL", href: "/tm-private-dashboard-x9k7/blog", icon: BookOpen },
  ];

  return (
    <aside className="w-full md:w-64 bg-luxury-gray-900 border-b md:border-b-0 md:border-r border-gold-500/10 flex flex-col justify-between p-6 md:h-screen sticky top-0 z-30">
      <div className="space-y-8">
        
        {/* Admin Brand */}
        <div className="pb-6 border-b border-luxury-gray-800">
          <Link href="/" className="font-serif text-lg tracking-[0.25em] text-white hover:text-gold-400 transition-colors">
            TRIPTI
          </Link>
          <span className="text-[9px] tracking-widest text-gold-500 font-semibold uppercase block mt-1">
            ADMIN PANEL
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 text-[10px] tracking-widest font-semibold px-4 py-3 rounded-none border transition-all duration-300 uppercase whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gold-500/10 border-gold-500 text-gold-400"
                    : "bg-transparent border-transparent text-luxury-white-muted hover:text-white hover:bg-luxury-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-[10px] tracking-widest font-semibold px-4 py-3 border border-transparent text-red-400 hover:text-white hover:bg-red-950/20 hover:border-red-900/30 transition-all duration-300 uppercase mt-4 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        SIGN OUT
      </button>
    </aside>
  );
}
