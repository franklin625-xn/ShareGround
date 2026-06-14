import { beforeEach, describe, expect, it } from "vitest";
import { applyWorkspaceAction } from "@/core/reducer";
import { resetEventCounterForTests } from "@/core/event-factory";
import { resetObjectCounterForTests } from "@/core/reducer";
import {
  createDemoWorkspaceState,
  createEmptyWorkspaceState,
} from "@/core/workspace-factory";
import type { WorkspaceAction } from "@/core/schemas";
import type { WorkspaceState } from "@/core/types";

/**
 * Workspace store tests.
 *
 * These test store logic (loadDemo, reset, applyAction, serialization)
 * through the pure factory + reducer functions, which is what the
 * Zustand store delegates to. This approach avoids mocking global
 * localStorage in Node.js while fully exercising the same code paths.
 *
 * For e2e localStorage persistence, see the manual round-trip tests below.
 */

describe("workspace factory — load demo", () => {
  it("creates a complete demo workspace", () => {
    const state = createDemoWorkspaceState();
    expect(state.sources).toHaveLength(8);
    expect(state.evidence).toHaveLength(5);
    expect(state.task.id).toBe("demo-task-001");
    expect(state.agentStatus).toBe("idle");
  });
});

describe("workspace factory — reset / new task", () => {
  it("creates an empty workspace", () => {
    const state = createEmptyWorkspaceState({
      title: "New Task",
      question: "Q?",
      scope: "S.",
    });
    expect(state.sources).toEqual([]);
    expect(state.evidence).toEqual([]);
    expect(state.agentStatus).toBe("idle");
  });
});

describe("applyAction preserves existing state and writes events", () => {
  beforeEach(() => {
    resetEventCounterForTests();
    resetObjectCounterForTests();
  });

  it("retains pre-populated sources when adding evidence via applyAction", () => {
    const demo = createDemoWorkspaceState();
    const action: WorkspaceAction = {
      type: "ADD_EVIDENCE",
      payload: {
        sourceId: "demo-source-001",
        quoteOrFinding: "NZIA sets 40% domestic manufacturing target by 2030.",
        relevance: "Supports localization pressure claim.",
      },
      reason: "Extracting key data point.",
    };

    const next = applyWorkspaceAction(demo, action, "agent");

    // Existing demo data preserved
    expect(next.sources).toHaveLength(8);
    expect(next.evidence).toHaveLength(6); // 5 demo + 1 new
    expect(next.task.id).toBe("demo-task-001");

    // New evidence added
    const newEv = next.evidence.find((e) => e.id === "evidence-0001");
    expect(newEv).toBeDefined();
    expect(newEv?.addedBy).toBe("agent");
  });

  it("preserves event log when multiple actions are applied", () => {
    const demo = createDemoWorkspaceState();

    // Action 1: agent proposes a claim
    const afterPropose = applyWorkspaceAction(
      demo,
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure on Chinese firms.",
          reasoning: "Multiple policy tools link public support to EU production.",
          supportingEvidenceIds: ["demo-evidence-001", "demo-evidence-002"],
          counterEvidenceIds: [],
          confidence: 0.78,
        },
        reason: "Evidence from NZIA and FSR supports the claim.",
      },
      "agent",
    );

    expect(afterPropose.events).toHaveLength(1);
    expect(afterPropose.events[0]?.actionType).toBe("PROPOSE_CLAIM");

    // Action 2: human confirms the claim
    const claimId = afterPropose.claims[0]!.id;
    const afterConfirm = applyWorkspaceAction(
      afterPropose,
      {
        type: "UPDATE_CLAIM",
        payload: {
          claimId,
          status: "human_confirmed",
          humanDecisionNote: "Confirmed based on evidence provided.",
        },
        reason: "Human agrees.",
      },
      "human",
    );

    // Both events preserved
    expect(afterConfirm.events).toHaveLength(2);
    expect(afterConfirm.events[0]?.actionType).toBe("PROPOSE_CLAIM");
    expect(afterConfirm.events[1]?.actionType).toBe("UPDATE_CLAIM");

    // Sources and evidence still intact
    expect(afterConfirm.sources).toHaveLength(8);
    expect(afterConfirm.evidence).toHaveLength(5);
  });

  it("produces a reject event for unauthorized agent actions", () => {
    const demo = createDemoWorkspaceState();
    const claimState = applyWorkspaceAction(
      demo,
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "Test claim.",
          reasoning: "Test reasoning.",
          supportingEvidenceIds: [],
          counterEvidenceIds: [],
        },
        reason: "Test.",
      },
      "agent",
    );

    const claimId = claimState.claims[0]!.id;
    const rejected = applyWorkspaceAction(
      claimState,
      {
        type: "UPDATE_CLAIM",
        payload: { claimId, status: "final" },
        reason: "Agent tries to finalize.",
      },
      "agent",
    );

    // Rejected: claim stays at ai_proposed
    expect(rejected.claims[0]?.status).toBe("ai_proposed");
    expect(rejected.events).toHaveLength(2);
    expect(rejected.events[1]?.actionType).toBe("ACTION_REJECTED");
  });
});

describe("JSON serialization round-trip", () => {
  it("serializes and deserializes demo workspace without data loss", () => {
    const original = createDemoWorkspaceState();

    // Simulate localStorage: JSON.stringify → JSON.parse
    const json = JSON.stringify(original);
    const restored: WorkspaceState = JSON.parse(json);

    // Core fields match
    expect(restored.task.id).toEqual(original.task.id);
    expect(restored.sources).toHaveLength(original.sources.length);
    expect(restored.evidence).toHaveLength(original.evidence.length);
    expect(restored.events).toEqual(original.events);
    expect(restored.agentStatus).toEqual(original.agentStatus);
    expect(restored.completed).toEqual(original.completed);

    // Deep equality
    expect(restored).toEqual(original);
  });

  it("serializes and deserializes a workspace with actions applied", () => {
    const demo = createDemoWorkspaceState();

    const afterAction = applyWorkspaceAction(
      demo,
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Evidence from NZIA and FSR supports.",
          supportingEvidenceIds: ["demo-evidence-001"],
          counterEvidenceIds: [],
          confidence: 0.75,
        },
        reason: "Preliminary analysis.",
      },
      "agent",
    );

    const json = JSON.stringify(afterAction);
    const restored: WorkspaceState = JSON.parse(json);

    // Events preserved after round-trip
    expect(restored.events).toHaveLength(1);
    expect(restored.events[0]?.actionType).toBe("PROPOSE_CLAIM");
    expect(restored.claims).toHaveLength(1);
    expect(restored.claims[0]?.statement).toContain("localization pressure");
    expect(restored.sources).toHaveLength(8);
    expect(restored).toEqual(afterAction);
  });
});
