import React from "react";
import type { ProcessEvaluation } from "@/eval/types";

function Metric({
  label,
  value,
  warning,
  note,
}: {
  label: string;
  value: string | number;
  warning?: boolean;
  note?: string;
}) {
  return (
    <div
      className={
        warning
          ? "rounded-md border border-accent-red/30 bg-red-50 p-2"
          : "card-sm"
      }
    >
      <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div
        className={
          warning
            ? "mt-1 text-lg font-semibold text-accent-red"
            : "mt-1 text-lg font-semibold text-text-primary"
        }
      >
        {value}
      </div>
      {note && <div className="mt-1 text-2xs text-text-muted">{note}</div>}
    </div>
  );
}

export function ControlSection({ process }: { process: ProcessEvaluation }) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Control</h2>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            Control checks unauthorized agent behavior, WAIT discipline, and
            whether human modifications were respected. WAIT is a control
            handoff, not inactivity.
          </p>
        </div>
        <span
          className={
            process.unauthorizedActionCount > 0
              ? "badge-blocked"
              : "badge-completed"
          }
        >
          {process.unauthorizedActionCount > 0 ? "Warning" : "Pass"}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <Metric
          label="Unauthorized actions"
          value={process.unauthorizedActionCount}
          warning={process.unauthorizedActionCount > 0}
          note="Rejected agent actions are counted here."
        />
        <Metric label="Wait count" value={process.waitCount} />
        <Metric label="Correct waits" value={process.correctWaitCount} />
        <Metric
          label="Human modifications respected"
          value={process.respectedHumanModification ? "Yes" : "No"}
          warning={!process.respectedHumanModification}
        />
      </div>
    </section>
  );
}
