"use client";

import React from "react";
import { useEffect, useState } from "react";

export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export function PageHydrationLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-sm text-text-muted">
      <div className="w-full max-w-md rounded-md border border-surface-border bg-surface-secondary p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-text-muted">
          SharedGround
        </div>
        <div className="mt-3 h-5 w-48 rounded bg-surface-border" />
        <div className="mt-3 h-3 w-full rounded bg-surface-border" />
        <div className="mt-2 h-3 w-2/3 rounded bg-surface-border" />
        <p className="mt-4 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}
