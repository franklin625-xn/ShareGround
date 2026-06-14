import { describe, expect, it } from "vitest";
import { canApplyWorkspaceAction } from "@/core/permissions";
import type { WorkspaceAction } from "@/core/schemas";

const updateClaimToFinal: WorkspaceAction = {
  type: "UPDATE_CLAIM",
  payload: { claimId: "claim-1", status: "final" },
  reason: "Attempt to finalize.",
};

const updateClaimToHumanConfirmed: WorkspaceAction = {
  type: "UPDATE_CLAIM",
  payload: { claimId: "claim-1", status: "human_confirmed" },
  reason: "Attempt to confirm.",
};

describe("canApplyWorkspaceAction", () => {
  it("allows an agent to propose a claim", () => {
    const action: WorkspaceAction = {
      type: "PROPOSE_CLAIM",
      payload: {
        statement: "EU policy increases localization pressure.",
        reasoning: "Policy support is linked to local production capacity.",
        supportingEvidenceIds: ["evidence-1"],
        counterEvidenceIds: [],
        confidence: 0.7,
      },
      reason: "The evidence supports a preliminary claim.",
    };

    expect(canApplyWorkspaceAction("agent", action).allowed).toBe(true);
  });

  it("rejects an agent finalizing a claim", () => {
    const result = canApplyWorkspaceAction("agent", updateClaimToFinal);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Agent cannot set claim status to final");
  });

  it("rejects an agent confirming a claim as human", () => {
    const result = canApplyWorkspaceAction("agent", updateClaimToHumanConfirmed);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain(
      "Agent cannot set claim status to human_confirmed",
    );
  });

  it("allows a human to finalize a claim", () => {
    expect(canApplyWorkspaceAction("human", updateClaimToFinal).allowed).toBe(
      true,
    );
  });

  it("rejects an agent answering human input", () => {
    const action: WorkspaceAction = {
      type: "ANSWER_HUMAN_INPUT",
      payload: { requestId: "request-1", answer: "Focus on EV batteries." },
      reason: "Answer request.",
    };

    expect(canApplyWorkspaceAction("agent", action).allowed).toBe(false);
  });
});
