"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export default function WorkspacePage() {
  const workspace = useWorkspaceStore((s) => s.workspace);

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
