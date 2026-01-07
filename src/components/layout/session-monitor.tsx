"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { usePathname } from "next/navigation";

export function SessionMonitor() {
  const { checkSession, isAuthenticated, isHydrated, refreshUser } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || pathname === "/login") return;

    // Check session on mount and route change
    checkSession();

    // Check session on user activity
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      checkSession();
    };

    const handleDbChange = () => {
        refreshUser();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    window.addEventListener('db-change', handleDbChange);

    // periodic check every minute
    const interval = setInterval(() => {
      checkSession();
    }, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('db-change', handleDbChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, isHydrated, pathname, checkSession, refreshUser]);

  return null;
}
