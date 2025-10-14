'use client';

import { useState, useEffect } from 'react';

/**
 * Client-only wrapper to prevent SSR hydration issues
 * This component only renders its children after the component has mounted on the client
 */
export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}