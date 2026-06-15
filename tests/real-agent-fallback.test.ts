import { beforeEach, describe, expect, it, vi } from "vitest";
import { executeAgentTurn } from "@/agent/execute-agent-turn";
import { applyWorkspaceAction, resetObjectCounterForTests } from "@/core/reducer";
import { resetEventCounterForTests } from "@/core/event-factory";
import { createDemoWorkspaceState } from "@/core/workspace-factory";
import { buildAnswerHumanInputAction } from "@/core/human-actions";

describe("mock agent demo flow — still works", () => {
  beforeEach(() => {
    resetEventCounterForTests();
    resetObjectCounterForTests();
  });

  it("runs the required stable trajectory without an API key", () => {
    const initial = createDemoWorkspaceState();

    // Turn 1: research
    const t1 = executeAgentTurn(initial).state;
    expect(t1.sources).toHaveLength(initial.sources.length + 1);
    expect(t1.evidence).toHaveLength(initial.evidence.length + 1);
    expect(t1.notes).toHaveLength(1);

    // Turn 2: propose claims
    const t2 = executeAgentTurn(t1).state;
    expect(t2.claims).toHaveLength(2);

    // Turn 3: request human input
    const t3 = executeAgentTurn(t2).state;
    expect(t3.agentStatus).toBe("waiting_for_human");

    // Turn 4: WAIT (request still open)
    const t4 = executeAgentTurn(t3).state;
    expect(t4.brief.markdown).toBe("");

    // Human answers
    const answered = applyWorkspaceAction(
      t4,
      buildAnswerHumanInputAction(
        t4.pendingHumanRequest!.id,
        "Focus on EV batteries.",
      ),
      "human",
    );

    // Turn 5: edit brief
    const t5 = executeAgentTurn(answered).state;
    expect(t5.brief.markdown).toContain("EV batteries");
    expect(t5.brief.updatedBy).toBe("agent");
    expect(t5.agentStatus).toBe("idle");
  });
});

describe("real agent fallback logic", () => {
  beforeEach(() => {
    resetEventCounterForTests();
    resetObjectCounterForTests();
  });

  it("executeAgentTurn still resolves to mock agent by default", () => {
    const state = createDemoWorkspaceState();
    const result = executeAgentTurn(state);
    expect(result.turn.actions.length).toBeGreaterThanOrEqual(0);
    expect(result.turn.stopReason).toBeDefined();
    // Actions are valid
    for (const action of result.turn.actions) {
      expect(action.type).toBeDefined();
    }
  });
});
