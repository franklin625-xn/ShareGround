# SharedGround Project Management

## Operating Mode

This conversation is the project management thread for SharedGround V0.1.

Execution mode is single-threaded. Work should move through one active phase at a time. Do not run UI, agent, evaluation, and documentation implementation in parallel until the current phase is verified and closed.

## Active Objective

Build a runnable V0.1 demo that proves this product idea:

> Humans and AI agents can work in the same shared research workspace through structured actions, explicit control handoffs, and auditable evidence chains.

## Non-Negotiable V0.1 Scope

- Shared workspace state.
- Structured actions.
- Reducer-level permission checks.
- Human edits of AI-created work.
- Agent recognition of human edits.
- Claim status workflow.
- REQUEST_HUMAN_INPUT.
- WAIT.
- Evidence chain.
- Activity log.
- Mock Agent.
- Outcome, Process, and Traceability evaluation.

## Explicit Non-Goals

- Multi-user collaboration.
- Login.
- Database.
- Redis.
- Docker.
- FastAPI.
- Python app backend.
- Vector database.
- Large RAG pipeline.
- Co-STORM integration.
- Multi-agent architecture.
- PDF upload.
- Word export.
- Real-time web search as a blocking requirement.
- Polished animation.

## Single-Thread Phases

1. Core workspace foundation.
2. Demo data and local persistence.
3. Landing and workspace UI.
4. Human workspace operations.
5. Mock Agent loop.
6. Real Agent API fallback.
7. Evaluation layer.
8. Evaluation page and exports.
9. README, attribution, demo script, and deployment prep.

Each phase must end with a clear verification result before the next phase starts.

## When To Ask Franklin For EU Case Materials

Ask Franklin for EU case materials before Phase 2 if the built-in demo source list is not enough to support a believable default trajectory.

Request format:

```text
I need EU demo corpus materials now. Please provide 6-8 source items with title, publisher, URL if available, date, and 2-3 sentence summary. Priority topics: Net-Zero Industry Act, Critical Raw Materials Act, Foreign Subsidies Regulation, European Chips Act, Chinese company investment in Europe, localization requirements, and one industry case.
```

If Franklin does not provide materials in time, use a small stable local demo corpus and mark the real-source enrichment as a later management task.

## Task Brief Template For New Execution Threads

```text
当前阶段：<phase name>
当前目录：/Users/franklin/Documents/ShareGround/ShareGround_project
当前项目管理线程：this conversation
本次唯一目标：<single objective>
必须阅读：
- SharedGround_Implementation_Spec.md
- SharedGround_Project_Guide.md
- docs/PROJECT_MANAGEMENT.md
- docs/superpowers/plans/<phase-plan>.md
禁止做：
- <out-of-scope items>
完成标准：
- <verification checklist>
完成后运行：
- <commands>
```

## Project Repository

GitHub repository:

```text
https://github.com/franklin625-xn/ShareGround
```

Local project path:

```text
/Users/franklin/Documents/ShareGround/ShareGround_project
```

