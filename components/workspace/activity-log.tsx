"use client";

import React from "react";
import type { WorkspaceEvent } from "@/core/types";

const actorClass: Record<string, string> = {
  human: "actor-human",
  agent: "actor-agent",
  system: "actor-system",
};

export function ActivityLog({ events }: { events: WorkspaceEvent[] }) {
  return (
    <section className="p-3">
      <h3 className="panel-title">Activity Log ({events.length})</h3>
      <div className="space-y-1">
        {events.length === 0 && (
          <p className="text-xs text-text-muted italic">
            No activity yet. Actions will appear here as the workspace changes.
          </p>
        )}
        {[...events].reverse().map((evt) => (
          <div
            key={evt.id}
            className={`card-sm ${
              evt.actionType === "ACTION_REJECTED"
                ? "border-accent-red/30 bg-red-50/50"
                : ""
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={actorClass[evt.actor] || "actor-system"}>
                {evt.actor}
              </span>
              <span className="text-2xs font-mono text-text-muted">
                {evt.actionType}
              </span>
              <span className="ml-auto text-2xs text-text-muted shrink-0">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-0.5 text-2xs text-text-secondary leading-snug">
              {evt.summary}
            </p>
            {evt.reason && (
              <p className="text-2xs text-text-muted italic mt-0.5">
                {evt.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
