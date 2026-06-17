"use client";

import React from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { AgentMode } from "@/store/workspace-store";
import type { AgentRunStatus, HumanInputRequest } from "@/core/types";
import {
  focusHumanRequestComposer,
  HumanRequestShortcutButton,
} from "@/components/agent/human-input-request";

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

function StatusBadge({
  status,
  onClick,
}: {
  status: AgentRunStatus;
  onClick?: () => void;
}) {
  const config: Record<AgentRunStatus, { label: string; className: string }> = {
    idle: { label: "Idle", className: "badge-idle" },
    running: { label: "Running", className: "badge-working" },
    applying: { label: "Applying…", className: "badge-working" },
    paused: { label: "Paused", className: "badge-blocked" },
    waiting_for_human: { label: "Waiting for Human", className: "badge-waiting" },
    completed: { label: "Completed", className: "badge-completed" },
    error: { label: "Error", className: "badge-blocked" },
  };

  const c = config[status] ?? config.idle;
  if (onClick) {
    return (
      <button
        type="button"
        className={c.className}
        title={`Agent status: ${c.label}. Focus pending human request.`}
        onClick={onClick}
      >
        {c.label}
      </button>
    );
  }

  return (
    <span className={c.className} title={`Agent status: ${c.label}`}>
      {c.label}
    </span>
  );
}

export function AgentControlBarView({
  status,
  completed,
  agentMode,
  error,
  currentGoal,
  latestAction,
  pendingHumanRequest,
  onStartAgent,
  onPauseAgent,
  onResumeAgent,
}: {
  status: AgentRunStatus;
  completed: boolean;
  agentMode: AgentMode;
  error: string | null;
  currentGoal?: string;
  latestAction?: string;
  pendingHumanRequest?: HumanInputRequest;
  onStartAgent: () => void;
  onPauseAgent: () => void;
  onResumeAgent: () => void;
}) {
  const hasOpenHumanRequest = pendingHumanRequest?.status === "open";

  const isRunning = status === "running" || status === "applying";
  const isPaused = status === "paused";
  const isWaiting = status === "waiting_for_human" || hasOpenHumanRequest;
  const isCompleted = status === "completed" || completed;
  const isIdle = status === "idle";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ModeBadge mode={agentMode} />
      <StatusBadge
        status={hasOpenHumanRequest ? "waiting_for_human" : status}
        onClick={hasOpenHumanRequest ? focusHumanRequestComposer : undefined}
      />

      {/* Start */}
      {(isIdle || isCompleted) && (
        <button
          type="button"
          onClick={onStartAgent}
          className="btn-primary text-xs"
          title="Start agent research"
        >
          ▶ Start
        </button>
      )}

      {/* Pause */}
      {isRunning && (
        <button
          type="button"
          onClick={onPauseAgent}
          className="btn-ghost px-2 py-1 text-xs border border-surface-border"
          title="Pause agent execution"
        >
          ⏸ Pause
        </button>
      )}

      {/* Resume */}
      {isPaused && (
        <button
          type="button"
          onClick={onResumeAgent}
          className="btn-primary text-xs"
          title="Resume agent from latest state"
        >
          ▶ Resume
        </button>
      )}

      {/* Waiting state */}
      {hasOpenHumanRequest && <HumanRequestShortcutButton />}

      {isWaiting && !hasOpenHumanRequest && (
        <span className="text-2xs text-text-muted italic">
          Waiting for your input…
        </span>
      )}

      {/* Running spinner */}
      {isRunning && (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}

      {/* Current goal */}
      {currentGoal && isRunning && (
        <span className="text-2xs text-text-muted truncate max-w-[200px]">
          {currentGoal}
        </span>
      )}

      {/* Latest action summary */}
      {latestAction && !isRunning && (
        <span className="text-2xs text-text-muted truncate max-w-[200px]">
          {latestAction}
        </span>
      )}

      {/* Error */}
      {error && (
        <span className="text-2xs text-red-400 truncate max-w-[200px]" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}

export function AgentControlBar() {
  const startAgent = useWorkspaceStore((s) => s.startAgent);
  const pauseAgent = useWorkspaceStore((s) => s.pauseAgent);
  const resumeAgent = useWorkspaceStore((s) => s.resumeAgent);
  const completed = useWorkspaceStore((s) => s.workspace.completed);
  const agentControl = useWorkspaceStore((s) => s.workspace.agentControl);
  const pendingHumanRequest = useWorkspaceStore(
    (s) => s.workspace.pendingHumanRequest,
  );
  const agentMode = useWorkspaceStore((s) => s.agentMode);
  const error = useWorkspaceStore((s) => s.agentError);

  return (
    <AgentControlBarView
      status={agentControl.status}
      completed={completed}
      agentMode={agentMode}
      error={error}
      currentGoal={agentControl.currentGoal}
      latestAction={agentControl.latestActionSummary}
      pendingHumanRequest={pendingHumanRequest}
      onStartAgent={startAgent}
      onPauseAgent={pauseAgent}
      onResumeAgent={resumeAgent}
    />
  );
}
