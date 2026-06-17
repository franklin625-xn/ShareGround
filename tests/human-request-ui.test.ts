import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkspaceShellView } from "@/components/workspace/workspace-shell";
import { applyWorkspaceAction } from "@/core/reducer";
import { createDemoWorkspaceState } from "@/core/workspace-factory";

function workspaceWithOpenRequest(title = "Demo Task") {
  const base = createDemoWorkspaceState();
  const titled = {
    ...base,
    task: {
      ...base.task,
      title,
    },
  };

  return applyWorkspaceAction(
    titled,
    {
      type: "REQUEST_HUMAN_INPUT",
      payload: {
        question:
          "Should the final brief emphasize EV batteries, broader industrial policy risk, or market-entry strategy?",
        relatedObjectIds: [],
      },
      reason: "The final framing is a human judgment call.",
    },
    "agent",
  );
}

function renderWorkspace(workspace = workspaceWithOpenRequest()) {
  return renderToStaticMarkup(
    React.createElement(WorkspaceShellView, {
      workspace,
      agentError: null,
      agentMode: "idle",
      persistenceError: null,
      onApplyHumanAction: () => undefined,
      onSendMessageAndRun: () => undefined,
      onStartAgent: () => undefined,
      onPauseAgent: () => undefined,
      onResumeAgent: () => undefined,
      onReset: () => undefined,
      onExportDebugBundle: () => undefined,
      onDismissPersistenceError: () => undefined,
    }),
  );
}

describe("Human request UI", () => {
  it("always renders an actionable composer when a human request is open", () => {
    const html = renderWorkspace();

    expect(html).toContain("Agent Needs Your Input");
    expect(html).toContain(
      "Should the final brief emphasize EV batteries, broader industrial policy risk, or market-entry strategy?",
    );
    expect(html).toContain("<textarea");
    expect(html).toContain("Submit Answer");
  });

  it("keeps an answer fallback visible under long titles and constrained toolbar space", () => {
    const html = renderWorkspace(
      workspaceWithOpenRequest(
        "A very long task title that should not be able to push the human request answer affordance out of the toolbar or page layout",
      ),
    );

    expect(html).toContain("Answer pending request");
    expect(html).toContain("human-request-composer");
    expect(html.indexOf("Answer pending request")).toBeLessThan(
      html.indexOf("human-request-composer"),
    );
    expect(html).toContain("Submit Answer");
  });

  it("answering the request restores Start controls and writes Activity Log", () => {
    const waiting = workspaceWithOpenRequest();
    const answered = applyWorkspaceAction(
      waiting,
      {
        type: "ANSWER_HUMAN_INPUT",
        payload: {
          requestId: waiting.pendingHumanRequest!.id,
          answer: "Focus on EV batteries.",
        },
        reason: "Human answered an input request.",
      },
      "human",
    );

    const html = renderWorkspace(answered);

    expect(answered.pendingHumanRequest?.status).toBe("answered");
    expect(answered.pendingHumanRequest?.answer).toBe("Focus on EV batteries.");
    expect(answered.agentStatus).toBe("idle");
    expect(answered.agentControl.status).toBe("idle");
    expect(html).toContain("▶ Start");
    expect(html).toContain("ANSWER_HUMAN_INPUT");
    expect(html).not.toContain("Submit Answer");
  });
});
