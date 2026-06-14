export type Actor = "human" | "agent" | "system";

export type ClaimStatus =
  | "ai_proposed"
  | "human_confirmed"
  | "human_revised"
  | "contested"
  | "evidence_insufficient"
  | "final";

export type AgentStatus =
  | "idle"
  | "working"
  | "waiting_for_human"
  | "blocked"
  | "completed";

export type ResearchTask = {
  id: string;
  title: string;
  question: string;
  scope: string;
  sourceMode: "demo_corpus" | "live_search";
  createdAt: string;
};

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  publishedAt?: string;
  summary: string;
  addedBy: Actor;
  createdAt: string;
};

export type Evidence = {
  id: string;
  sourceId: string;
  quoteOrFinding: string;
  relevance: string;
  addedBy: Actor;
  createdAt: string;
};

export type ResearchNote = {
  id: string;
  content: string;
  sourceIds: string[];
  evidenceIds: string[];
  createdBy: Actor;
  createdAt: string;
  updatedAt: string;
};

export type Claim = {
  id: string;
  statement: string;
  reasoning: string;
  supportingEvidenceIds: string[];
  counterEvidenceIds: string[];
  confidence?: number;
  status: ClaimStatus;
  createdBy: Actor;
  createdAt: string;
  updatedAt: string;
  humanDecisionNote?: string;
};

export type Brief = {
  markdown: string;
  updatedBy: Actor;
  updatedAt: string;
};

export type HumanInputRequest = {
  id: string;
  question: string;
  relatedObjectIds: string[];
  status: "open" | "answered";
  answer?: string;
  createdAt: string;
  answeredAt?: string;
};

export type WorkspaceObjectType =
  | "task"
  | "source"
  | "evidence"
  | "note"
  | "claim"
  | "brief"
  | "human_request";

export type WorkspaceEvent = {
  id: string;
  timestamp: string;
  actor: Actor;
  actionType: string;
  objectType?: WorkspaceObjectType;
  objectId?: string;
  summary: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

export type WorkspaceState = {
  task: ResearchTask;
  sources: Source[];
  evidence: Evidence[];
  notes: ResearchNote[];
  claims: Claim[];
  brief: Brief;
  events: WorkspaceEvent[];
  agentStatus: AgentStatus;
  pendingHumanRequest?: HumanInputRequest;
  completed: boolean;
};
