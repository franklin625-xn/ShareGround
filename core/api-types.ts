import type { AgentTurn } from "@/agent/action-schema";
import type { WorkspaceState } from "@/core/types";

export interface AgentApiSuccess {
  turn: AgentTurn;
  state: WorkspaceState;
  source: "mock" | "real";
  usedFallback: boolean;
  error?: string;
}

export interface AgentApiError {
  error: string;
}
