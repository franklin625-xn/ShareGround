import { describe, expect, it } from "vitest";
import { runEvaluation } from "@/eval/run-evaluation";
import type { WorkspaceEvent, WorkspaceState } from "@/core/types";

function event(
  id: string,
  input: Omit<WorkspaceEvent, "id" | "timestamp" | "summary"> & {
    summary?: string;
  },
): WorkspaceEvent {
  return {
    id,
    timestamp: "2026-06-15T00:00:00.000Z",
    summary: input.summary ?? input.actionType,
    ...input,
  };
}

function baseWorkspace(): WorkspaceState {
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
        summary: "EU policy aims to expand clean technology manufacturing.",
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
    claims: [
      {
        id: "claim-1",
        statement: "EU policy increases localization pressure.",
        reasoning: "Support schemes favor local manufacturing.",
        supportingEvidenceIds: ["evidence-1"],
        counterEvidenceIds: [],
        confidence: 0.8,
        status: "final",
        createdBy: "agent",
        createdAt: "2026-06-15T00:00:00.000Z",
        updatedAt: "2026-06-15T00:00:00.000Z",
        humanDecisionNote: "Final after human review.",
      },
    ],
    brief: {
      markdown: "Final brief cites [claim-1] and [evidence-1].",
      updatedBy: "human",
      updatedAt: "2026-06-15T00:00:00.000Z",
    },
    events: [
      event("event-0001", {
        actor: "agent",
        actionType: "PROPOSE_CLAIM",
        objectType: "claim",
        objectId: "claim-1",
      }),
      event("event-0002", {
        actor: "human",
        actionType: "UPDATE_CLAIM",
        objectType: "claim",
        objectId: "claim-1",
        after: {
          id: "claim-1",
          status: "final",
          humanDecisionNote: "Final after human review.",
        },
      }),
    ],
    agentStatus: "completed",
    completed: true,
  };
}

describe("runEvaluation", () => {
  it("calculates complete outcome and traceability for a grounded final claim", () => {
    const summary = runEvaluation(baseWorkspace());

    expect(summary.outcome).toMatchObject({
      taskCompleted: true,
      finalClaimCount: 1,
      groundedFinalClaimCount: 1,
      groundedClaimRate: 1,
      citationIntegrityRate: 1,
      missingCitationIds: [],
    });
    expect(summary.traceability).toMatchObject({
      completeTraceCount: 1,
      totalTraceCount: 1,
      completeTraceRate: 1,
    });
    expect(summary.traceability.items[0]).toMatchObject({
      claimId: "claim-1",
      hasSource: true,
      hasEvidence: true,
      hasHumanDecision: true,
      referencedInBrief: true,
      complete: true,
    });
  });

  it("lowers grounded rate when a final claim has no evidence", () => {
    const workspace = baseWorkspace();
    workspace.claims[0] = {
      ...workspace.claims[0]!,
      supportingEvidenceIds: [],
    };

    const summary = runEvaluation(workspace);

    expect(summary.outcome.finalClaimCount).toBe(1);
    expect(summary.outcome.groundedFinalClaimCount).toBe(0);
    expect(summary.outcome.groundedClaimRate).toBe(0);
  });

  it("marks trace incomplete when evidence references a missing source", () => {
    const workspace = baseWorkspace();
    workspace.evidence[0] = {
      ...workspace.evidence[0]!,
      sourceId: "missing-source",
    };

    const summary = runEvaluation(workspace);

    expect(summary.traceability.items[0]).toMatchObject({
      claimId: "claim-1",
      hasEvidence: true,
      hasSource: false,
      complete: false,
    });
  });

  it("lowers citation integrity when the brief references a missing ID", () => {
    const workspace = baseWorkspace();
    workspace.brief.markdown =
      "Final brief cites [claim-1], [evidence-1], and [missing-evidence].";

    const summary = runEvaluation(workspace);

    expect(summary.outcome.missingCitationIds).toContain("missing-evidence");
    expect(summary.outcome.citationIntegrityRate).toBeLessThan(1);
  });

  it("treats C/E index citations as references to existing claims and evidence", () => {
    const workspace = baseWorkspace();
    workspace.brief.markdown = "Final brief cites [C1] and [E1].";

    const summary = runEvaluation(workspace);

    expect(summary.outcome.citationIntegrityRate).toBe(1);
    expect(summary.outcome.missingCitationIds).toEqual([]);
    expect(summary.traceability.items[0]?.referencedInBrief).toBe(true);
  });

  it("counts human revisions and contested AI claims", () => {
    const workspace = baseWorkspace();
    workspace.claims.push({
      id: "claim-2",
      statement: "EVs face the strongest pressure.",
      reasoning: "Tariffs and battery rules are most direct.",
      supportingEvidenceIds: ["evidence-1"],
      counterEvidenceIds: [],
      confidence: 0.7,
      status: "human_revised",
      createdBy: "agent",
      createdAt: "2026-06-15T00:00:00.000Z",
      updatedAt: "2026-06-15T00:00:00.000Z",
    });
    workspace.claims.push({
      id: "claim-3",
      statement: "All sectors face equal pressure.",
      reasoning: "Initial broad read.",
      supportingEvidenceIds: ["evidence-1"],
      counterEvidenceIds: ["evidence-1"],
      confidence: 0.4,
      status: "contested",
      createdBy: "agent",
      createdAt: "2026-06-15T00:00:00.000Z",
      updatedAt: "2026-06-15T00:00:00.000Z",
    });
    workspace.events.push(
      event("event-0003", {
        actor: "human",
        actionType: "UPDATE_CLAIM",
        objectType: "claim",
        objectId: "claim-2",
        after: { id: "claim-2", status: "human_revised" },
      }),
      event("event-0004", {
        actor: "human",
        actionType: "CHALLENGE_CLAIM",
        objectType: "claim",
        objectId: "claim-3",
      }),
    );

    const summary = runEvaluation(workspace);

    expect(summary.process.humanRevisionCount).toBe(1);
    expect(summary.process.contestedClaimCount).toBe(1);
    expect(summary.process.humanOverrideRate).toBeCloseTo(2 / 3);
  });

  it("counts human requests, answers, waits, and correct waits", () => {
    const workspace = baseWorkspace();
    workspace.events.push(
      event("event-0003", {
        actor: "agent",
        actionType: "REQUEST_HUMAN_INPUT",
        objectType: "human_request",
        objectId: "request-1",
      }),
      event("event-0004", {
        actor: "agent",
        actionType: "WAIT",
      }),
      event("event-0005", {
        actor: "human",
        actionType: "ANSWER_HUMAN_INPUT",
        objectType: "human_request",
        objectId: "request-1",
      }),
      event("event-0006", {
        actor: "agent",
        actionType: "WAIT",
      }),
    );

    const summary = runEvaluation(workspace);

    expect(summary.process.humanRequestCount).toBe(1);
    expect(summary.process.answeredHumanRequestCount).toBe(1);
    expect(summary.process.effectiveHumanRequestRate).toBe(1);
    expect(summary.process.waitCount).toBe(2);
    expect(summary.process.correctWaitCount).toBe(1);
  });

  it("counts rejected agent actions as unauthorized actions", () => {
    const workspace = baseWorkspace();
    workspace.events.push(
      event("event-0003", {
        actor: "agent",
        actionType: "ACTION_REJECTED",
        summary: "Agent cannot finally complete the task.",
      }),
    );

    const summary = runEvaluation(workspace);

    expect(summary.process.unauthorizedActionCount).toBe(1);
  });
});
