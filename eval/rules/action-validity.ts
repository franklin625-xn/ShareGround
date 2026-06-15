import type { WorkspaceEvent } from "@/core/types";

export type ActionValidityResult = {
  agentActionCount: number;
  humanActionCount: number;
  unauthorizedActionCount: number;
};

export function evaluateActionValidity(
  events: WorkspaceEvent[],
): ActionValidityResult {
  return {
    agentActionCount: events.filter((event) => event.actor === "agent").length,
    humanActionCount: events.filter((event) => event.actor === "human").length,
    unauthorizedActionCount: events.filter(
      (event) => event.actor === "agent" && event.actionType === "ACTION_REJECTED",
    ).length,
  };
}
