import type { WorkspaceState } from "@/core/types";
import type { EvaluationSummary } from "@/eval/types";
import { evaluateOutcome } from "@/eval/outcome-evaluator";
import { evaluateProcess } from "@/eval/process-evaluator";
import { evaluateTraceability } from "@/eval/trace-evaluator";

export function runEvaluation(state: WorkspaceState): EvaluationSummary {
  return {
    generatedAt: new Date().toISOString(),
    outcome: evaluateOutcome(state),
    process: evaluateProcess(state),
    traceability: evaluateTraceability(state),
  };
}
