"use client";

import React from "react";
import { EvaluationSummaryView } from "@/components/evaluation/evaluation-summary";
import { runEvaluation } from "@/eval/run-evaluation";
import { useWorkspaceStore } from "@/store/workspace-store";

export default function EvaluationPage() {
  const storeWorkspace = useWorkspaceStore((state) => state.workspace);
  const workspace = useWorkspaceStore.getState().workspace ?? storeWorkspace;

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
