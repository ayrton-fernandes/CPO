"use client";

import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  
  // Need to handle hydration to avoid mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // While not mounted, render children only (or loading?)
  // Better to just render structure but beware of hydration error.
  // Sidebar uses useAuthStore which persists in localStorage (zustand persist?).
  // If not persisted, it defaults to null.
  
  const showSidebar = mounted && isAuthenticated && !isLoginPage;

  return (
    <div className="flex min-h-screen bg-background">
       {showSidebar && <Sidebar />}
       <div className="flex-1 w-full">
          {children}
       </div>
    </div>
  );
}
