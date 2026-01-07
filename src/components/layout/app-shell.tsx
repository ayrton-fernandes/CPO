"use client";

import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isHydrated) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-gov-blue" />
        </div>
    );
  }
  
  const showSidebar = isAuthenticated && !isLoginPage;

  return (
    <div className="flex min-h-screen bg-background">
       {showSidebar && <Sidebar />}
       <div className="flex-1 w-full">
          {children}
       </div>
    </div>
  );
}
