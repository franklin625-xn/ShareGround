# SharedGround V0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable SharedGround V0.1 demo where a human and an AI agent jointly conduct research in a shared workspace through structured actions, explicit control handoffs, event logs, and evaluation.

**Architecture:** The app is a single Next.js application with one persisted workspace state. All human and agent changes go through a typed action schema, reducer-level permission checks, and event creation. Mock Agent is the stable demo path; real model integration is an optional enhancement after the core loop works.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui or small local components, Zustand, Zod, Vercel AI SDK, OpenAI-compatible API, localStorage, Markdown, Vitest.

---

## Project Structure

Create and evolve the repository toward this structure:

```text
/Users/franklin/Documents/ShareGround/ShareGround_project/
├── app/
│   ├── api/agent/route.ts
│   ├── evaluation/page.tsx
│   ├── workspace/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── agent/
│   ├── evaluation/
│   ├── landing/
│   ├── ui/
│   └── workspace/
├── core/
│   ├── event-factory.ts
│   ├── permissions.ts
│   ├── reducer.ts
│   ├── schemas.ts
│   ├── selectors.ts
│   └── types.ts
├── agent/
│   ├── action-schema.ts
│   ├── build-context.ts
│   ├── execute-agent-turn.ts
│   ├── mock-agent.ts
│   └── system-prompt.ts
├── search/
│   ├── local-corpus.ts
│   ├── types.ts
│   └── providers/local.ts
├── data/
│   ├── demo-sources.json
│   ├── demo-task.json
│   └── demo-trajectory.json
├── eval/
│   ├── outcome-evaluator.ts
│   ├── process-evaluator.ts
│   ├── run-evaluation.ts
│   ├── trace-evaluator.ts
│   ├── types.ts
│   └── rules/
├── store/workspace-store.ts
├── tests/
├── docs/
├── README.md
├── LICENSE
├── .env.example
└── package.json
```

## Phase 1: Core Workspace Foundation

**Plan file:** `docs/superpowers/plans/2026-06-15-phase-01-core-workspace.md`

**Goal:** Create the project skeleton and prove that typed actions, reducer permissions, immutable state updates, and event logging work before UI or agent integration.

**Do not build:** Landing page, workspace UI, model API route, real search, evaluation page.

**Completion checks:**

```bash
npm run typecheck
npm run test
```

Expected result: both pass.

## Phase 2: Demo Data And Local Persistence

**Goal:** Add stable demo task data, local corpus search data, initial workspace factory, selectors, and Zustand persistence.

**Files:**

```text
data/demo-task.json
data/demo-sources.json
data/demo-trajectory.json
search/types.ts
search/local-corpus.ts
search/providers/local.ts
core/selectors.ts
store/workspace-store.ts
tests/demo-data.test.ts
tests/local-search.test.ts
```

**Need Franklin input:** Ask for EU case materials before this phase if the current demo corpus needs stronger factual grounding.

**Completion checks:**

```bash
npm run typecheck
npm run test
```

Expected result: workspace can be initialized from demo data and local search returns deterministic source matches.

## Phase 3: Landing And Workspace UI

**Goal:** Build the actual visible product shell with Start Demo, New Research Task, and the workspace panels.

**Files:**

```text
app/page.tsx
app/workspace/page.tsx
app/layout.tsx
app/globals.css
components/landing/start-demo-form.tsx
components/workspace/workspace-shell.tsx
components/workspace/sources-panel.tsx
components/workspace/notes-panel.tsx
components/workspace/claims-panel.tsx
components/workspace/claim-card.tsx
components/workspace/brief-editor.tsx
components/workspace/activity-log.tsx
components/agent/agent-control-bar.tsx
components/agent/agent-status.tsx
components/agent/human-input-request.tsx
```

**Completion checks:**

```bash
npm run typecheck
npm run test
npm run build
```

Expected result: human can start demo, create a new task, view shared objects, and see activity log entries.

## Phase 4: Human Workspace Operations

**Goal:** Wire all human operations through the same command path as agent actions.

**Required operations:**

```text
ADD_SOURCE
ADD_EVIDENCE
ADD_NOTE
EDIT_NOTE
UPDATE_CLAIM as human confirm/revise/contest/evidence-insufficient/final
EDIT_BRIEF
ANSWER_HUMAN_INPUT
COMPLETE_TASK
```

**Completion checks:**

```bash
npm run typecheck
npm run test
npm run build
```

Expected result: human edits generate events, update object metadata, and can be evaluated later.

## Phase 5: Mock Agent Loop

**Goal:** Implement the stable demo loop using Mock Agent and structured actions.

**Files:**

```text
agent/mock-agent.ts
agent/execute-agent-turn.ts
agent/build-context.ts
tests/demo-flow.test.ts
```

**Required trajectory:**

```text
Run Agent -> add source/evidence/note -> propose claims -> request human input -> WAIT while open -> respond after answer -> edit brief
```

**Completion checks:**

```bash
npm run typecheck
npm run test
npm run build
```

Expected result: demo can run without an API key.

## Phase 6: Real Agent API Fallback

**Goal:** Add an API route that can call an OpenAI-compatible model and return a Zod-validated `AgentTurn`, while preserving Mock Agent as the safe default.

**Files:**

```text
app/api/agent/route.ts
agent/system-prompt.ts
agent/action-schema.ts
agent/build-context.ts
.env.example
```

**Completion checks:**

```bash
npm run typecheck
npm run test
npm run build
```

Expected result: `USE_MOCK_AGENT=true` gives stable demo behavior; missing or failing real API never blocks the demo.

## Phase 7: Evaluation Layer

**Goal:** Compute Outcome, Process, and Traceability summaries from workspace state and event log.

**Files:**

```text
eval/types.ts
eval/outcome-evaluator.ts
eval/process-evaluator.ts
eval/trace-evaluator.ts
eval/run-evaluation.ts
eval/rules/evidence-grounding.ts
eval/rules/citation-integrity.ts
eval/rules/control-handoff.ts
eval/rules/human-override.ts
eval/rules/action-validity.ts
tests/evaluation.test.ts
```

**Completion checks:**

```bash
npm run typecheck
npm run test
```

Expected result: final claim grounding, citation integrity, human override rate, human request rate, unauthorized actions, correct waits, and complete evidence chains are calculated from real workspace data.

## Phase 8: Evaluation Page And Exports

**Goal:** Expose evaluation in the app and allow exporting evaluation summary as JSON and Markdown.

**Files:**

```text
app/evaluation/page.tsx
components/evaluation/evaluation-summary.tsx
components/evaluation/outcome-section.tsx
components/evaluation/process-section.tsx
components/evaluation/trace-section.tsx
```

**Completion checks:**

```bash
npm run typecheck
npm run test
npm run build
```

Expected result: user can inspect collaboration quality and export `evaluation-summary.json` and `evaluation-summary.md`.

## Phase 9: Docs, Attribution, And Demo Packaging

**Goal:** Package the project so an evaluator can understand, run, and assess it.

**Files:**

```text
README.md
docs/ARCHITECTURE.md
docs/OPEN_SOURCE_ATTRIBUTION.md
docs/DEMO_SCRIPT.md
docs/PROJECT_REVIEW.md
LICENSE
```

**Completion checks:**

```bash
npm run typecheck
npm run test
npm run build
```

Expected result: docs explain why this is not a chatbot, how the controlled autonomy loop works, how to run the demo, what was borrowed from Collaborative Gym, and what V0.1 does not attempt.

## Management Rules

- Keep one active phase at a time.
- Do not optimize UI before Phase 1 and Phase 2 pass.
- Do not add real search before Mock Agent works.
- Do not add extra agent roles.
- Do not allow agent permissions only through hidden UI controls; reducer must enforce them.
- Each phase ends with verification output and a clear handoff note.

## First Execution Thread Brief

Use this brief in the new execution conversation:

```text
当前阶段：Phase 1 Core Workspace Foundation
当前目录：/Users/franklin/Documents/ShareGround/ShareGround_project
本次唯一目标：初始化 Next.js/TypeScript/Vitest 项目骨架，并完成 core types、action schemas、permissions、reducer、event factory 和核心测试。

必须阅读：
- SharedGround_Implementation_Spec.md
- SharedGround_Project_Guide.md
- docs/PROJECT_MANAGEMENT.md
- docs/superpowers/plans/2026-06-15-phase-01-core-workspace.md

禁止做：
- 不做 Landing Page
- 不做 Workspace UI
- 不接真实模型
- 不做真实搜索
- 不做 Evaluation 页面
- 不引入数据库、Redis、Docker、LangChain、多 Agent 框架

完成标准：
- Agent 可以 propose claim
- Human 可以 confirm/revise/contest/finalize claim
- Agent 尝试 human_confirmed 或 final 会被 ACTION_REJECTED
- REQUEST_HUMAN_INPUT 会让 agentStatus 进入 waiting_for_human
- WAIT 不破坏共享状态
- Human answer 后 agentStatus 回到 idle
- 每次成功动作生成 event
- 被拒绝动作生成 ACTION_REJECTED event

完成后运行：
- npm run typecheck
- npm run test
```

