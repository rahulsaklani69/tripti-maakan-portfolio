"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Check if the current route is part of the admin panel or login screen
  const isAdminRoute = pathname.startsWith("/tm-private-dashboard-x9k7") || pathname.startsWith("/login");

  return (
    <div className="min-h-full flex flex-col bg-black text-luxury-white">
      {/* Show Navbar only on public pages */}
      {!isAdminRoute && <Navbar />}
      
      {/* Main content wrapper */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Show Footer only on public pages */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}
