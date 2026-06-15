import { createWorkspaceEvent } from "@/core/event-factory";
import { canApplyWorkspaceAction } from "@/core/permissions";
import type { WorkspaceAction } from "@/core/schemas";
import type {
  Actor,
  Claim,
  Evidence,
  HumanInputRequest,
  ResearchNote,
  Source,
  WorkspaceObjectType,
  WorkspaceState,
} from "@/core/types";

export function resetObjectCounterForTests() {
  // Kept for backward compatibility — object IDs now derive from state.
  // No-op in the new state-based scheme.
}

function now() {
  return new Date().toISOString();
}

/**
 * Generate the next sequential object ID for a given prefix by scanning
 * all existing object arrays in the state. This guarantees deterministic
 * IDs across server-side agent execution and client-side human actions
 * after localStorage hydration.
 */
function createId(prefix: string, state: WorkspaceState): string {
  const allIds = [
    ...state.sources.map((s) => s.id),
    ...state.evidence.map((e) => e.id),
    ...state.notes.map((n) => n.id),
    ...state.claims.map((c) => c.id),
    ...(state.pendingHumanRequest ? [state.pendingHumanRequest.id] : []),
  ];

  const prefixPattern = new RegExp(`^${prefix}-(\\d+)$`);
  let maxCounter = 0;

  for (const id of allIds) {
    const match = id.match(prefixPattern);
    if (match) {
      const num = parseInt(match[1]!, 10);
      if (num > maxCounter) maxCounter = num;
    }
  }

  return `${prefix}-${(maxCounter + 1).toString().padStart(4, "0")}`;
}

function hasSource(state: WorkspaceState, sourceId: string): boolean {
  return state.sources.some((source) => source.id === sourceId);
}

function hasEvidence(state: WorkspaceState, evidenceId: string): boolean {
  return state.evidence.some((evidence) => evidence.id === evidenceId);
}

function findMissingId(
  ids: string[] | undefined,
  exists: (id: string) => boolean,
): string | undefined {
  return ids?.find((id) => !exists(id));
}

function hasWorkspaceObject(state: WorkspaceState, objectId: string): boolean {
  return (
    state.task.id === objectId ||
    objectId === "brief" ||
    hasSource(state, objectId) ||
    hasEvidence(state, objectId) ||
    state.notes.some((note) => note.id === objectId) ||
    state.claims.some((claim) => claim.id === objectId) ||
    state.pendingHumanRequest?.id === objectId
  );
}

export function applyWorkspaceAction(
  state: WorkspaceState,
  action: WorkspaceAction,
  actor: Actor,
): WorkspaceState {
  const permission = canApplyWorkspaceAction(actor, action);

  if (!permission.allowed) {
    return {
      ...state,
      events: [
        ...state.events,
        createWorkspaceEvent(
          {
            actor,
            actionType: "ACTION_REJECTED",
            summary: permission.reason ?? `Action ${action.type} was rejected.`,
            before: state,
            after: state,
            reason: action.reason,
          },
          state.events.length,
        ),
      ],
    };
  }

  switch (action.type) {
    case "SEARCH_SOURCE":
      return appendEvent(
        state,
        actor,
        action.type,
        "Search source requested.",
        undefined,
        undefined,
        action.reason,
      );

    case "ADD_SOURCE": {
      const source: Source = {
        id: createId("source", state),
        title: action.payload.title,
        publisher: action.payload.publisher,
        url: action.payload.url,
        publishedAt: action.payload.publishedAt,
        summary: action.payload.summary,
        addedBy: actor,
        createdAt: now(),
      };
      const next = { ...state, sources: [...state.sources, source] };

      return appendEvent(
        next,
        actor,
        action.type,
        `Added source: ${source.title}`,
        "source",
        source.id,
        action.reason,
        undefined,
        source,
      );
    }

    case "EDIT_SOURCE": {
      const before = state.sources.find(
        (source) => source.id === action.payload.sourceId,
      );
      if (!before) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          action.payload.sourceId,
          action.reason,
        );
      }

      const after: Source = {
        ...before,
        title: action.payload.title,
        publisher: action.payload.publisher,
        url: action.payload.url,
        publishedAt: action.payload.publishedAt,
        summary: action.payload.summary,
      };
      const next = {
        ...state,
        sources: state.sources.map((source) =>
          source.id === after.id ? after : source,
        ),
      };

      return appendEvent(
        next,
        actor,
        action.type,
        `Edited source: ${after.title}`,
        "source",
        after.id,
        action.reason,
        before,
        after,
      );
    }

    case "ADD_EVIDENCE": {
      if (!hasSource(state, action.payload.sourceId)) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          action.payload.sourceId,
          action.reason,
        );
      }

      const evidence: Evidence = {
        id: createId("evidence", state),
        sourceId: action.payload.sourceId,
        quoteOrFinding: action.payload.quoteOrFinding,
        relevance: action.payload.relevance,
        addedBy: actor,
        createdAt: now(),
      };
      const next = { ...state, evidence: [...state.evidence, evidence] };

      return appendEvent(
        next,
        actor,
        action.type,
        "Added evidence.",
        "evidence",
        evidence.id,
        action.reason,
        undefined,
        evidence,
      );
    }

    case "EDIT_EVIDENCE": {
      const before = state.evidence.find(
        (evidence) => evidence.id === action.payload.evidenceId,
      );
      if (!before) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          action.payload.evidenceId,
          action.reason,
        );
      }

      const after: Evidence = {
        ...before,
        quoteOrFinding: action.payload.quoteOrFinding,
        relevance: action.payload.relevance,
      };
      const next = {
        ...state,
        evidence: state.evidence.map((evidence) =>
          evidence.id === after.id ? after : evidence,
        ),
      };

      return appendEvent(
        next,
        actor,
        action.type,
        "Edited evidence.",
        "evidence",
        after.id,
        action.reason,
        before,
        after,
      );
    }

    case "ADD_NOTE": {
      const missingSourceId = findMissingId(action.payload.sourceIds, (id) =>
        hasSource(state, id),
      );
      if (missingSourceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingSourceId,
          action.reason,
        );
      }

      const missingEvidenceId = findMissingId(action.payload.evidenceIds, (id) =>
        hasEvidence(state, id),
      );
      if (missingEvidenceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingEvidenceId,
          action.reason,
        );
      }

      const timestamp = now();
      const note: ResearchNote = {
        id: createId("note", state),
        content: action.payload.content,
        sourceIds: action.payload.sourceIds,
        evidenceIds: action.payload.evidenceIds,
        createdBy: actor,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const next = { ...state, notes: [...state.notes, note] };

      return appendEvent(
        next,
        actor,
        action.type,
        "Added research note.",
        "note",
        note.id,
        action.reason,
        undefined,
        note,
      );
    }

    case "EDIT_NOTE": {
      const before = state.notes.find(
        (note) => note.id === action.payload.noteId,
      );
      if (!before) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          action.payload.noteId,
          action.reason,
        );
      }

      const missingSourceId = findMissingId(action.payload.sourceIds, (id) =>
        hasSource(state, id),
      );
      if (missingSourceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingSourceId,
          action.reason,
        );
      }

      const missingEvidenceId = findMissingId(action.payload.evidenceIds, (id) =>
        hasEvidence(state, id),
      );
      if (missingEvidenceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingEvidenceId,
          action.reason,
        );
      }

      const after: ResearchNote = {
        ...before,
        content: action.payload.content,
        sourceIds: action.payload.sourceIds,
        evidenceIds: action.payload.evidenceIds,
        updatedAt: now(),
      };
      const next = {
        ...state,
        notes: state.notes.map((note) => (note.id === after.id ? after : note)),
      };

      return appendEvent(
        next,
        actor,
        action.type,
        "Edited research note.",
        "note",
        after.id,
        action.reason,
        before,
        after,
      );
    }

    case "PROPOSE_CLAIM": {
      const missingSupportingEvidenceId = findMissingId(
        action.payload.supportingEvidenceIds,
        (id) => hasEvidence(state, id),
      );
      if (missingSupportingEvidenceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingSupportingEvidenceId,
          action.reason,
        );
      }

      const missingCounterEvidenceId = findMissingId(
        action.payload.counterEvidenceIds,
        (id) => hasEvidence(state, id),
      );
      if (missingCounterEvidenceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingCounterEvidenceId,
          action.reason,
        );
      }

      const timestamp = now();
      const claim: Claim = {
        id: createId("claim", state),
        statement: action.payload.statement,
        reasoning: action.payload.reasoning,
        supportingEvidenceIds: action.payload.supportingEvidenceIds,
        counterEvidenceIds: action.payload.counterEvidenceIds,
        confidence: action.payload.confidence,
        status: "ai_proposed",
        createdBy: actor,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const next = { ...state, claims: [...state.claims, claim] };

      return appendEvent(
        next,
        actor,
        action.type,
        "Proposed claim.",
        "claim",
        claim.id,
        action.reason,
        undefined,
        claim,
      );
    }

    case "UPDATE_CLAIM": {
      const before = state.claims.find(
        (claim) => claim.id === action.payload.claimId,
      );
      if (!before) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          action.payload.claimId,
          action.reason,
        );
      }

      const missingSupportingEvidenceId = findMissingId(
        action.payload.supportingEvidenceIds,
        (id) => hasEvidence(state, id),
      );
      if (missingSupportingEvidenceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingSupportingEvidenceId,
          action.reason,
        );
      }

      const missingCounterEvidenceId = findMissingId(
        action.payload.counterEvidenceIds,
        (id) => hasEvidence(state, id),
      );
      if (missingCounterEvidenceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingCounterEvidenceId,
          action.reason,
        );
      }

      const after: Claim = {
        ...before,
        statement: action.payload.statement ?? before.statement,
        reasoning: action.payload.reasoning ?? before.reasoning,
        supportingEvidenceIds:
          action.payload.supportingEvidenceIds ?? before.supportingEvidenceIds,
        counterEvidenceIds:
          action.payload.counterEvidenceIds ?? before.counterEvidenceIds,
        confidence: action.payload.confidence ?? before.confidence,
        status: action.payload.status ?? before.status,
        humanDecisionNote:
          action.payload.humanDecisionNote ?? before.humanDecisionNote,
        updatedAt: now(),
      };
      const next = {
        ...state,
        claims: state.claims.map((claim) =>
          claim.id === after.id ? after : claim,
        ),
      };

      return appendEvent(
        next,
        actor,
        action.type,
        `Updated claim status to ${after.status}.`,
        "claim",
        after.id,
        action.reason,
        before,
        after,
      );
    }

    case "CHALLENGE_CLAIM": {
      const before = state.claims.find(
        (claim) => claim.id === action.payload.claimId,
      );
      if (!before) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          action.payload.claimId,
          action.reason,
        );
      }

      const missingCounterEvidenceId = findMissingId(
        action.payload.counterEvidenceIds,
        (id) => hasEvidence(state, id),
      );
      if (missingCounterEvidenceId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingCounterEvidenceId,
          action.reason,
        );
      }

      const after: Claim = {
        ...before,
        counterEvidenceIds: action.payload.counterEvidenceIds,
        status: "contested",
        humanDecisionNote: action.payload.note,
        updatedAt: now(),
      };
      const next = {
        ...state,
        claims: state.claims.map((claim) =>
          claim.id === after.id ? after : claim,
        ),
      };

      return appendEvent(
        next,
        actor,
        action.type,
        "Challenged claim.",
        "claim",
        after.id,
        action.reason,
        before,
        after,
      );
    }

    case "REQUEST_HUMAN_INPUT": {
      const missingRelatedObjectId = findMissingId(
        action.payload.relatedObjectIds,
        (id) => hasWorkspaceObject(state, id),
      );
      if (missingRelatedObjectId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          missingRelatedObjectId,
          action.reason,
        );
      }

      const request: HumanInputRequest = {
        id: createId("request", state),
        question: action.payload.question,
        relatedObjectIds: action.payload.relatedObjectIds,
        status: "open",
        createdAt: now(),
      };
      const next = {
        ...state,
        pendingHumanRequest: request,
        agentStatus: "waiting_for_human" as const,
      };

      return appendEvent(
        next,
        actor,
        action.type,
        "Agent requested human input.",
        "human_request",
        request.id,
        action.reason,
        undefined,
        request,
      );
    }

    case "ANSWER_HUMAN_INPUT": {
      const before = state.pendingHumanRequest;
      if (!before || before.id !== action.payload.requestId) {
        return rejectMissingObject(
          state,
          actor,
          action.type,
          action.payload.requestId,
          action.reason,
        );
      }

      const after: HumanInputRequest = {
        ...before,
        status: "answered",
        answer: action.payload.answer,
        answeredAt: now(),
      };
      const next = {
        ...state,
        pendingHumanRequest: after,
        agentStatus: "idle" as const,
      };

      return appendEvent(
        next,
        actor,
        action.type,
        "Human answered input request.",
        "human_request",
        after.id,
        action.reason,
        before,
        after,
      );
    }

    case "EDIT_BRIEF": {
      const before = state.brief;
      const after = {
        markdown: action.payload.markdown,
        updatedBy: actor,
        updatedAt: now(),
      };
      const next = { ...state, brief: after };

      return appendEvent(
        next,
        actor,
        action.type,
        "Edited final brief.",
        "brief",
        "brief",
        action.reason,
        before,
        after,
      );
    }

    case "WAIT":
      return appendEvent(
        state,
        actor,
        action.type,
        `Agent waited for: ${action.payload.waitingFor}`,
        undefined,
        undefined,
        action.reason,
      );

    case "FINISH": {
      const next = {
        ...state,
        completed: true,
        agentStatus: "completed" as const,
      };

      return appendEvent(
        next,
        actor,
        action.type,
        "Completed task.",
        "task",
        state.task.id,
        action.reason,
        state.completed,
        true,
      );
    }
  }
}

function appendEvent(
  state: WorkspaceState,
  actor: Actor,
  actionType: string,
  summary: string,
  objectType?: WorkspaceObjectType,
  objectId?: string,
  reason?: string,
  before?: unknown,
  after?: unknown,
): WorkspaceState {
  return {
    ...state,
    events: [
      ...state.events,
      createWorkspaceEvent(
        {
          actor,
          actionType,
          objectType,
          objectId,
          summary,
          before,
          after,
          reason,
        },
        state.events.length,
      ),
    ],
  };
}

function rejectMissingObject(
  state: WorkspaceState,
  actor: Actor,
  actionType: string,
  objectId: string,
  reason?: string,
): WorkspaceState {
  return {
    ...state,
    events: [
      ...state.events,
      createWorkspaceEvent(
        {
          actor,
          actionType: "ACTION_REJECTED",
          objectId,
          summary: `${actionType} rejected because object ${objectId} was not found.`,
          before: state,
          after: state,
          reason,
        },
        state.events.length,
      ),
    ],
  };
}
