import { beforeEach, describe, expect, it } from "vitest";
import { resetEventCounterForTests } from "@/core/event-factory";
import { applyWorkspaceAction } from "@/core/reducer";
import type { WorkspaceState } from "@/core/types";

function createState(): WorkspaceState {
  return {
    task: {
      id: "task-1",
      title: "EU industrial policy and Chinese investment",
      question:
        "How do EU industrial policy changes affect Chinese companies investing in Europe?",
      scope: "Demo research brief",
      sourceMode: "demo_corpus",
      createdAt: "2026-06-15T00:00:00.000Z",
    },
    sources: [
      {
        id: "source-1",
        title: "Net-Zero Industry Act",
        publisher: "European Commission",
        summary:
          "EU policy aims to expand clean technology manufacturing capacity.",
        addedBy: "system",
        createdAt: "2026-06-15T00:00:00.000Z",
      },
    ],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        quoteOrFinding:
          "The EU links public support to local manufacturing capacity.",
        relevance: "Shows localization pressure.",
        addedBy: "system",
        createdAt: "2026-06-15T00:00:00.000Z",
      },
    ],
    notes: [],
    claims: [],
    brief: {
      markdown: "",
      updatedBy: "system",
      updatedAt: "2026-06-15T00:00:00.000Z",
    },
    events: [],
    agentStatus: "idle",
    completed: false,
  };
}

describe("applyWorkspaceAction", () => {
  beforeEach(() => {
    resetEventCounterForTests();
  });

  it("lets an agent propose a claim and writes an event", () => {
    const next = applyWorkspaceAction(
      createState(),
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Support schemes and regulatory tools favor local capacity.",
          supportingEvidenceIds: ["evidence-1"],
          counterEvidenceIds: [],
          confidence: 0.74,
        },
        reason: "Evidence supports a preliminary claim.",
      },
      "agent",
    );

    expect(next.claims).toHaveLength(1);
    expect(next.claims[0]?.status).toBe("ai_proposed");
    expect(next.events[0]?.actionType).toBe("PROPOSE_CLAIM");
    expect(next.events[0]?.actor).toBe("agent");
  });

  it("rejects an agent finalizing a claim and writes ACTION_REJECTED", () => {
    const withClaim = applyWorkspaceAction(
      createState(),
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Support schemes and regulatory tools favor local capacity.",
          supportingEvidenceIds: ["evidence-1"],
          counterEvidenceIds: [],
        },
        reason: "Evidence supports a preliminary claim.",
      },
      "agent",
    );

    const next = applyWorkspaceAction(
      withClaim,
      {
        type: "UPDATE_CLAIM",
        payload: { claimId: withClaim.claims[0]!.id, status: "final" },
        reason: "Agent tries to finalize.",
      },
      "agent",
    );

    expect(next.claims[0]?.status).toBe("ai_proposed");
    expect(next.events.at(-1)?.actionType).toBe("ACTION_REJECTED");
    expect(next.events.at(-1)?.summary).toContain(
      "Agent cannot set claim status to final",
    );
  });

  it("lets a human revise a claim", () => {
    const withClaim = applyWorkspaceAction(
      createState(),
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Support schemes and regulatory tools favor local capacity.",
          supportingEvidenceIds: ["evidence-1"],
          counterEvidenceIds: [],
        },
        reason: "Evidence supports a preliminary claim.",
      },
      "agent",
    );

    const next = applyWorkspaceAction(
      withClaim,
      {
        type: "UPDATE_CLAIM",
        payload: {
          claimId: withClaim.claims[0]!.id,
          statement:
            "EU policy increases localization pressure, with effects varying by sector.",
          status: "human_revised",
          humanDecisionNote: "Narrow the claim by sector.",
        },
        reason: "Human narrows the judgment.",
      },
      "human",
    );

    expect(next.claims[0]?.status).toBe("human_revised");
    expect(next.claims[0]?.statement).toContain("varying by sector");
    expect(next.events.at(-1)?.actor).toBe("human");
  });

  it("sets waiting status when agent requests human input", () => {
    const next = applyWorkspaceAction(
      createState(),
      {
        type: "REQUEST_HUMAN_INPUT",
        payload: {
          question: "Should the brief focus on EV batteries or semiconductors?",
          relatedObjectIds: [],
        },
        reason: "Direction choice belongs to human.",
      },
      "agent",
    );

    expect(next.agentStatus).toBe("waiting_for_human");
    expect(next.pendingHumanRequest?.status).toBe("open");
  });

  it("keeps state stable when agent waits", () => {
    const state = createState();
    const next = applyWorkspaceAction(
      state,
      {
        type: "WAIT",
        payload: { waitingFor: "Human direction." },
        reason: "Open request exists.",
      },
      "agent",
    );

    expect(next.sources).toEqual(state.sources);
    expect(next.events[0]?.actionType).toBe("WAIT");
  });

  it("lets human answer an open request and returns agent to idle", () => {
    const waiting = applyWorkspaceAction(
      createState(),
      {
        type: "REQUEST_HUMAN_INPUT",
        payload: {
          question: "Should the brief focus on EV batteries or semiconductors?",
          relatedObjectIds: [],
        },
        reason: "Direction choice belongs to human.",
      },
      "agent",
    );

    const next = applyWorkspaceAction(
      waiting,
      {
        type: "ANSWER_HUMAN_INPUT",
        payload: {
          requestId: waiting.pendingHumanRequest!.id,
          answer: "Focus on EV batteries.",
        },
        reason: "Human chooses focus.",
      },
      "human",
    );

    expect(next.agentStatus).toBe("idle");
    expect(next.pendingHumanRequest?.status).toBe("answered");
    expect(next.pendingHumanRequest?.answer).toBe("Focus on EV batteries.");
  });
});
