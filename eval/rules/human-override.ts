import type { Claim, WorkspaceEvent, WorkspaceState } from "@/core/types";

export type HumanOverrideResult = {
  humanRevisionCount: number;
  contestedClaimCount: number;
  humanOverrideRate: number;
};

function eventStatus(event: WorkspaceEvent): unknown {
  return event.after && typeof event.after === "object" && "status" in event.after
    ? (event.after as { status?: unknown }).status
    : undefined;
}

function isAgentClaim(claim: Claim | undefined): boolean {
  return claim?.createdBy === "agent";
}

export function evaluateHumanOverride(
  state: WorkspaceState,
): HumanOverrideResult {
  const claimsById = new Map(state.claims.map((claim) => [claim.id, claim]));
  const revisedClaimIds = new Set<string>();
  const contestedClaimIds = new Set<string>();

  for (const claim of state.claims) {
    if (isAgentClaim(claim) && claim.status === "human_revised") {
      revisedClaimIds.add(claim.id);
    }
    if (isAgentClaim(claim) && claim.status === "contested") {
      contestedClaimIds.add(claim.id);
    }
  }

  for (const event of state.events) {
    const claim = event.objectId ? claimsById.get(event.objectId) : undefined;
    if (!isAgentClaim(claim)) continue;

    if (
      event.actor === "human" &&
      event.actionType === "UPDATE_CLAIM" &&
      eventStatus(event) === "human_revised"
    ) {
      revisedClaimIds.add(event.objectId!);
    }

    if (event.actor === "human" && event.actionType === "CHALLENGE_CLAIM") {
      contestedClaimIds.add(event.objectId!);
    }
  }

  const aiProposedClaimCount = state.claims.filter(isAgentClaim).length;
  const revisedOrContestedIds = new Set([
    ...revisedClaimIds,
    ...contestedClaimIds,
  ]);

  return {
    humanRevisionCount: revisedClaimIds.size,
    contestedClaimCount: contestedClaimIds.size,
    humanOverrideRate:
      revisedOrContestedIds.size / Math.max(aiProposedClaimCount, 1),
  };
}
