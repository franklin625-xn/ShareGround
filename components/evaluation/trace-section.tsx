import React from "react";
import type { WorkspaceState } from "@/core/types";
import type { TraceEvaluation, TraceEvaluationItem } from "@/eval/types";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function CheckRow({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-surface-border py-1.5 text-xs">
      <span className="text-text-secondary">{label}</span>
      <span className={pass ? "badge-completed" : "badge-waiting"}>
        {pass ? "Pass" : "Warning"}
      </span>
    </div>
  );
}

function TraceItemCard({
  item,
  workspace,
}: {
  item: TraceEvaluationItem;
  workspace: WorkspaceState;
}) {
  const claim = workspace.claims.find((candidate) => candidate.id === item.claimId);

  return (
    <article className="card-sm space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            {item.claimId}
          </div>
          <p className="mt-1 text-sm font-medium leading-snug text-text-primary">
            {claim?.statement ?? "Claim not found"}
          </p>
        </div>
        <span className={item.complete ? "badge-completed" : "badge-waiting"}>
          {item.complete ? "Complete" : "Incomplete"}
        </span>
      </div>
      <div className="rounded-md border border-surface-border bg-surface-secondary px-2">
        <CheckRow label="Source" pass={item.hasSource} />
        <CheckRow label="Evidence" pass={item.hasEvidence} />
        <CheckRow label="Human Decision" pass={item.hasHumanDecision} />
        <CheckRow label="Referenced in Brief" pass={item.referencedInBrief} />
        <CheckRow label="Complete" pass={item.complete} />
      </div>
    </article>
  );
}

export function TraceSection({
  traceability,
  workspace,
}: {
  traceability: TraceEvaluation;
  workspace: WorkspaceState;
}) {
  const completeRate =
    traceability.totalTraceCount === 0
      ? "No final claims"
      : percent(traceability.completeTraceRate);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          Traceability
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Each final claim is checked for a complete Source to Evidence to Claim
          to Human Decision to Final Brief chain.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="card-sm">
          <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            Complete evidence chains
          </div>
          <div className="mt-1 text-lg font-semibold text-text-primary">
            {traceability.completeTraceCount}
          </div>
        </div>
        <div className="card-sm">
          <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            Total final claims
          </div>
          <div className="mt-1 text-lg font-semibold text-text-primary">
            {traceability.totalTraceCount}
          </div>
        </div>
        <div className="card-sm">
          <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            Complete trace rate
          </div>
          <div className="mt-1 text-lg font-semibold text-text-primary">
            {completeRate}
          </div>
        </div>
      </div>

      {traceability.items.length === 0 ? (
        <div className="rounded-md border border-dashed border-surface-border bg-surface-secondary p-4">
          <p className="text-sm font-medium text-text-primary">
            No final claims are available for traceability evaluation yet.
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Complete the collaboration flow in the workspace first.
          </p>
          <a href="/workspace" className="btn-secondary mt-3 text-xs">
            Back to Workspace
          </a>
        </div>
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          {traceability.items.map((item) => (
            <TraceItemCard key={item.claimId} item={item} workspace={workspace} />
          ))}
        </div>
      )}
    </section>
  );
}
