"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Keeps 3D (R3F Canvas) children mounted one macrotask beyond `show` changes.
 * R3F unmounts its own root synchronously inside the React commit; tearing it
 * down while React is already rendering races ("Attempted to synchronously
 * unmount a root"). Deferring mount/unmount to timeout callbacks removes the
 * race without keeping WebGL loops alive longer than necessary.
 */
export function Deferred3D({ show, children }: { show: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(show), 0);
    return () => window.clearTimeout(t);
  }, [show]);
  if (!mounted) return null;
  return <>{children}</>;
}
