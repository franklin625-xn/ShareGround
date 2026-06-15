import type {
  Claim,
  Evidence,
  HumanInputRequest,
  ResearchNote,
  Source,
  WorkspaceEvent,
  WorkspaceState,
} from "@/core/types";

export type AgentContext = {
  taskTitle: string;
  question: string;
  scope: string;
  sourceCount: number;
  evidenceCount: number;
  agentNotes: ResearchNote[];
  agentClaims: Claim[];
  openHumanRequest?: HumanInputRequest;
  answeredHumanRequest?: HumanInputRequest;
  briefMarkdown: string;

  /** Full data — used by real agent context builder */
  sources: Source[];
  evidence: Evidence[];
  allNotes: ResearchNote[];
  allClaims: Claim[];
  humanEvents: WorkspaceEvent[];
};

export function buildAgentContext(state: WorkspaceState): AgentContext {
  const pendingRequest = state.pendingHumanRequest;

  return {
    taskTitle: state.task.title,
    question: state.task.question,
    scope: state.task.scope,
    sourceCount: state.sources.length,
    evidenceCount: state.evidence.length,
    agentNotes: state.notes.filter((note) => note.createdBy === "agent"),
    agentClaims: state.claims.filter((claim) => claim.createdBy === "agent"),
    openHumanRequest:
      pendingRequest?.status === "open" ? pendingRequest : undefined,
    answeredHumanRequest:
      pendingRequest?.status === "answered" ? pendingRequest : undefined,
    briefMarkdown: state.brief.markdown,

    // Full data
    sources: state.sources,
    evidence: state.evidence,
    allNotes: state.notes,
    allClaims: state.claims,
    humanEvents: state.events.filter((e) => e.actor === "human"),
  };
}

/**
 * Builds a human-readable snapshot of the workspace for the real agent's prompt.
 */
export function buildWorkspaceSnapshot(state: WorkspaceState): string {
  const lines: string[] = [];

  lines.push(`## Task`);
  lines.push(`Title: ${state.task.title}`);
  lines.push(`Question: ${state.task.question}`);
  lines.push(`Scope: ${state.task.scope}`);
  lines.push("");

  lines.push(`## Sources (${state.sources.length})`);
  for (const s of state.sources) {
    lines.push(`- [${s.id}] "${s.title}" — ${s.publisher}`);
    lines.push(`  Summary: ${s.summary}`);
  }
  lines.push("");

  lines.push(`## Evidence (${state.evidence.length})`);
  for (const e of state.evidence) {
    lines.push(
      `- [${e.id}] from ${e.sourceId}: "${e.quoteOrFinding.substring(0, 120)}…"`,
    );
    lines.push(`  Relevance: ${e.relevance}`);
  }
  lines.push("");

  lines.push(`## Research Notes (${state.notes.length})`);
  for (const n of state.notes) {
    lines.push(
      `- [${n.id}] by ${n.createdBy}: "${n.content.substring(0, 120)}…"`,
    );
  }
  lines.push("");

  lines.push(`## Claims (${state.claims.length})`);
  for (const c of state.claims) {
    lines.push(
      `- [${c.id}] [${c.status}] by ${c.createdBy}: "${c.statement}"`,
    );
    if (c.supportingEvidenceIds.length > 0) {
      lines.push(`  Supporting: ${c.supportingEvidenceIds.join(", ")}`);
    }
    if (c.counterEvidenceIds.length > 0) {
      lines.push(`  Counter: ${c.counterEvidenceIds.join(", ")}`);
    }
  }
  lines.push("");

  lines.push(`## Final Brief`);
  lines.push(
    state.brief.markdown
      ? `Brief exists (${state.brief.markdown.length} chars), last updated by ${state.brief.updatedBy}`
      : "Brief not yet drafted.",
  );
  lines.push("");

  if (state.pendingHumanRequest) {
    const req = state.pendingHumanRequest;
    lines.push(`## Pending Human Request`);
    lines.push(`Status: ${req.status}`);
    lines.push(`Question: ${req.question}`);
    if (req.answer) lines.push(`Answer: ${req.answer}`);
    lines.push("");
  }

  lines.push(`## Agent Status: ${state.agentStatus}`);
  lines.push(`## Task Completed: ${state.completed}`);

  return lines.join("\n");
}
