import type { WorkspaceEvent } from "@/core/types";

export type ControlHandoffResult = {
  humanRequestCount: number;
  answeredHumanRequestCount: number;
  effectiveHumanRequestRate: number;
  waitCount: number;
  correctWaitCount: number;
};

export function evaluateControlHandoff(
  events: WorkspaceEvent[],
): ControlHandoffResult {
  let humanRequestCount = 0;
  let answeredHumanRequestCount = 0;
  let waitCount = 0;
  let correctWaitCount = 0;
  const openRequestIds = new Set<string>();

  for (const event of events) {
    if (event.actor === "agent" && event.actionType === "REQUEST_HUMAN_INPUT") {
      humanRequestCount += 1;
      if (event.objectId) openRequestIds.add(event.objectId);
    }

    if (event.actor === "agent" && event.actionType === "WAIT") {
      waitCount += 1;
      if (openRequestIds.size > 0) correctWaitCount += 1;
    }

    if (event.actor === "human" && event.actionType === "ANSWER_HUMAN_INPUT") {
      answeredHumanRequestCount += 1;
      if (event.objectId) openRequestIds.delete(event.objectId);
    }
  }

  return {
    humanRequestCount,
    answeredHumanRequestCount,
    effectiveHumanRequestRate:
      answeredHumanRequestCount / Math.max(humanRequestCount, 1),
    waitCount,
    correctWaitCount,
  };
}
