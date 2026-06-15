"use client";

import React from "react";
import type { AgentStatus as AgentStatusType } from "@/core/types";

const statusConfig: Record<
  AgentStatusType,
  { label: string; className: string }
> = {
  idle: { label: "Idle", className: "badge-idle" },
  working: { label: "Working…", className: "badge-working" },
  waiting_for_human: {
    label: "Waiting for Human",
    className: "badge-waiting",
  },
  blocked: { label: "Blocked", className: "badge-blocked" },
  completed: { label: "Completed", className: "badge-completed" },
};

export function AgentStatus({ status }: { status: AgentStatusType }) {
  const cfg = statusConfig[status] ?? statusConfig.idle;
  return (
    <span className={cfg.className} title={`Agent status: ${cfg.label}`}>
      {cfg.label}
    </span>
  );
}
