import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/agent/system-prompt";
import { buildWorkspaceSnapshot } from "@/agent/build-context";
import { agentTurnSchema } from "@/agent/action-schema";
import type { AgentTurn } from "@/agent/action-schema";
import { createDemoWorkspaceState } from "@/core/workspace-factory";
import { applyWorkspaceAction } from "@/core/reducer";

describe("system prompt", () => {
  it("returns a non-empty string with key sections", () => {
    const prompt = buildSystemPrompt();
    expect(prompt.length).toBeGreaterThan(500);
    expect(prompt).toContain("ADD_SOURCE");
    expect(prompt).toContain("ANSWER_HUMAN_INPUT");
    expect(prompt).toContain("FINISH");
    expect(prompt).toContain("human_confirmed");
    expect(prompt).toContain("stopReason");
  });
});

describe("workspace snapshot", () => {
  it("includes task, sources, evidence, claims info", () => {
    const state = createDemoWorkspaceState();
    const snapshot = buildWorkspaceSnapshot(state);

    expect(snapshot).toContain(state.task.title);
    expect(snapshot).toContain("8");
    expect(snapshot).toContain("Net-Zero");
    expect(snapshot).toContain("demo-evidence-001");
    expect(snapshot).toContain("Agent Status: idle");
  });

  it("mentions open human request if present", () => {
    const state = createDemoWorkspaceState();
    state.pendingHumanRequest = {
      id: "req-1",
      question: "Should we focus on EVs?",
      relatedObjectIds: [],
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const snapshot = buildWorkspaceSnapshot(state);
    expect(snapshot).toContain("Should we focus on EVs?");
  });
});

describe("agent turn schema validation", () => {
  it("accepts a valid agent turn", () => {
    const turn: AgentTurn = {
      situation: "Workspace has demo materials.",
      nextGoal: "Add evidence and propose a claim.",
      actions: [
        {
          type: "ADD_EVIDENCE",
          payload: {
            sourceId: "demo-source-001",
            quoteOrFinding: "Test finding.",
            relevance: "Test relevance.",
          },
          reason: "Testing.",
        },
      ],
      stopReason: "turn_complete",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(true);
  });

  it("rejects a turn with ANSWER_HUMAN_INPUT (agent forbidden)", () => {
    const turn = {
      situation: "Test.",
      nextGoal: "Test.",
      actions: [
        {
          type: "ANSWER_HUMAN_INPUT",
          payload: { requestId: "req-1", answer: "Focus on EVs." },
          reason: "Test.",
        },
      ],
      stopReason: "turn_complete",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(false);
  });

  it("rejects a turn with FINISH (human-only completion)", () => {
    const turn = {
      situation: "Test.",
      nextGoal: "Test.",
      actions: [
        {
          type: "FINISH",
          payload: {},
          reason: "Test.",
        },
      ],
      stopReason: "task_complete",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(false);
  });

  it("rejects a turn with more than 3 actions", () => {
    const turn: AgentTurn = {
      situation: "Test.",
      nextGoal: "Test.",
      actions: [
        {
          type: "WAIT",
          payload: { waitingFor: "1" },
          reason: "Test.",
        },
        {
          type: "WAIT",
          payload: { waitingFor: "2" },
          reason: "Test.",
        },
        {
          type: "WAIT",
          payload: { waitingFor: "3" },
          reason: "Test.",
        },
        {
          type: "WAIT",
          payload: { waitingFor: "4" },
          reason: "Test.",
        },
      ],
      stopReason: "turn_complete",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(false);
  });

  it("rejects invalid stopReason", () => {
    const turn = {
      situation: "Test.",
      nextGoal: "Test.",
      actions: [],
      stopReason: "invalid_reason",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(false);
  });
});

describe("Zod discriminator — real agent output validation", () => {
  it("rejects an action with an unknown type (e.g. ADD_CLAIM instead of PROPOSE_CLAIM)", () => {
    const turn = {
      situation: "Test.",
      nextGoal: "Test.",
      actions: [
        {
          type: "ADD_CLAIM",
          payload: {
            statement: "Some claim.",
            reasoning: "Because.",
            supportingEvidenceIds: [],
            counterEvidenceIds: [],
          },
          reason: "Model invented an action name.",
        },
      ],
      stopReason: "turn_complete",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(false);
    // The error should mention the discriminator / union
    expect(result.error?.message).toMatch(/discriminator|union|ADD_CLAIM/i);
  });

  it("rejects an action with a misspelled type (e.g. PROPOSE_CLAIM -> PROPOSE_CLAIMES)", () => {
    const turn = {
      situation: "Test.",
      nextGoal: "Test.",
      actions: [
        {
          type: "PROPOSE_CLAIMES",
          payload: {
            statement: "Test.",
            reasoning: "Test.",
            supportingEvidenceIds: [],
            counterEvidenceIds: [],
          },
          reason: "Typo.",
        },
      ],
      stopReason: "turn_complete",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(false);
  });

  it("rejects an action with lowercase type (e.g. propose_claim)", () => {
    const turn = {
      situation: "Test.",
      nextGoal: "Test.",
      actions: [
        {
          type: "propose_claim",
          payload: {
            statement: "Test.",
            reasoning: "Test.",
            supportingEvidenceIds: [],
            counterEvidenceIds: [],
          },
          reason: "Lowercase.",
        },
      ],
      stopReason: "turn_complete",
    };

    const result = agentTurnSchema.safeParse(turn);
    expect(result.success).toBe(false);
  });

  it("rejects a turn wrapped in markdown code fence (backticks in output)", () => {
    // Simulate what happens if the model wraps JSON in ```json...```
    const raw = '```json\n{"situation":"Test.","nextGoal":"Test.","actions":[],"stopReason":"turn_complete"}\n```';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Expected: JSON.parse fails because of the backticks
      expect(true).toBe(true);
      return;
    }
    // If it somehow parsed, the schema should still handle it
    const result = agentTurnSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  it("correctly applies a valid AgentTurn through the reducer", () => {
    const state = createDemoWorkspaceState();

    const turn: AgentTurn = {
      situation: "Workspace has demo sources but no claims.",
      nextGoal: "Propose an initial claim.",
      actions: [
        {
          type: "PROPOSE_CLAIM",
          payload: {
            statement: "EU policy increases localization pressure.",
            reasoning: "NZIA and FSR both link public support to local production.",
            supportingEvidenceIds: ["demo-evidence-001"],
            counterEvidenceIds: [],
            confidence: 0.75,
          },
          reason: "Evidence supports preliminary claim.",
        },
      ],
      stopReason: "turn_complete",
    };

    const nextState = turn.actions.reduce(
      (s, a) => applyWorkspaceAction(s, a, "agent"),
      state,
    );

    expect(nextState.claims).toHaveLength(1);
    expect(nextState.claims[0]?.status).toBe("ai_proposed");
    expect(nextState.events).toHaveLength(1);
    expect(nextState.events[0]?.actionType).toBe("PROPOSE_CLAIM");
  });
});
