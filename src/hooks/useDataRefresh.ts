"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Hook to force a component refresh whenever the local database changes.
 * Returns a refresh count that can be used as a dependency in other hooks.
 */
export function useDataRefresh() {
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(() => {
    setRefreshCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleDbChange = () => {
      refresh();
    };

    window.addEventListener('db-change', handleDbChange);
    return () => window.removeEventListener('db-change', handleDbChange);
  }, [refresh]);

  return refreshCount;
}
