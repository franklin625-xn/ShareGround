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

let objectCounter = 0;

function createId(prefix: string) {
  objectCounter += 1;
  return `${prefix}-${objectCounter.toString().padStart(4, "0")}`;
}

function now() {
  return new Date().toISOString();
}

export function resetObjectCounterForTests() {
  objectCounter = 0;
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
        createWorkspaceEvent({
          actor,
          actionType: "ACTION_REJECTED",
          summary: permission.reason ?? `Action ${action.type} was rejected.`,
          before: state,
          after: state,
          reason: action.reason,
        }),
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
        id: createId("source"),
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

    case "ADD_EVIDENCE": {
      const evidence: Evidence = {
        id: createId("evidence"),
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

    case "ADD_NOTE": {
      const timestamp = now();
      const note: ResearchNote = {
        id: createId("note"),
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
      const timestamp = now();
      const claim: Claim = {
        id: createId("claim"),
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
      const request: HumanInputRequest = {
        id: createId("request"),
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
      createWorkspaceEvent({
        actor,
        actionType,
        objectType,
        objectId,
        summary,
        before,
        after,
        reason,
      }),
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
      createWorkspaceEvent({
        actor,
        actionType: "ACTION_REJECTED",
        objectId,
        summary: `${actionType} rejected because object ${objectId} was not found.`,
        before: state,
        after: state,
        reason,
      }),
    ],
  };
}
