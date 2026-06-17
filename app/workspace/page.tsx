"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import {
  PageHydrationLoading,
  useClientMounted,
} from "@/components/hydration/client-mounted-gate";

export default function WorkspacePage() {
  const mounted = useClientMounted();
  const storeHasHydrated = useWorkspaceStore((s) => s.hasHydrated);
  const hasHydrated =
    useWorkspaceStore.getState().hasHydrated || storeHasHydrated;

  if (!mounted || !hasHydrated) {
    return <PageHydrationLoading label="Loading workspace..." />;
  }

  const workspace = useWorkspaceStore.getState().workspace;

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-text-muted">
        No workspace found.{" "}
        <a href="/" className="ml-1 text-accent-blue hover:underline">
          Start a new task
        </a>
      </div>
    );
  }

  return <WorkspaceShell />;
}
