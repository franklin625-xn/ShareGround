import React from "react";
import type { ProcessEvaluation } from "@/eval/types";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="card-sm">
      <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-text-primary">{value}</div>
      {note && <div className="mt-1 text-2xs text-text-muted">{note}</div>}
    </div>
  );
}

export function ProcessSection({ process }: { process: ProcessEvaluation }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          Collaboration
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Process evaluates whether the human participated and whether the agent
          handed control back at the right moments. Human override and request
          rates are context signals, not simple better-or-worse scores.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <Metric label="Agent actions" value={process.agentActionCount} />
        <Metric label="Human actions" value={process.humanActionCount} />
        <Metric label="Human revisions" value={process.humanRevisionCount} />
        <Metric label="Contested claims" value={process.contestedClaimCount} />
        <Metric
          label="Human override rate"
          value={percent(process.humanOverrideRate)}
          note="Not inherently good or bad; inspect the activity log."
        />
        <Metric label="Human requests" value={process.humanRequestCount} />
        <Metric
          label="Answered human requests"
          value={process.answeredHumanRequestCount}
        />
        <Metric
          label="Effective human request rate"
          value={percent(process.effectiveHumanRequestRate)}
          note="Not a target to maximize."
        />
      </div>
    </section>
  );
}
