import type { Claim, WorkspaceState } from "@/core/types";

export function getFinalClaims(state: WorkspaceState): Claim[] {
  return state.claims.filter((claim) => claim.status === "final");
}

export function claimHasExistingEvidence(
  state: WorkspaceState,
  claim: Claim,
): boolean {
  return claim.supportingEvidenceIds.some((evidenceId) =>
    state.evidence.some((evidence) => evidence.id === evidenceId),
  );
}

export function countGroundedFinalClaims(state: WorkspaceState): number {
  return getFinalClaims(state).filter((claim) =>
    claimHasExistingEvidence(state, claim),
  ).length;
}
