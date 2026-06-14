import type {
  Actor,
  WorkspaceEvent,
  WorkspaceObjectType,
} from "@/core/types";

export type CreateWorkspaceEventInput = {
  actor: Actor;
  actionType: string;
  objectType?: WorkspaceObjectType;
  objectId?: string;
  summary: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

let eventCounter = 0;

export function createWorkspaceEvent(
  input: CreateWorkspaceEventInput,
): WorkspaceEvent {
  eventCounter += 1;

  return {
    id: `event-${eventCounter.toString().padStart(4, "0")}`,
    timestamp: new Date().toISOString(),
    actor: input.actor,
    actionType: input.actionType,
    objectType: input.objectType,
    objectId: input.objectId,
    summary: input.summary,
    before: input.before,
    after: input.after,
    reason: input.reason,
  };
}

export function resetEventCounterForTests() {
  eventCounter = 0;
}
