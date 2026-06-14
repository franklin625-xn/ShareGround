import type { Actor } from "@/core/types";
import type { WorkspaceAction } from "@/core/schemas";
import { applyWorkspaceAction } from "@/core/reducer";
import {
  createDemoWorkspaceState,
  createEmptyWorkspaceState,
} from "@/core/workspace-factory";
import type { WorkspaceState } from "@/core/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "sharedground-workspace";

export interface WorkspaceStore {
  workspace: WorkspaceState;
  loadDemo: () => void;
  reset: () => void;
  applyAction: (action: WorkspaceAction, actor: Actor) => void;
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

        loadDemo: () => {
          set({ workspace: createDemoWorkspaceState() });
        },

        reset: () => {
          set({ workspace: buildInitialWorkspace() });
        },

        applyAction: (action: WorkspaceAction, actor: Actor) => {
          set((state) => ({
            workspace: applyWorkspaceAction(state.workspace, action, actor),
          }));
        },

        setWorkspace: (workspace: WorkspaceState) => {
          set({ workspace });
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
        }),
      },
    ),
  );

/** For use outside React components — returns the raw store API. */
export function getWorkspaceStore() {
  return useWorkspaceStore;
}
