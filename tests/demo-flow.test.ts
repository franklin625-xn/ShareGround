import { beforeEach, describe, expect, it } from "vitest";
import { executeAgentTurn } from "@/agent/execute-agent-turn";
import { buildAnswerHumanInputAction } from "@/core/human-actions";
import { applyWorkspaceAction, resetObjectCounterForTests } from "@/core/reducer";
import { resetEventCounterForTests } from "@/core/event-factory";
import { createDemoWorkspaceState } from "@/core/workspace-factory";

describe("mock agent demo flow", () => {
  beforeEach(() => {
    resetEventCounterForTests();
    resetObjectCounterForTests();
  });

  it("runs the required stable trajectory without an API key", () => {
    const initial = createDemoWorkspaceState();

    const afterResearch = executeAgentTurn(initial).state;
    expect(afterResearch.sources).toHaveLength(initial.sources.length + 1);
    expect(afterResearch.evidence).toHaveLength(initial.evidence.length + 1);
    expect(afterResearch.notes).toHaveLength(1);
    expect(afterResearch.events.map((event) => event.actionType)).toEqual([
      "ADD_SOURCE",
      "ADD_EVIDENCE",
      "ADD_NOTE",
    ]);

    const afterClaims = executeAgentTurn(afterResearch).state;
    expect(afterClaims.claims).toHaveLength(2);
    expect(afterClaims.claims.every((claim) => claim.status === "ai_proposed")).toBe(
      true,
    );

    const afterRequest = executeAgentTurn(afterClaims).state;
    expect(afterRequest.agentStatus).toBe("waiting_for_human");
    expect(afterRequest.pendingHumanRequest).toMatchObject({
      status: "open",
    });
    expect(afterRequest.events.at(-1)?.actionType).toBe("REQUEST_HUMAN_INPUT");

    const afterWait = executeAgentTurn(afterRequest).state;
    expect(afterWait.brief.markdown).toBe("");
    expect(afterWait.events.at(-1)?.actionType).toBe("WAIT");
    expect(afterWait.pendingHumanRequest?.status).toBe("open");

    const afterAnswer = applyWorkspaceAction(
      afterWait,
      buildAnswerHumanInputAction(
        afterWait.pendingHumanRequest!.id,
        "Focus the brief on EV batteries and tariff-driven localization.",
      ),
      "human",
    );

    const afterBrief = executeAgentTurn(afterAnswer).state;
    expect(afterBrief.brief.markdown).toContain("EV batteries");
    expect(afterBrief.brief.updatedBy).toBe("agent");
    expect(afterBrief.agentStatus).toBe("idle");
    expect(afterBrief.events.at(-1)?.actionType).toBe("EDIT_BRIEF");
  });
});
