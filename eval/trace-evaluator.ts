import type { Claim, WorkspaceState } from "@/core/types";
import type { TraceEvaluation, TraceEvaluationItem } from "@/eval/types";
import { getFinalClaims } from "@/eval/rules/evidence-grounding";
import {
  extractBriefCitationIds,
  resolveCitationId,
} from "@/eval/rules/citation-resolver";

function briefReferencesClaim(state: WorkspaceState, claim: Claim): boolean {
  return extractBriefCitationIds(state.brief.markdown).some(
    (citationId) => resolveCitationId(state, citationId) === claim.id,
  );
}

function hasHumanDecisionEvent(state: WorkspaceState, claim: Claim): boolean {
  return state.events.some(
    (event) =>
      event.actor === "human" &&
      event.objectType === "claim" &&
      event.objectId === claim.id &&
      (event.actionType === "UPDATE_CLAIM" ||
        event.actionType === "CHALLENGE_CLAIM"),
  );
}

function evaluateTraceItem(
  state: WorkspaceState,
  claim: Claim,
): TraceEvaluationItem {
  const supportingEvidence = claim.supportingEvidenceIds
    .map((evidenceId) =>
      state.evidence.find((evidence) => evidence.id === evidenceId),
    )
    .filter(Boolean);
  const hasEvidence = supportingEvidence.length > 0;
  const hasSource = supportingEvidence.some((evidence) =>
    state.sources.some((source) => source.id === evidence!.sourceId),
  );
  const hasHumanDecision = hasHumanDecisionEvent(state, claim);
  const referencedInBrief = briefReferencesClaim(state, claim);
  const complete =
    claim.status === "final" &&
    hasEvidence &&
    hasSource &&
    hasHumanDecision &&
    referencedInBrief;

  return {
    claimId: claim.id,
    hasSource,
    hasEvidence,
    hasHumanDecision,
    referencedInBrief,
    complete,
  };
}

export function evaluateTraceability(state: WorkspaceState): TraceEvaluation {
  const items = getFinalClaims(state).map((claim) =>
    evaluateTraceItem(state, claim),
  );
  const completeTraceCount = items.filter((item) => item.complete).length;

  return {
    items,
    completeTraceCount,
    totalTraceCount: items.length,
    completeTraceRate: completeTraceCount / Math.max(items.length, 1),
  };
}
