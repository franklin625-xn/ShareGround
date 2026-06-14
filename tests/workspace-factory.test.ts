import { describe, expect, it } from "vitest";
import {
  createDemoWorkspaceState,
  createEmptyWorkspaceState,
} from "@/core/workspace-factory";

describe("createDemoWorkspaceState", () => {
  it("returns a valid WorkspaceState with the default task", () => {
    const state = createDemoWorkspaceState();

    expect(state.task.id).toBe("demo-task-001");
    expect(state.task.title).toContain("EU Industrial Policy");
    expect(state.task.sourceMode).toBe("demo_corpus");
    expect(state.agentStatus).toBe("idle");
    expect(state.completed).toBe(false);
    expect(state.events).toEqual([]);
  });

  it("includes 8 pre-populated sources", () => {
    const state = createDemoWorkspaceState();

    expect(state.sources).toHaveLength(8);
    expect(state.sources[0]?.id).toBe("demo-source-001");
    expect(state.sources[0]?.title).toContain("Net-Zero Industry Act");
    expect(state.sources[0]?.addedBy).toBe("system");
  });

  it("includes 5 starter evidence items keyed to sources", () => {
    const state = createDemoWorkspaceState();

    expect(state.evidence).toHaveLength(5);

    for (const ev of state.evidence) {
      expect(ev.id).toMatch(/^demo-evidence-\d{3}$/);
      expect(ev.sourceId).toMatch(/^demo-source-\d{3}$/);
      expect(ev.addedBy).toBe("system");
      expect(ev.quoteOrFinding.length).toBeGreaterThan(10);
      expect(ev.relevance.length).toBeGreaterThan(5);
    }
  });

  it("starts with empty notes, claims, and brief", () => {
    const state = createDemoWorkspaceState();

    expect(state.notes).toEqual([]);
    expect(state.claims).toEqual([]);
    expect(state.brief.markdown).toBe("");
    expect(state.brief.updatedBy).toBe("system");
  });

  it("has no pending human request", () => {
    const state = createDemoWorkspaceState();
    expect(state.pendingHumanRequest).toBeUndefined();
  });

  it("produces an isolated copy on each call", () => {
    const a = createDemoWorkspaceState();
    const b = createDemoWorkspaceState();

    expect(a.sources).not.toBe(b.sources);
    expect(a.evidence).not.toBe(b.evidence);
  });

  it("keeps demo evidence ids stable across repeated initialization", () => {
    const a = createDemoWorkspaceState();
    const b = createDemoWorkspaceState();

    expect(a.evidence.map((ev) => ev.id)).toEqual([
      "demo-evidence-001",
      "demo-evidence-002",
      "demo-evidence-003",
      "demo-evidence-004",
      "demo-evidence-005",
    ]);
    expect(b.evidence.map((ev) => ev.id)).toEqual(
      a.evidence.map((ev) => ev.id),
    );
  });
});

describe("createEmptyWorkspaceState", () => {
  it("creates a minimal workspace with provided task info", () => {
    const state = createEmptyWorkspaceState({
      title: "My Research",
      question: "What is the impact?",
      scope: "Brief scope description",
    });

    expect(state.task.title).toBe("My Research");
    expect(state.task.question).toBe("What is the impact?");
    expect(state.task.scope).toBe("Brief scope description");
    expect(state.task.id).toMatch(/^task-\d+$/);
    expect(state.task.createdAt).toBeTruthy();
  });

  it("returns empty arrays for all collections", () => {
    const state = createEmptyWorkspaceState({
      title: "Test",
      question: "Test?",
      scope: "Test scope",
    });

    expect(state.sources).toEqual([]);
    expect(state.evidence).toEqual([]);
    expect(state.notes).toEqual([]);
    expect(state.claims).toEqual([]);
    expect(state.events).toEqual([]);
  });

  it("defaults agent status to idle and completed to false", () => {
    const state = createEmptyWorkspaceState({
      title: "Test",
      question: "Test?",
      scope: "Test scope",
    });

    expect(state.agentStatus).toBe("idle");
    expect(state.completed).toBe(false);
  });
});
