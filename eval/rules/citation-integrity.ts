import type { WorkspaceState } from "@/core/types";
import {
  extractBriefCitationIds,
  resolveCitationId,
} from "@/eval/rules/citation-resolver";

export type CitationIntegrityResult = {
  rate: number;
  missingCitationIds: string[];
};

function buildKnownIds(state: WorkspaceState): Set<string> {
  return new Set([
    state.task.id,
    "brief",
    ...state.sources.map((source) => source.id),
    ...state.evidence.map((evidence) => evidence.id),
    ...state.notes.map((note) => note.id),
    ...state.claims.map((claim) => claim.id),
    ...(state.pendingHumanRequest ? [state.pendingHumanRequest.id] : []),
  ]);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function evaluateCitationIntegrity(
  state: WorkspaceState,
): CitationIntegrityResult {
  const knownIds = buildKnownIds(state);
  const checks: { id: string; valid: boolean }[] = [];

  for (const citationId of extractBriefCitationIds(state.brief.markdown)) {
    const resolvedId = resolveCitationId(state, citationId);
    checks.push({
      id: citationId,
      valid: resolvedId !== undefined && knownIds.has(resolvedId),
    });
  }

  for (const claim of state.claims) {
    for (const evidenceId of [
      ...claim.supportingEvidenceIds,
      ...claim.counterEvidenceIds,
    ]) {
      checks.push({
        id: evidenceId,
        valid: state.evidence.some((evidence) => evidence.id === evidenceId),
      });
    }
  }

  for (const evidence of state.evidence) {
    checks.push({
      id: evidence.sourceId,
      valid: state.sources.some((source) => source.id === evidence.sourceId),
    });
  }

  if (checks.length === 0) {
    return { rate: 1, missingCitationIds: [] };
  }

  const missingCitationIds = unique(
    checks.filter((check) => !check.valid).map((check) => check.id),
  );
  const validCheckCount = checks.filter((check) => check.valid).length;

  return {
    rate: validCheckCount / checks.length,
    missingCitationIds,
  };
}
