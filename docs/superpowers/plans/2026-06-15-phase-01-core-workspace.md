# Phase 1 Core Workspace Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the TypeScript project foundation and implement the shared workspace state machine with reducer-level permissions and tests.

**Architecture:** All workspace mutations flow through a discriminated union action schema and one pure reducer. Permissions are checked inside the reducer, not only in UI. Every accepted or rejected action produces an auditable event.

**Tech Stack:** Next.js, TypeScript, Zod, Vitest.

---

## Files

Create:

```text
package.json
tsconfig.json
vitest.config.ts
next.config.ts
app/layout.tsx
app/page.tsx
app/globals.css
core/types.ts
core/schemas.ts
core/permissions.ts
core/event-factory.ts
core/reducer.ts
agent/action-schema.ts
tests/permissions.test.ts
tests/reducer.test.ts
```

Do not create UI panels, mock agent files, model API routes, evaluation files, or demo data in this phase.

## Task 1: Project Skeleton

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Create package scripts**

Write `package.json`:

```json
{
  "name": "sharedground",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@ai-sdk/openai": "^2.0.0",
    "ai": "^5.0.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.25.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.8.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create TypeScript config**

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create Vitest config**

Write `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create minimal Next files**

Write `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

Write `app/layout.tsx`:

```tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SharedGround",
  description: "A shared research workspace for humans and AI agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Write `app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>SharedGround</h1>
      <p>Shared workspace foundation is ready.</p>
    </main>
  );
}
```

Write `app/globals.css`:

```css
:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
npm install
```

Expected: dependencies install and a lockfile is created.

- [ ] **Step 6: Verify skeleton**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit skeleton**

Run:

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts next.config.ts app
git commit -m "chore: initialize sharedground app"
```

Expected: commit succeeds.

## Task 2: Core Types

**Files:**

- Create: `core/types.ts`

- [ ] **Step 1: Write workspace domain types**

Write `core/types.ts`:

```ts
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
```

- [ ] **Step 2: Verify types**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit types**

Run:

```bash
git add core/types.ts
git commit -m "feat: define workspace domain types"
```

Expected: commit succeeds.

## Task 3: Action Schema

**Files:**

- Create: `agent/action-schema.ts`
- Create: `core/schemas.ts`

- [ ] **Step 1: Define action schemas**

Write `agent/action-schema.ts`:

```ts
import { z } from "zod";

const reasonSchema = z.string().min(1).optional();

export const workspaceActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SEARCH_SOURCE"),
    payload: z.object({ query: z.string().min(1) }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("ADD_SOURCE"),
    payload: z.object({
      title: z.string().min(1),
      publisher: z.string().min(1),
      url: z.string().url().optional(),
      publishedAt: z.string().optional(),
      summary: z.string().min(1),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("ADD_EVIDENCE"),
    payload: z.object({
      sourceId: z.string().min(1),
      quoteOrFinding: z.string().min(1),
      relevance: z.string().min(1),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("ADD_NOTE"),
    payload: z.object({
      content: z.string().min(1),
      sourceIds: z.array(z.string()),
      evidenceIds: z.array(z.string()),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("EDIT_NOTE"),
    payload: z.object({
      noteId: z.string().min(1),
      content: z.string().min(1),
      sourceIds: z.array(z.string()),
      evidenceIds: z.array(z.string()),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("PROPOSE_CLAIM"),
    payload: z.object({
      statement: z.string().min(1),
      reasoning: z.string().min(1),
      supportingEvidenceIds: z.array(z.string()),
      counterEvidenceIds: z.array(z.string()),
      confidence: z.number().min(0).max(1).optional(),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("UPDATE_CLAIM"),
    payload: z.object({
      claimId: z.string().min(1),
      statement: z.string().min(1).optional(),
      reasoning: z.string().min(1).optional(),
      supportingEvidenceIds: z.array(z.string()).optional(),
      counterEvidenceIds: z.array(z.string()).optional(),
      confidence: z.number().min(0).max(1).optional(),
      status: z
        .enum([
          "ai_proposed",
          "human_confirmed",
          "human_revised",
          "contested",
          "evidence_insufficient",
          "final",
        ])
        .optional(),
      humanDecisionNote: z.string().optional(),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("CHALLENGE_CLAIM"),
    payload: z.object({
      claimId: z.string().min(1),
      counterEvidenceIds: z.array(z.string()),
      note: z.string().min(1),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("REQUEST_HUMAN_INPUT"),
    payload: z.object({
      question: z.string().min(1),
      relatedObjectIds: z.array(z.string()),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("ANSWER_HUMAN_INPUT"),
    payload: z.object({
      requestId: z.string().min(1),
      answer: z.string().min(1),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("EDIT_BRIEF"),
    payload: z.object({
      markdown: z.string(),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("WAIT"),
    payload: z.object({
      waitingFor: z.string().min(1),
    }),
    reason: reasonSchema,
  }),
  z.object({
    type: z.literal("FINISH"),
    payload: z.object({}),
    reason: reasonSchema,
  }),
]);

export const agentTurnSchema = z.object({
  situation: z.string(),
  nextGoal: z.string(),
  actions: z.array(workspaceActionSchema).max(3),
  stopReason: z.enum([
    "turn_complete",
    "waiting_for_human",
    "insufficient_evidence",
    "task_complete",
  ]),
});

export type WorkspaceAction = z.infer<typeof workspaceActionSchema>;
export type AgentTurn = z.infer<typeof agentTurnSchema>;
```

Write `core/schemas.ts`:

```ts
export {
  agentTurnSchema,
  workspaceActionSchema,
  type AgentTurn,
  type WorkspaceAction,
} from "@/agent/action-schema";
```

- [ ] **Step 2: Verify schemas**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit schemas**

Run:

```bash
git add agent/action-schema.ts core/schemas.ts
git commit -m "feat: define structured workspace action schema"
```

Expected: commit succeeds.

## Task 4: Permissions

**Files:**

- Create: `core/permissions.ts`
- Create: `tests/permissions.test.ts`

- [ ] **Step 1: Write failing permission tests**

Write `tests/permissions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canApplyWorkspaceAction } from "@/core/permissions";
import type { WorkspaceAction } from "@/core/schemas";

const updateClaimToFinal: WorkspaceAction = {
  type: "UPDATE_CLAIM",
  payload: { claimId: "claim-1", status: "final" },
  reason: "Attempt to finalize.",
};

const updateClaimToHumanConfirmed: WorkspaceAction = {
  type: "UPDATE_CLAIM",
  payload: { claimId: "claim-1", status: "human_confirmed" },
  reason: "Attempt to confirm.",
};

describe("canApplyWorkspaceAction", () => {
  it("allows an agent to propose a claim", () => {
    const action: WorkspaceAction = {
      type: "PROPOSE_CLAIM",
      payload: {
        statement: "EU policy increases localization pressure.",
        reasoning: "Policy support is linked to local production capacity.",
        supportingEvidenceIds: ["evidence-1"],
        counterEvidenceIds: [],
        confidence: 0.7,
      },
      reason: "The evidence supports a preliminary claim.",
    };

    expect(canApplyWorkspaceAction("agent", action).allowed).toBe(true);
  });

  it("rejects an agent finalizing a claim", () => {
    const result = canApplyWorkspaceAction("agent", updateClaimToFinal);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Agent cannot set claim status to final");
  });

  it("rejects an agent confirming a claim as human", () => {
    const result = canApplyWorkspaceAction("agent", updateClaimToHumanConfirmed);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Agent cannot set claim status to human_confirmed");
  });

  it("allows a human to finalize a claim", () => {
    expect(canApplyWorkspaceAction("human", updateClaimToFinal).allowed).toBe(true);
  });

  it("rejects an agent answering human input", () => {
    const action: WorkspaceAction = {
      type: "ANSWER_HUMAN_INPUT",
      payload: { requestId: "request-1", answer: "Focus on EV batteries." },
      reason: "Answer request.",
    };

    expect(canApplyWorkspaceAction("agent", action).allowed).toBe(false);
  });
});
```

- [ ] **Step 2: Run permission tests to verify failure**

Run:

```bash
npm run test -- tests/permissions.test.ts
```

Expected: FAIL because `core/permissions.ts` does not exist.

- [ ] **Step 3: Implement permissions**

Write `core/permissions.ts`:

```ts
import type { Actor, ClaimStatus } from "@/core/types";
import type { WorkspaceAction } from "@/core/schemas";

export type PermissionResult = {
  allowed: boolean;
  reason?: string;
};

const agentForbiddenClaimStatuses: ClaimStatus[] = [
  "human_confirmed",
  "human_revised",
  "final",
];

export function canApplyWorkspaceAction(
  actor: Actor,
  action: WorkspaceAction,
): PermissionResult {
  if (actor === "system") {
    return { allowed: true };
  }

  if (actor === "human") {
    if (action.type === "SEARCH_SOURCE" || action.type === "WAIT") {
      return {
        allowed: false,
        reason: `Human cannot perform ${action.type}; this action is reserved for agent control flow.`,
      };
    }

    return { allowed: true };
  }

  if (action.type === "ANSWER_HUMAN_INPUT") {
    return {
      allowed: false,
      reason: "Agent cannot answer human input requests.",
    };
  }

  if (action.type === "FINISH") {
    return {
      allowed: false,
      reason: "Agent cannot finally complete the task.",
    };
  }

  if (action.type === "UPDATE_CLAIM") {
    const requestedStatus = action.payload.status;

    if (requestedStatus && agentForbiddenClaimStatuses.includes(requestedStatus)) {
      return {
        allowed: false,
        reason: `Agent cannot set claim status to ${requestedStatus}.`,
      };
    }
  }

  return { allowed: true };
}
```

- [ ] **Step 4: Run permission tests to verify pass**

Run:

```bash
npm run test -- tests/permissions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit permissions**

Run:

```bash
git add core/permissions.ts tests/permissions.test.ts
git commit -m "feat: enforce workspace action permissions"
```

Expected: commit succeeds.

## Task 5: Event Factory

**Files:**

- Create: `core/event-factory.ts`

- [ ] **Step 1: Implement event creation**

Write `core/event-factory.ts`:

```ts
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

let eventCounter = 0;

export function createWorkspaceEvent(
  input: CreateWorkspaceEventInput,
): WorkspaceEvent {
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

export function resetEventCounterForTests() {
  eventCounter = 0;
}
```

- [ ] **Step 2: Verify event factory**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit event factory**

Run:

```bash
git add core/event-factory.ts
git commit -m "feat: add workspace event factory"
```

Expected: commit succeeds.

## Task 6: Reducer

**Files:**

- Create: `core/reducer.ts`
- Create: `tests/reducer.test.ts`

- [ ] **Step 1: Write failing reducer tests**

Write `tests/reducer.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { applyWorkspaceAction } from "@/core/reducer";
import { resetEventCounterForTests } from "@/core/event-factory";
import type { WorkspaceState } from "@/core/types";

function createState(): WorkspaceState {
  return {
    task: {
      id: "task-1",
      title: "EU industrial policy and Chinese investment",
      question: "How do EU industrial policy changes affect Chinese companies investing in Europe?",
      scope: "Demo research brief",
      sourceMode: "demo_corpus",
      createdAt: "2026-06-15T00:00:00.000Z",
    },
    sources: [
      {
        id: "source-1",
        title: "Net-Zero Industry Act",
        publisher: "European Commission",
        summary: "EU policy aims to expand clean technology manufacturing capacity.",
        addedBy: "system",
        createdAt: "2026-06-15T00:00:00.000Z",
      },
    ],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        quoteOrFinding: "The EU links public support to local manufacturing capacity.",
        relevance: "Shows localization pressure.",
        addedBy: "system",
        createdAt: "2026-06-15T00:00:00.000Z",
      },
    ],
    notes: [],
    claims: [],
    brief: {
      markdown: "",
      updatedBy: "system",
      updatedAt: "2026-06-15T00:00:00.000Z",
    },
    events: [],
    agentStatus: "idle",
    completed: false,
  };
}

describe("applyWorkspaceAction", () => {
  beforeEach(() => {
    resetEventCounterForTests();
  });

  it("lets an agent propose a claim and writes an event", () => {
    const next = applyWorkspaceAction(
      createState(),
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Support schemes and regulatory tools favor local capacity.",
          supportingEvidenceIds: ["evidence-1"],
          counterEvidenceIds: [],
          confidence: 0.74,
        },
        reason: "Evidence supports a preliminary claim.",
      },
      "agent",
    );

    expect(next.claims).toHaveLength(1);
    expect(next.claims[0]?.status).toBe("ai_proposed");
    expect(next.events[0]?.actionType).toBe("PROPOSE_CLAIM");
    expect(next.events[0]?.actor).toBe("agent");
  });

  it("rejects an agent finalizing a claim and writes ACTION_REJECTED", () => {
    const withClaim = applyWorkspaceAction(
      createState(),
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Support schemes and regulatory tools favor local capacity.",
          supportingEvidenceIds: ["evidence-1"],
          counterEvidenceIds: [],
        },
        reason: "Evidence supports a preliminary claim.",
      },
      "agent",
    );

    const next = applyWorkspaceAction(
      withClaim,
      {
        type: "UPDATE_CLAIM",
        payload: { claimId: withClaim.claims[0]!.id, status: "final" },
        reason: "Agent tries to finalize.",
      },
      "agent",
    );

    expect(next.claims[0]?.status).toBe("ai_proposed");
    expect(next.events.at(-1)?.actionType).toBe("ACTION_REJECTED");
    expect(next.events.at(-1)?.summary).toContain("Agent cannot set claim status to final");
  });

  it("lets a human revise a claim", () => {
    const withClaim = applyWorkspaceAction(
      createState(),
      {
        type: "PROPOSE_CLAIM",
        payload: {
          statement: "EU policy increases localization pressure.",
          reasoning: "Support schemes and regulatory tools favor local capacity.",
          supportingEvidenceIds: ["evidence-1"],
          counterEvidenceIds: [],
        },
        reason: "Evidence supports a preliminary claim.",
      },
      "agent",
    );

    const next = applyWorkspaceAction(
      withClaim,
      {
        type: "UPDATE_CLAIM",
        payload: {
          claimId: withClaim.claims[0]!.id,
          statement: "EU policy increases localization pressure, with effects varying by sector.",
          status: "human_revised",
          humanDecisionNote: "Narrow the claim by sector.",
        },
        reason: "Human narrows the judgment.",
      },
      "human",
    );

    expect(next.claims[0]?.status).toBe("human_revised");
    expect(next.claims[0]?.statement).toContain("varying by sector");
    expect(next.events.at(-1)?.actor).toBe("human");
  });

  it("sets waiting status when agent requests human input", () => {
    const next = applyWorkspaceAction(
      createState(),
      {
        type: "REQUEST_HUMAN_INPUT",
        payload: {
          question: "Should the brief focus on EV batteries or semiconductors?",
          relatedObjectIds: [],
        },
        reason: "Direction choice belongs to human.",
      },
      "agent",
    );

    expect(next.agentStatus).toBe("waiting_for_human");
    expect(next.pendingHumanRequest?.status).toBe("open");
  });

  it("keeps state stable when agent waits", () => {
    const state = createState();
    const next = applyWorkspaceAction(
      state,
      {
        type: "WAIT",
        payload: { waitingFor: "Human direction." },
        reason: "Open request exists.",
      },
      "agent",
    );

    expect(next.sources).toEqual(state.sources);
    expect(next.events[0]?.actionType).toBe("WAIT");
  });

  it("lets human answer an open request and returns agent to idle", () => {
    const waiting = applyWorkspaceAction(
      createState(),
      {
        type: "REQUEST_HUMAN_INPUT",
        payload: {
          question: "Should the brief focus on EV batteries or semiconductors?",
          relatedObjectIds: [],
        },
        reason: "Direction choice belongs to human.",
      },
      "agent",
    );

    const next = applyWorkspaceAction(
      waiting,
      {
        type: "ANSWER_HUMAN_INPUT",
        payload: {
          requestId: waiting.pendingHumanRequest!.id,
          answer: "Focus on EV batteries.",
        },
        reason: "Human chooses focus.",
      },
      "human",
    );

    expect(next.agentStatus).toBe("idle");
    expect(next.pendingHumanRequest?.status).toBe("answered");
    expect(next.pendingHumanRequest?.answer).toBe("Focus on EV batteries.");
  });
});
```

- [ ] **Step 2: Run reducer tests to verify failure**

Run:

```bash
npm run test -- tests/reducer.test.ts
```

Expected: FAIL because `core/reducer.ts` does not exist.

- [ ] **Step 3: Implement reducer**

Write `core/reducer.ts`:

```ts
import { canApplyWorkspaceAction } from "@/core/permissions";
import { createWorkspaceEvent } from "@/core/event-factory";
import type { WorkspaceAction } from "@/core/schemas";
import type {
  Actor,
  Claim,
  Evidence,
  HumanInputRequest,
  ResearchNote,
  Source,
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
      return appendEvent(state, actor, action.type, "Search source requested.", undefined, undefined, action.reason);

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
      return appendEvent(next, actor, action.type, `Added source: ${source.title}`, "source", source.id, action.reason, undefined, source);
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
      return appendEvent(next, actor, action.type, "Added evidence.", "evidence", evidence.id, action.reason, undefined, evidence);
    }

    case "ADD_NOTE": {
      const note: ResearchNote = {
        id: createId("note"),
        content: action.payload.content,
        sourceIds: action.payload.sourceIds,
        evidenceIds: action.payload.evidenceIds,
        createdBy: actor,
        createdAt: now(),
        updatedAt: now(),
      };
      const next = { ...state, notes: [...state.notes, note] };
      return appendEvent(next, actor, action.type, "Added research note.", "note", note.id, action.reason, undefined, note);
    }

    case "EDIT_NOTE": {
      const before = state.notes.find((note) => note.id === action.payload.noteId);
      if (!before) return rejectMissingObject(state, actor, action.type, action.payload.noteId, action.reason);
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
      return appendEvent(next, actor, action.type, "Edited research note.", "note", after.id, action.reason, before, after);
    }

    case "PROPOSE_CLAIM": {
      const claim: Claim = {
        id: createId("claim"),
        statement: action.payload.statement,
        reasoning: action.payload.reasoning,
        supportingEvidenceIds: action.payload.supportingEvidenceIds,
        counterEvidenceIds: action.payload.counterEvidenceIds,
        confidence: action.payload.confidence,
        status: "ai_proposed",
        createdBy: actor,
        createdAt: now(),
        updatedAt: now(),
      };
      const next = { ...state, claims: [...state.claims, claim] };
      return appendEvent(next, actor, action.type, "Proposed claim.", "claim", claim.id, action.reason, undefined, claim);
    }

    case "UPDATE_CLAIM": {
      const before = state.claims.find((claim) => claim.id === action.payload.claimId);
      if (!before) return rejectMissingObject(state, actor, action.type, action.payload.claimId, action.reason);
      const after: Claim = {
        ...before,
        statement: action.payload.statement ?? before.statement,
        reasoning: action.payload.reasoning ?? before.reasoning,
        supportingEvidenceIds: action.payload.supportingEvidenceIds ?? before.supportingEvidenceIds,
        counterEvidenceIds: action.payload.counterEvidenceIds ?? before.counterEvidenceIds,
        confidence: action.payload.confidence ?? before.confidence,
        status: action.payload.status ?? before.status,
        humanDecisionNote: action.payload.humanDecisionNote ?? before.humanDecisionNote,
        updatedAt: now(),
      };
      const next = {
        ...state,
        claims: state.claims.map((claim) => (claim.id === after.id ? after : claim)),
      };
      return appendEvent(next, actor, action.type, `Updated claim status to ${after.status}.`, "claim", after.id, action.reason, before, after);
    }

    case "CHALLENGE_CLAIM": {
      const before = state.claims.find((claim) => claim.id === action.payload.claimId);
      if (!before) return rejectMissingObject(state, actor, action.type, action.payload.claimId, action.reason);
      const after: Claim = {
        ...before,
        counterEvidenceIds: action.payload.counterEvidenceIds,
        status: "contested",
        humanDecisionNote: action.payload.note,
        updatedAt: now(),
      };
      const next = {
        ...state,
        claims: state.claims.map((claim) => (claim.id === after.id ? after : claim)),
      };
      return appendEvent(next, actor, action.type, "Challenged claim.", "claim", after.id, action.reason, before, after);
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
      return appendEvent(next, actor, action.type, "Agent requested human input.", "human_request", request.id, action.reason, undefined, request);
    }

    case "ANSWER_HUMAN_INPUT": {
      const before = state.pendingHumanRequest;
      if (!before || before.id !== action.payload.requestId) {
        return rejectMissingObject(state, actor, action.type, action.payload.requestId, action.reason);
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
      return appendEvent(next, actor, action.type, "Human answered input request.", "human_request", after.id, action.reason, before, after);
    }

    case "EDIT_BRIEF": {
      const before = state.brief;
      const after = {
        markdown: action.payload.markdown,
        updatedBy: actor,
        updatedAt: now(),
      };
      const next = { ...state, brief: after };
      return appendEvent(next, actor, action.type, "Edited final brief.", "brief", "brief", action.reason, before, after);
    }

    case "WAIT":
      return appendEvent(state, actor, action.type, `Agent waited for: ${action.payload.waitingFor}`, undefined, undefined, action.reason);

    case "FINISH": {
      const next = {
        ...state,
        completed: true,
        agentStatus: "completed" as const,
      };
      return appendEvent(next, actor, action.type, "Completed task.", "task", state.task.id, action.reason, state.completed, true);
    }
  }
}

function appendEvent(
  state: WorkspaceState,
  actor: Actor,
  actionType: string,
  summary: string,
  objectType?: Parameters<typeof createWorkspaceEvent>[0]["objectType"],
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
```

- [ ] **Step 4: Run reducer tests to verify pass**

Run:

```bash
npm run test -- tests/reducer.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm run typecheck
npm run test
```

Expected: both PASS.

- [ ] **Step 6: Commit reducer**

Run:

```bash
git add core/reducer.ts tests/reducer.test.ts
git commit -m "feat: add workspace reducer and audit events"
```

Expected: commit succeeds.

## Phase 1 Completion Checklist

- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] Agent can propose a claim.
- [ ] Human can revise a claim.
- [ ] Agent cannot mark a claim as `human_confirmed`.
- [ ] Agent cannot mark a claim as `final`.
- [ ] Rejected agent actions create `ACTION_REJECTED`.
- [ ] `REQUEST_HUMAN_INPUT` creates an open request and sets `agentStatus` to `waiting_for_human`.
- [ ] `WAIT` logs an event without mutating shared objects.
- [ ] Human can answer an open request.
- [ ] Each accepted reducer action creates an event.
- [ ] No UI, real model API, real search, or evaluation page is added in this phase.

## Handoff To Phase 2

After this phase passes, the next management task is to decide whether Franklin will provide EU demo corpus materials. If Franklin provides materials, convert them into `data/demo-sources.json`; if not, create a stable local corpus from public policy summaries and keep the corpus intentionally small.

