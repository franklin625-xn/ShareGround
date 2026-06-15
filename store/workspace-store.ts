import type { Actor } from "@/core/types";
import type { WorkspaceAction } from "@/core/schemas";
import { applyWorkspaceAction } from "@/core/reducer";
import type { AgentApiError, AgentApiSuccess } from "@/core/api-types";
import {
  createDemoWorkspaceState,
  createEmptyWorkspaceState,
} from "@/core/workspace-factory";
import type { WorkspaceState } from "@/core/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "sharedground-workspace";

export type AgentMode = "idle" | "mock" | "real" | "fallback";

export interface WorkspaceStore {
  workspace: WorkspaceState;
  agentRunning: boolean;
  agentError: string | null;
  /** Last agent execution mode — visible in the UI so the user knows what ran. */
  agentMode: AgentMode;
  loadDemo: () => void;
  reset: () => void;
  applyAction: (action: WorkspaceAction, actor: Actor) => void;
  runAgent: () => Promise<void>;
  /** Replaces the entire workspace state (used for initial load from new task form). */
  setWorkspace: (workspace: WorkspaceState) => void;
}

function buildInitialWorkspace(): WorkspaceState {
  return createEmptyWorkspaceState({
    title: "New Research Task",
    question: "",
    scope: "",
  });
}

export const useWorkspaceStore =
  /* c8 ignore next 3 — persist middleware is SSR-safe by design; coverage needs explicit skip */
  create<WorkspaceStore>()(
    persist(
      (set) => ({
        workspace: buildInitialWorkspace(),
        agentRunning: false,
        agentError: null,
        agentMode: "idle" as AgentMode,

        loadDemo: () => {
          set({
            workspace: createDemoWorkspaceState(),
            agentError: null,
            agentMode: "idle",
          });
        },

        reset: () => {
          set({
            workspace: buildInitialWorkspace(),
            agentError: null,
            agentRunning: false,
            agentMode: "idle",
          });
        },

        applyAction: (action: WorkspaceAction, actor: Actor) => {
          set((state) => ({
            workspace: applyWorkspaceAction(state.workspace, action, actor),
            agentError: null,
          }));
        },

        runAgent: async () => {
          set({ agentRunning: true, agentError: null });

          try {
            const state = useWorkspaceStore.getState().workspace;

            const response = await fetch("/api/agent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(state),
            });

            if (!response.ok) {
              const errorBody = await response
                .text()
                .catch(() => "Unknown error");
              throw new Error(`API error: ${errorBody.substring(0, 200)}`);
            }

            const result: AgentApiSuccess | AgentApiError =
              await response.json();

            if ("error" in result && !("state" in result)) {
              throw new Error(result.error);
            }

            const success = result as AgentApiSuccess;

            set({
              workspace: success.state,
              agentError: success.error ?? null,
              agentMode: success.source === "real"
                ? "real"
                : success.usedFallback
                  ? "fallback"
                  : "mock",
            });
          } catch (err) {
            set({
              agentError:
                err instanceof Error
                  ? err.message
                  : "Agent execution failed.",
              agentMode: "fallback",
            });
          } finally {
            set({ agentRunning: false });
          }
        },

        setWorkspace: (workspace: WorkspaceState) => {
          set({ workspace, agentError: null, agentMode: "idle" });
        },
      }),
      {
        name: STORAGE_KEY,
        storage:
          /* c8 ignore next 4 */
          typeof window !== "undefined"
            ? createJSONStorage(() => localStorage)
            : undefined,
        partialize: (state) => ({
          workspace: state.workspace,
          agentError: state.agentError,
        }),
      },
    ),
  );

/** For use outside React components — returns the raw store API. */
export function getWorkspaceStore() {
  return useWorkspaceStore;
}
