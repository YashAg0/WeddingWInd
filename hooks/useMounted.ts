"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to detect when a client component has mounted on the DOM.
 * Used to avoid SSR hydration mismatches when rendering client-side dynamic content.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
