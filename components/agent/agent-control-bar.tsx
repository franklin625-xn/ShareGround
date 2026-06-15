"use client";

import React from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { AgentMode } from "@/store/workspace-store";

function ModeBadge({ mode }: { mode: AgentMode }) {
  if (mode === "idle") return null;

  const config: Record<AgentMode, { label: string; className: string }> = {
    idle: { label: "", className: "" },
    mock: { label: "Mock", className: "badge-idle" },
    real: { label: "Real", className: "status-final" },
    fallback: { label: "Fallback", className: "badge-blocked" },
  };

  const c = config[mode];
  return <span className={c.className}>{c.label}</span>;
}

export function AgentControlBar() {
  const runAgent = useWorkspaceStore((s) => s.runAgent);
  const completed = useWorkspaceStore((s) => s.workspace.completed);
  const agentRunning = useWorkspaceStore((s) => s.agentRunning);
  const agentMode = useWorkspaceStore((s) => s.agentMode);

  return (
    <div className="flex items-center gap-2">
      <ModeBadge mode={agentMode} />
      <button
        type="button"
        disabled={completed || agentRunning}
        onClick={runAgent}
        className={
          completed || agentRunning
            ? "btn-disabled text-xs"
            : "btn-primary text-xs"
        }
        title={
          agentRunning
            ? "Agent is running..."
            : "Run the research agent"
        }
      >
        {agentRunning ? (
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Running…
          </span>
        ) : (
          "▶ Run Agent"
        )}
      </button>
    </div>
  );
}
