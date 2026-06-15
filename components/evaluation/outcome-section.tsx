import React from "react";
import type { OutcomeEvaluation } from "@/eval/types";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function statusClass(kind: "pass" | "warning" | "fail") {
  if (kind === "pass") return "badge-completed";
  if (kind === "warning") return "badge-waiting";
  return "badge-blocked";
}

function StatusBadge({
  kind,
  label,
}: {
  kind: "pass" | "warning" | "fail";
  label: string;
}) {
  return <span className={statusClass(kind)}>{label}</span>;
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

export function OutcomeSection({ outcome }: { outcome: OutcomeEvaluation }) {
  const groundedRate =
    outcome.finalClaimCount === 0
      ? "No final claims"
      : percent(outcome.groundedClaimRate);

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Outcome</h2>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            Outcome evaluates whether the final work is delivered, evidence-backed,
            and tied to real citations.
          </p>
        </div>
        <StatusBadge
          kind={outcome.taskCompleted ? "pass" : "warning"}
          label={outcome.taskCompleted ? "Pass" : "Warning"}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Metric
          label="Task completed"
          value={outcome.taskCompleted ? "Yes" : "No"}
        />
        <Metric label="Final claims" value={outcome.finalClaimCount} />
        <Metric
          label="Grounded final claims"
          value={outcome.groundedFinalClaimCount}
        />
        <Metric label="Grounded claim rate" value={groundedRate} />
        <Metric
          label="Citation integrity"
          value={percent(outcome.citationIntegrityRate)}
          note="Checks brief citations, claim evidence IDs, and evidence source IDs."
        />
        <div className="card-sm">
          <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            Missing citation IDs
          </div>
          {outcome.missingCitationIds.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {outcome.missingCitationIds.map((id) => (
                <span key={id} className="badge-blocked">
                  {id}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-sm font-medium text-text-primary">None</div>
          )}
        </div>
      </div>
    </section>
  );
}
