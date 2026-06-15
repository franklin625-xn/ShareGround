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

/**
 * Create a workspace event.
 *
 * When `existingCount` is provided (e.g. `state.events.length`), the event
 * ID is derived from it. This guarantees deterministic, collision-free IDs
 * across server-side agent turns and client-side human actions, even after
 * localStorage hydration.
 *
 * When `existingCount` is omitted (e.g., direct calls in tests), the
 * module-level `eventCounter` is used as fallback.
 */
export function createWorkspaceEvent(
  input: CreateWorkspaceEventInput,
  existingCount?: number,
): WorkspaceEvent {
  if (existingCount !== undefined) {
    return {
      id: `event-${(existingCount + 1).toString().padStart(4, "0")}`,
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

  // Legacy path — module-level counter (used by tests that don't pass state)
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

let eventCounter = 0;

export function resetEventCounterForTests() {
  eventCounter = 0;
}
