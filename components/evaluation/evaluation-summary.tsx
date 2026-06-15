import React from "react";
import type { WorkspaceState } from "@/core/types";
import type { EvaluationSummary } from "@/eval/types";
import { ControlSection } from "@/components/evaluation/control-section";
import { ExportControls } from "@/components/evaluation/export-controls";
import { OutcomeSection } from "@/components/evaluation/outcome-section";
import { ProcessSection } from "@/components/evaluation/process-section";
import { TraceSection } from "@/components/evaluation/trace-section";

export function EvaluationSummaryView({
  workspace,
  summary,
}: {
  workspace: WorkspaceState;
  summary: EvaluationSummary;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-surface-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-start md:justify-between">
          <div>
            <a
              href="/workspace"
              className="text-xs font-medium text-text-muted hover:text-accent-blue"
            >
              Back to Workspace
            </a>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
              Collaboration Evaluation
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Research &amp; Demo Console
            </p>
          </div>
          <ExportControls workspace={workspace} summary={summary} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-4">
        <section className="rounded-md border border-surface-border bg-surface-secondary p-3">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                Task
              </div>
              <div className="mt-1 text-sm font-semibold text-text-primary">
                {workspace.task.title}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                This console audits collaboration quality, control handoffs, and
                evidence chains from the current workspace state and event log.
              </p>
            </div>
            <div>
              <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                Task completed
              </div>
              <div className="mt-1 text-sm font-semibold text-text-primary">
                {summary.outcome.taskCompleted ? "Yes" : "No"}
              </div>
            </div>
            <div>
              <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                Generated at
              </div>
              <div className="mt-1 text-sm font-semibold text-text-primary">
                {summary.generatedAt}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <div className="card">
            <OutcomeSection outcome={summary.outcome} />
          </div>
          <div className="card">
            <ProcessSection process={summary.process} />
          </div>
          <div className="card">
            <ControlSection process={summary.process} />
          </div>
          <div className="card">
            <TraceSection
              traceability={summary.traceability}
              workspace={workspace}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
