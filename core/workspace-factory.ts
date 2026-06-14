import demoTask from "@/data/demo-task.json";
import demoSources from "@/data/demo-sources.json";
import type {
  Evidence,
  Source,
  WorkspaceState,
} from "@/core/types";

const DEMO_EVIDENCE: (Omit<Evidence, "id" | "createdAt">)[] = [
  {
    sourceId: "demo-source-001",
    quoteOrFinding:
      "The NZIA links public financial support to domestic manufacturing capacity, requiring at least 40% of net-zero technology deployment needs to be met by EU production by 2030.",
    relevance: "Direct evidence of EU localization pressure through regulatory benchmarks.",
    addedBy: "system",
  },
  {
    sourceId: "demo-source-003",
    quoteOrFinding:
      "The Foreign Subsidies Regulation enables the Commission to investigate Chinese state-backed enterprises for subsidized financing and non-commercial advantages in M&A and public procurement.",
    relevance: "Demonstrates how investment screening targets Chinese SOEs specifically.",
    addedBy: "system",
  },
  {
    sourceId: "demo-source-005",
    quoteOrFinding:
      "CATL's €7.3 billion Debrecen plant faced six-month delays due to environmental permitting and evolving EU battery regulation compliance requirements.",
    relevance: "Industry case showing regulatory friction in Chinese battery investment.",
    addedBy: "system",
  },
  {
    sourceId: "demo-source-006",
    quoteOrFinding:
      "BYD's Szeged EV factory is widely interpreted as a tariff-avoidance strategy: producing locally mitigates the EU's anti-subsidy duties of up to 48% on Chinese-made EVs.",
    relevance: "Shows causal link between EU trade measures and Chinese localization behavior.",
    addedBy: "system",
  },
  {
    sourceId: "demo-source-007",
    quoteOrFinding:
      "The Commission imposed countervailing duties of 17% to 36% on individual Chinese automakers after finding evidence of state subsidies including preferential financing and below-market inputs.",
    relevance: "Key data point on the scale of tariff escalation affecting Chinese EV exports.",
    addedBy: "system",
  },
];

export function createDemoWorkspaceState(): WorkspaceState {
  const now = "2026-06-15T00:00:00.000Z";

  const evidence: Evidence[] = DEMO_EVIDENCE.map((e, index) => ({
    ...e,
    id: `demo-evidence-${(index + 1).toString().padStart(3, "0")}`,
    createdAt: now,
  }));

  return {
    task: {
      id: demoTask.id,
      title: demoTask.title,
      question: demoTask.question,
      scope: demoTask.scope,
      sourceMode: demoTask.sourceMode as "demo_corpus" | "live_search",
      createdAt: demoTask.createdAt,
    },
    sources: [...demoSources] as Source[],
    evidence,
    notes: [],
    claims: [],
    brief: {
      markdown: "",
      updatedBy: "system",
      updatedAt: now,
    },
    events: [],
    agentStatus: "idle",
    completed: false,
  };
}

export function createWorkspaceState(
  overrides?: Partial<WorkspaceState>,
): WorkspaceState {
  const base = createDemoWorkspaceState();
  return { ...base, ...overrides };
}

export function createEmptyWorkspaceState(params: {
  title: string;
  question: string;
  scope: string;
}): WorkspaceState {
  const now = new Date().toISOString();

  return {
    task: {
      id: `task-${Date.now()}`,
      title: params.title,
      question: params.question,
      scope: params.scope,
      sourceMode: "demo_corpus",
      createdAt: now,
    },
    sources: [],
    evidence: [],
    notes: [],
    claims: [],
    brief: {
      markdown: "",
      updatedBy: "system",
      updatedAt: now,
    },
    events: [],
    agentStatus: "idle",
    completed: false,
  };
}
