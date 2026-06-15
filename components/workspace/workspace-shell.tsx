"use client";

import React from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { SourcesPanel } from "@/components/workspace/sources-panel";
import { NotesPanel } from "@/components/workspace/notes-panel";
import { ClaimsPanel } from "@/components/workspace/claims-panel";
import { BriefEditor } from "@/components/workspace/brief-editor";
import { ActivityLog } from "@/components/workspace/activity-log";
import { AgentControlBar } from "@/components/agent/agent-control-bar";
import { AgentStatus } from "@/components/agent/agent-status";
import { HumanInputRequest } from "@/components/agent/human-input-request";
import { buildFinishTaskAction } from "@/core/human-actions";
import type { WorkspaceAction } from "@/core/schemas";

export function WorkspaceShell() {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const reset = useWorkspaceStore((s) => s.reset);
  const applyAction = useWorkspaceStore((s) => s.applyAction);
  const agentError = useWorkspaceStore((s) => s.agentError);
  const applyHumanAction = (action: WorkspaceAction) => {
    applyAction(action, "human");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-surface-border px-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary"
          >
            SharedGround
          </a>
          <span className="text-text-muted">/</span>
          <h1 className="truncate text-sm font-semibold text-text-primary">
            {workspace.task.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AgentStatus status={workspace.agentStatus} />
          <AgentControlBar />
          <button
            type="button"
            onClick={() => applyHumanAction(buildFinishTaskAction())}
            className={
              workspace.completed
                ? "btn-disabled text-xs"
                : "btn-secondary text-xs"
            }
            disabled={workspace.completed}
          >
            {workspace.completed ? "Completed" : "Complete Task"}
          </button>
          <a href="/evaluation" className="btn-ghost text-xs">
            View Evaluation
          </a>
          <button
            onClick={() => {
              if (window.confirm("Reset workspace? All progress will be lost.")) {
                reset();
              }
            }}
            className="btn-ghost text-xs"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Agent Error / Fallback Banner */}
      {agentError && (
        <div className="border-b border-accent-red/30 bg-red-50 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-accent-red text-sm">✕</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-accent-red">
                Agent Fallback — {agentError}
              </p>
              {agentError.includes("Fell back") && (
                <p className="text-2xs text-accent-red/70 mt-0.5">
                  The mock agent was used instead. The output below is the
                  pre-built EU demo trajectory, not a response to your task.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Human Request Banner */}
      {workspace.pendingHumanRequest &&
        workspace.pendingHumanRequest.status === "open" && (
          <HumanInputRequest
            request={workspace.pendingHumanRequest}
            onAction={applyHumanAction}
          />
        )}

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Sources + Evidence + Notes */}
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-surface-border bg-surface-secondary">
          <div className="space-y-1 p-3">
            <SourcesPanel
              sources={workspace.sources}
              evidence={workspace.evidence}
              onAction={applyHumanAction}
            />
            <NotesPanel
              notes={workspace.notes}
              sources={workspace.sources}
              evidence={workspace.evidence}
              onAction={applyHumanAction}
            />
          </div>
        </aside>

        {/* Center Column: Claims + Brief */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <ClaimsPanel
              claims={workspace.claims}
              evidence={workspace.evidence}
              onAction={applyHumanAction}
            />
            <BriefEditor
              markdown={workspace.brief.markdown}
              updatedBy={workspace.brief.updatedBy}
              updatedAt={workspace.brief.updatedAt}
              onAction={applyHumanAction}
            />
          </div>
        </main>

        {/* Right Column: Activity Log */}
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-surface-border bg-surface-secondary">
          <ActivityLog events={workspace.events} />
        </aside>
      </div>
    </div>
  );
}
