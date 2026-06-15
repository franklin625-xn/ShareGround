export type OutcomeEvaluation = {
  taskCompleted: boolean;
  finalClaimCount: number;
  groundedFinalClaimCount: number;
  groundedClaimRate: number;
  citationIntegrityRate: number;
  missingCitationIds: string[];
};

export type ProcessEvaluation = {
  agentActionCount: number;
  humanActionCount: number;
  humanRevisionCount: number;
  contestedClaimCount: number;
  humanOverrideRate: number;
  humanRequestCount: number;
  answeredHumanRequestCount: number;
  effectiveHumanRequestRate: number;
  waitCount: number;
  correctWaitCount: number;
  unauthorizedActionCount: number;
  respectedHumanModification: boolean;
};

export type TraceEvaluationItem = {
  claimId: string;
  hasSource: boolean;
  hasEvidence: boolean;
  hasHumanDecision: boolean;
  referencedInBrief: boolean;
  complete: boolean;
};

export type TraceEvaluation = {
  items: TraceEvaluationItem[];
  completeTraceCount: number;
  totalTraceCount: number;
  completeTraceRate: number;
};

export type EvalRuleResult = {
  ruleId: string;
  passed: boolean;
  score: number;
  explanation: string;
  relatedEventIds: string[];
};

export type EvaluationSummary = {
  generatedAt: string;
  outcome: OutcomeEvaluation;
  process: ProcessEvaluation;
  traceability: TraceEvaluation;
};
