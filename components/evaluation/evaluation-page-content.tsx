"use client";

import React from "react";
import { EvaluationSummaryView } from "@/components/evaluation/evaluation-summary";
import {
  PageHydrationLoading,
} from "@/components/hydration/client-mounted-gate";
import { runEvaluation } from "@/eval/run-evaluation";
import { useWorkspaceStore } from "@/store/workspace-store";

export function EvaluationPageContent({ mounted }: { mounted: boolean }) {
  const storeHasHydrated = useWorkspaceStore((state) => state.hasHydrated);
  const hasHydrated =
    useWorkspaceStore.getState().hasHydrated || storeHasHydrated;

  if (!mounted || !hasHydrated) {
    return <PageHydrationLoading label="Loading evaluation..." />;
  }

  const workspace = useWorkspaceStore.getState().workspace;

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-sm text-text-muted">
        <div className="text-center">
          <p>No workspace found.</p>
          <a href="/workspace" className="mt-3 inline-flex btn-secondary text-xs">
            Back to Workspace
          </a>
        </div>
      </div>
    );
  }

  const summary = runEvaluation(workspace);

  return <EvaluationSummaryView workspace={workspace} summary={summary} />;
}
