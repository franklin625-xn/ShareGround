import { beforeEach, describe, expect, it } from "vitest";
import { resetEventCounterForTests } from "@/core/event-factory";
import { applyWorkspaceAction } from "@/core/reducer";
import type { WorkspaceAction } from "@/core/schemas";
import { resetObjectCounterForTests } from "@/core/reducer";
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
    resetObjectCounterForTests();
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

  it("rejects evidence when the source ID does not exist", () => {
    const state = createState();
    const next = applyWorkspaceAction(
      state,
      {
        type: "ADD_EVIDENCE",
        payload: {
          sourceId: "missing-source",
          quoteOrFinding: "Unsupported finding.",
          relevance: "Should not be accepted.",
        },
        reason: "Model referenced a missing source.",
      },
      "agent",
    );

    expect(next.evidence).toEqual(state.evidence);
    expect(next.events.at(-1)?.actionType).toBe("ACTION_REJECTED");
    expect(next.events.at(-1)?.summary).toContain("missing-source");
  });

  it("rejects claims that reference missing evidence IDs", () => {
    const state = createState();
    const next = applyWorkspaceAction(
      state,
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Model cited missing evidence.",
          supportingEvidenceIds: ["missing-evidence"],
          counterEvidenceIds: [],
          confidence: 0.6,
        },
        reason: "Model referenced missing evidence.",
      },
      "agent",
    );

    expect(next.claims).toEqual([]);
    expect(next.events.at(-1)?.actionType).toBe("ACTION_REJECTED");
    expect(next.events.at(-1)?.summary).toContain("missing-evidence");
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

  it("lets a human edit a research note and writes a note-scoped event", () => {
    const withNote = applyWorkspaceAction(
      createState(),
      {
        type: "ADD_NOTE",
        payload: {
          content: "Initial note.",
          sourceIds: ["source-1"],
          evidenceIds: [],
        },
        reason: "Human added a note.",
      },
      "human",
    );

    const noteId = withNote.notes[0]!.id;
    const next = applyWorkspaceAction(
      withNote,
      {
        type: "EDIT_NOTE",
        payload: {
          noteId,
          content: "Updated note.",
          sourceIds: ["source-1"],
          evidenceIds: ["evidence-1"],
        },
        reason: "Human edited a note.",
      },
      "human",
    );

    expect(next.notes[0]?.content).toBe("Updated note.");
    expect(next.notes[0]?.evidenceIds).toEqual(["evidence-1"]);
    expect(next.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "EDIT_NOTE",
      objectType: "note",
      objectId: noteId,
    });
  });

  it("lets a human edit a source and writes before/after in a source-scoped event", () => {
    const next = applyWorkspaceAction(
      createState(),
      {
        type: "EDIT_SOURCE",
        payload: {
          sourceId: "source-1",
          title: "Updated Net-Zero Industry Act",
          publisher: "Updated Commission",
          url: "https://example.com/nzia",
          publishedAt: "2026-06-15",
          summary: "Updated source summary.",
        },
        reason: "Human corrected source metadata.",
      },
      "human",
    );

    expect(next.sources[0]).toMatchObject({
      id: "source-1",
      title: "Updated Net-Zero Industry Act",
      publisher: "Updated Commission",
      url: "https://example.com/nzia",
      publishedAt: "2026-06-15",
      summary: "Updated source summary.",
    });
    expect(next.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "EDIT_SOURCE",
      objectType: "source",
      objectId: "source-1",
      reason: "Human corrected source metadata.",
    });
    expect(next.events.at(-1)?.before).toMatchObject({
      title: "Net-Zero Industry Act",
      publisher: "European Commission",
    });
    expect(next.events.at(-1)?.after).toMatchObject({
      title: "Updated Net-Zero Industry Act",
      publisher: "Updated Commission",
    });
  });

  it("lets a human edit evidence and writes before/after in an evidence-scoped event", () => {
    const next = applyWorkspaceAction(
      createState(),
      {
        type: "EDIT_EVIDENCE",
        payload: {
          evidenceId: "evidence-1",
          quoteOrFinding: "Updated evidence finding.",
          relevance: "Updated relevance.",
        },
        reason: "Human corrected evidence wording.",
      },
      "human",
    );

    expect(next.evidence[0]).toMatchObject({
      id: "evidence-1",
      quoteOrFinding: "Updated evidence finding.",
      relevance: "Updated relevance.",
    });
    expect(next.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "EDIT_EVIDENCE",
      objectType: "evidence",
      objectId: "evidence-1",
      reason: "Human corrected evidence wording.",
    });
    expect(next.events.at(-1)?.before).toMatchObject({
      quoteOrFinding:
        "The EU links public support to local manufacturing capacity.",
      relevance: "Shows localization pressure.",
    });
    expect(next.events.at(-1)?.after).toMatchObject({
      quoteOrFinding: "Updated evidence finding.",
      relevance: "Updated relevance.",
    });
  });

  it("lets a human mark a claim evidence insufficient and finalize it with claim-scoped events", () => {
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

    const claimId = withClaim.claims[0]!.id;
    const insufficient = applyWorkspaceAction(
      withClaim,
      {
        type: "UPDATE_CLAIM",
        payload: {
          claimId,
          status: "evidence_insufficient",
          humanDecisionNote: "Need one primary-source citation.",
        },
        reason: "Human requests stronger evidence.",
      },
      "human",
    );

    const finalized = applyWorkspaceAction(
      insufficient,
      {
        type: "UPDATE_CLAIM",
        payload: {
          claimId,
          status: "final",
          humanDecisionNote: "Final after evidence review.",
        },
        reason: "Human finalizes the claim.",
      },
      "human",
    );

    expect(insufficient.claims[0]?.status).toBe("evidence_insufficient");
    expect(insufficient.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "UPDATE_CLAIM",
      objectType: "claim",
      objectId: claimId,
    });
    expect(finalized.claims[0]?.status).toBe("final");
    expect(finalized.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "UPDATE_CLAIM",
      objectType: "claim",
      objectId: claimId,
    });
  });

  it("lets a human complete the workspace and writes a task-scoped event", () => {
    const next = applyWorkspaceAction(
      createState(),
      {
        type: "FINISH",
        payload: {},
        reason: "Human completes the workspace.",
      },
      "human",
    );

    expect(next.completed).toBe(true);
    expect(next.agentStatus).toBe("completed");
    expect(next.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "FINISH",
      objectType: "task",
      objectId: "task-1",
    });
  });

  it("writes human actor events with object scope for all human CRUD actions", () => {
    const sourceState = applyWorkspaceAction(
      createState(),
      {
        type: "ADD_SOURCE",
        payload: {
          title: "Battery policy update",
          publisher: "Commission",
          summary: "New policy details.",
        },
        reason: "Human added source.",
      },
      "human",
    );
    const sourceId = sourceState.sources.at(-1)!.id;
    expect(sourceState.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "ADD_SOURCE",
      objectType: "source",
      objectId: sourceId,
    });

    const evidenceState = applyWorkspaceAction(
      sourceState,
      {
        type: "ADD_EVIDENCE",
        payload: {
          sourceId,
          quoteOrFinding: "Evidence finding.",
          relevance: "Supports the claim.",
        },
        reason: "Human added evidence.",
      },
      "human",
    );
    const evidenceId = evidenceState.evidence.at(-1)!.id;
    expect(evidenceState.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "ADD_EVIDENCE",
      objectType: "evidence",
      objectId: evidenceId,
    });

    const editedSourceState = applyWorkspaceAction(
      evidenceState,
      {
        type: "EDIT_SOURCE",
        payload: {
          sourceId,
          title: "Edited source",
          publisher: "Edited publisher",
          summary: "Edited summary.",
        },
        reason: "Human edited source.",
      },
      "human",
    );
    expect(editedSourceState.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "EDIT_SOURCE",
      objectType: "source",
      objectId: sourceId,
    });

    const editedEvidenceState = applyWorkspaceAction(
      editedSourceState,
      {
        type: "EDIT_EVIDENCE",
        payload: {
          evidenceId,
          quoteOrFinding: "Edited evidence.",
          relevance: "Edited relevance.",
        },
        reason: "Human edited evidence.",
      },
      "human",
    );
    expect(editedEvidenceState.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "EDIT_EVIDENCE",
      objectType: "evidence",
      objectId: evidenceId,
    });

    const noteState = applyWorkspaceAction(
      editedEvidenceState,
      {
        type: "ADD_NOTE",
        payload: {
          content: "Research note.",
          sourceIds: [sourceId],
          evidenceIds: [evidenceId],
        },
        reason: "Human added note.",
      },
      "human",
    );
    const noteId = noteState.notes.at(-1)!.id;
    expect(noteState.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "ADD_NOTE",
      objectType: "note",
      objectId: noteId,
    });

    const claimState = applyWorkspaceAction(
      noteState,
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "Claim.",
          reasoning: "Reasoning.",
          supportingEvidenceIds: [evidenceId],
          counterEvidenceIds: [],
        },
        reason: "Agent proposes claim.",
      },
      "agent",
    );
    const claimId = claimState.claims.at(-1)!.id;

    const confirmed = applyWorkspaceAction(
      claimState,
      {
        type: "UPDATE_CLAIM",
        payload: {
          claimId,
          status: "human_confirmed",
          humanDecisionNote: "Confirmed.",
        },
        reason: "Human confirmed claim.",
      },
      "human",
    );
    expect(confirmed.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "UPDATE_CLAIM",
      objectType: "claim",
      objectId: claimId,
    });

    const contested = applyWorkspaceAction(
      confirmed,
      {
        type: "CHALLENGE_CLAIM",
        payload: {
          claimId,
          counterEvidenceIds: [evidenceId],
          note: "Contested.",
        },
        reason: "Human contested claim.",
      },
      "human",
    );
    expect(contested.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "CHALLENGE_CLAIM",
      objectType: "claim",
      objectId: claimId,
    });

    const waiting = applyWorkspaceAction(
      contested,
      {
        type: "REQUEST_HUMAN_INPUT",
        payload: {
          question: "Need direction?",
          relatedObjectIds: [claimId],
        },
        reason: "Agent asks.",
      },
      "agent",
    );
    const requestId = waiting.pendingHumanRequest!.id;
    const answered = applyWorkspaceAction(
      waiting,
      {
        type: "ANSWER_HUMAN_INPUT",
        payload: {
          requestId,
          answer: "Proceed.",
        },
        reason: "Human answered.",
      },
      "human",
    );
    expect(answered.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "ANSWER_HUMAN_INPUT",
      objectType: "human_request",
      objectId: requestId,
    });

    const briefState = applyWorkspaceAction(
      answered,
      {
        type: "EDIT_BRIEF",
        payload: {
          markdown: "# Brief",
        },
        reason: "Human edited brief.",
      },
      "human",
    );
    expect(briefState.events.at(-1)).toMatchObject({
      actor: "human",
      actionType: "EDIT_BRIEF",
      objectType: "brief",
      objectId: "brief",
    });
  });

  it("generates sequential event IDs starting from existing events", () => {
    const state = createState();

    // Add first event — should be event-0001
    const s1 = applyWorkspaceAction(
      state,
      {
        type: "WAIT",
        payload: { waitingFor: "Direction." },
        reason: "First.",
      },
      "agent",
    );
    expect(s1.events[0]?.id).toBe("event-0001");

    // Add second event — should be event-0002
    const s2 = applyWorkspaceAction(
      s1,
      {
        type: "WAIT",
        payload: { waitingFor: "More." },
        reason: "Second.",
      },
      "agent",
    );
    expect(s2.events[1]?.id).toBe("event-0002");

    // All event IDs unique
    const ids = s2.events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("generates unique event IDs after a state with existing events", () => {
    // Simulate a state that already has events (e.g., after API round trip)
    const state = createState();
    state.events = [
      {
        id: "event-0001",
        timestamp: "2026-06-15T00:00:00.000Z",
        actor: "system",
        actionType: "ADD_SOURCE",
        summary: "Pre-existing event.",
      },
      {
        id: "event-0002",
        timestamp: "2026-06-15T00:00:00.000Z",
        actor: "system",
        actionType: "ADD_EVIDENCE",
        summary: "Another pre-existing event.",
      },
    ];

    const next = applyWorkspaceAction(
      state,
      {
        type: "WAIT",
        payload: { waitingFor: "Input." },
        reason: "After API round trip.",
      },
      "agent",
    );

    // New event should pick up from existing events
    expect(next.events[2]?.id).toBe("event-0003");
    expect(next.events).toHaveLength(3);
    // All unique
    const ids = next.events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("generates unique event IDs across multiple Run Agent turns", () => {
    const state = createState();

    // Simulate three agent turns with multiple actions each
    const t1Actions: WorkspaceAction[] = [
      {
        type: "ADD_SOURCE",
        payload: {
          title: "Turn 1 Source",
          publisher: "Test",
          summary: "First turn source.",
        },
        reason: "Turn 1.",
      },
      {
        type: "ADD_EVIDENCE",
        payload: {
          sourceId: "source-1",
          quoteOrFinding: "Finding from turn 1.",
          relevance: "Relevant.",
        },
        reason: "Turn 1 evidence.",
      },
    ];

    const s1 = t1Actions.reduce(
      (s, a) => applyWorkspaceAction(s, a, "agent"),
      state,
    );

    // Three events from turn 1: ADD_SOURCE, ADD_EVIDENCE + the pre-existing source edit
    // Actually wait - state already has 1 source and 1 evidence from createState
    // Turn 1: ADD_SOURCE creates source-0002, ADD_EVIDENCE sources from source-1
    expect(s1.events).toHaveLength(2);
    expect(s1.events[0]?.id).toBe("event-0001");
    expect(s1.events[1]?.id).toBe("event-0002");

    // Turn 2: propose claims
    const t2Action: WorkspaceAction = {
      type: "PROPOSE_CLAIM",
      payload: {
        statement: "EU policy increases localization pressure.",
        reasoning: "Evidence supports.",
        supportingEvidenceIds: ["evidence-1"],
        counterEvidenceIds: [],
        confidence: 0.75,
      },
      reason: "Turn 2.",
    };

    const s2 = applyWorkspaceAction(s1, t2Action, "agent");
    expect(s2.events[2]?.id).toBe("event-0003");

    // Turn 3: request human input
    const t3Action: WorkspaceAction = {
      type: "REQUEST_HUMAN_INPUT",
      payload: {
        question: "Should the brief focus on EVs?",
        relatedObjectIds: [],
      },
      reason: "Turn 3.",
    };

    const s3 = applyWorkspaceAction(s2, t3Action, "agent");
    expect(s3.events[3]?.id).toBe("event-0004");

    // All 4 events have unique IDs
    const allIds = s3.events.map((e) => e.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("generates unique object IDs based on existing objects in state", () => {
    const state = createState();
    // State already has source-1 and evidence-1

    const s1 = applyWorkspaceAction(
      state,
      {
        type: "ADD_SOURCE",
        payload: {
          title: "New Source",
          publisher: "Test",
          summary: "Test summary.",
        },
        reason: "Test.",
      },
      "agent",
    );

    // Should be source-0002 (source-1 already exists)
    expect(s1.sources[1]?.id).toBe("source-0002");

    const s2 = applyWorkspaceAction(
      s1,
      {
        type: "ADD_EVIDENCE",
        payload: {
          sourceId: s1.sources[1]!.id,
          quoteOrFinding: "New evidence.",
          relevance: "Test relevance.",
        },
        reason: "Test.",
      },
      "agent",
    );

    // Should be evidence-0002 (evidence-1 already exists)
    expect(s2.evidence[1]?.id).toBe("evidence-0002");
  });
});
