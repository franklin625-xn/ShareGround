# SharedGround V0.1 Implementation Specification

> 工作名：SharedGround  
> 项目类型：轻量级人机协同研究工作台  
> 目标工期：1—2 天完成可运行、可演示版本  
> 适用执行者：Codex、六月或其他能够直接修改代码的开发 Agent

---

## 0. 先读这一段

这个项目不是聊天机器人，也不是自动生成研究报告的工具。

它要验证的是：

> 人和 AI Agent 能否在同一个共享工作区里，围绕同一组资料、证据、判断和报告共同工作，并在正确节点交换主动权。

第一版最重要的不是“研究能力有多强”，而是下面六件事必须真实发生：

1. 人和 Agent 操作同一个任务状态；
2. Agent 通过结构化动作修改工作区；
3. 人可以直接修改 Agent 的成果；
4. Agent 下一轮能识别人的修改；
5. Agent 会在需要人判断时询问或等待；
6. 整个协作过程有日志、可追溯。

如果某项功能不能加强这六件事，V0.1 不做。

---

# 一、产品定位

## 1. 一句话

SharedGround 是一个让人和 AI Agent 在共享工作区中共同完成复杂研究任务的轻量级工作台。

## 2. 核心产品问题

> 在复杂知识工作中，人和 Agent 如何共享任务状态、分配主动权，并在正确节点交换控制权？

## 3. 首个演示场景

默认演示任务：

> 欧盟产业政策变化对中国企业欧洲投资的影响。

注意：

- 这是默认案例，不是产品能力边界；
- 首页必须允许创建新的研究任务；
- 用户未来可以输入“AI 近期进展报告”“具身智能产业分析”“某公司战略研究”等其他主题；
- V0.1 默认资料库只为演示案例提供稳定资料；
- 通用主题依赖真实搜索能力，真实搜索不是核心闭环的前置条件。

---

# 二、技术路线结论

## 1. 不直接 fork Collaborative Gym 主仓库

原因：

- 原项目依赖 Redis、多进程节点、WebSocket、FastAPI、Next.js 和大量研究环境依赖；
- 直接 fork 会把时间耗在删减、配置和排错；
- V0.1 的目标是作品集 Demo，不是复现完整实验框架。

## 2. 采用轻量实现

复用 Collaborative Gym 的设计思想：

- shared workspace；
- task environment；
- structured action space；
- human node / agent node 的角色区分；
- event log；
- request / wait；
- controlled autonomy；
- 协作过程可审计。

实现形式改成：

- 单个 Next.js 应用；
- 单个共享状态；
- 类型化 action；
- reducer 统一处理状态变化；
- localStorage 持久化；
- API route 调用模型；
- Mock Agent 保证演示稳定。

## 3. 开源归因

必须创建：

```text
docs/OPEN_SOURCE_ATTRIBUTION.md
```

说明：

1. Collaborative Gym 提供了什么；
2. 本项目借鉴了哪些设计；
3. 是否直接复制了代码；
4. 修改了什么；
5. 本项目新增了什么；
6. 保留 MIT License 和版权声明。

不得把 Collaborative Gym 的原创设计表述为本项目原创。

---

# 三、技术栈

使用：

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui 或少量自写组件
- Zustand
- Zod
- Vercel AI SDK
- OpenAI-compatible API
- localStorage
- Markdown
- Vitest

不要使用：

- Python
- Redis
- FastAPI
- WebSocket
- 数据库
- 登录
- Docker
- LangChain
- 多 Agent 框架
- 向量数据库
- 大规模 RAG
- Co-STORM 集成

必须能运行：

```bash
npm install
npm run dev
npm run build
npm run test
npm run typecheck
```

---

# 四、页面结构

## 1. Landing Page

必须有两个入口：

### Start Demo

载入默认案例：

> 欧盟产业政策变化对中国企业欧洲投资的影响。

### New Research Task

用户输入：

- Research Question
- Scope / Expected Output
- Source Mode

Source Mode：

- Demo Corpus
- Live Web Search（可显示 Coming Soon，或作为后续功能）

不要让默认案例成为硬编码的唯一任务。

---

## 2. Workspace Page

建议布局：

```text
┌──────────────────────────────────────────────────────────────┐
│ Task | Agent Status | Run Agent | Reset | Export Markdown   │
├────────────────┬────────────────────────┬────────────────────┤
│ Sources        │ Claims / Analysis      │ Activity Log       │
│ Evidence       │ Final Brief            │ Human Requests     │
│ Research Notes │                        │                    │
└────────────────┴────────────────────────┴────────────────────┘
```

主体可使用 resizable panels，但不必过度美化。

不做传统聊天窗口。

沟通通过以下对象呈现：

- Event；
- Human Input Request；
- Claim challenge；
- Note；
- Brief edit。

---

# 五、核心数据模型

在：

```text
core/types.ts
```

定义：

```ts
type Actor = "human" | "agent" | "system";

type ClaimStatus =
  | "ai_proposed"
  | "human_confirmed"
  | "human_revised"
  | "contested"
  | "evidence_insufficient"
  | "final";

type AgentStatus =
  | "idle"
  | "working"
  | "waiting_for_human"
  | "blocked"
  | "completed";

type ResearchTask = {
  id: string;
  title: string;
  question: string;
  scope: string;
  sourceMode: "demo_corpus" | "live_search";
  createdAt: string;
};

type Source = {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  publishedAt?: string;
  summary: string;
  addedBy: Actor;
  createdAt: string;
};

type Evidence = {
  id: string;
  sourceId: string;
  quoteOrFinding: string;
  relevance: string;
  addedBy: Actor;
  createdAt: string;
};

type ResearchNote = {
  id: string;
  content: string;
  sourceIds: string[];
  evidenceIds: string[];
  createdBy: Actor;
  createdAt: string;
  updatedAt: string;
};

type Claim = {
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

type Brief = {
  markdown: string;
  updatedBy: Actor;
  updatedAt: string;
};

type HumanInputRequest = {
  id: string;
  question: string;
  relatedObjectIds: string[];
  status: "open" | "answered";
  answer?: string;
  createdAt: string;
  answeredAt?: string;
};

type WorkspaceEvent = {
  id: string;
  timestamp: string;
  actor: Actor;
  actionType: string;
  objectType?: "task" | "source" | "evidence" | "note" | "claim" | "brief";
  objectId?: string;
  summary: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

type WorkspaceState = {
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

---

# 六、结构化动作协议

在：

```text
agent/action-schema.ts
```

用 Zod discriminated union 定义：

```text
SEARCH_SOURCE
ADD_SOURCE
ADD_EVIDENCE
ADD_NOTE
PROPOSE_CLAIM
UPDATE_CLAIM
CHALLENGE_CLAIM
REQUEST_HUMAN_INPUT
EDIT_BRIEF
WAIT
FINISH
```

所有动作使用 JSON，不使用字符串函数调用语法。

示例：

```json
{
  "type": "PROPOSE_CLAIM",
  "payload": {
    "statement": "欧盟正在通过补贴与监管工具提高本地化生产要求",
    "reasoning": "多个政策工具同时将公共支持与欧洲生产能力绑定。",
    "supportingEvidenceIds": ["evidence-01", "evidence-03"],
    "counterEvidenceIds": [],
    "confidence": 0.78
  },
  "reason": "现有证据支持初步判断，但仍需行业案例验证。"
}
```

Agent 一轮最多执行三个动作。

Agent 输出：

```ts
type AgentTurn = {
  situation: string;
  nextGoal: string;
  actions: WorkspaceAction[];
  stopReason:
    | "turn_complete"
    | "waiting_for_human"
    | "insufficient_evidence"
    | "task_complete";
};
```

不要保存或展示模型内部推理过程。

---

# 七、权限与控制权规则

在：

```text
core/permissions.ts
```

实现权限校验。

## Agent 可以

- 搜索来源；
- 添加来源；
- 添加 evidence；
- 添加 note；
- 提出 claim；
- 更新 AI claim；
- challenge claim；
- 编辑 brief；
- 请求人类输入；
- 等待。

## Agent 不可以

- 把 claim 标为 `human_confirmed`；
- 把 claim 标为 `human_revised`；
- 把 claim 标为 `final`；
- 替人回答 human input request；
- 删除人的修改；
- 覆盖整个 workspace；
- 最终完成任务。

## Human 可以

- 添加和编辑 source、evidence、note；
- 编辑 claim；
- confirm claim；
- revise claim；
- contest claim；
- 标记 evidence insufficient；
- finalize claim；
- 编辑 brief；
- 回答 Agent 请求；
- 完成任务。

所有权限必须在 reducer 层校验，不能只隐藏按钮。

Agent 越权时：

1. 不修改对象；
2. 写入 `ACTION_REJECTED`；
3. 记录原因；
4. UI 显示被拒绝的动作。

---

# 八、状态转换

在：

```text
core/reducer.ts
```

实现：

```ts
function applyWorkspaceAction(
  state: WorkspaceState,
  action: WorkspaceAction,
  actor: Actor
): WorkspaceState
```

要求：

- 纯函数；
- immutable；
- 每次成功动作生成事件；
- 保存 before / after；
- 记录 reason；
- 更新 timestamp；
- 不允许静默失败。

人类 UI 操作也必须进入同一个 reducer 或统一 command handler。

---

# 九、功能模块

## 1. Sources / Evidence

支持：

- 查看预置来源；
- 手动添加来源；
- Agent 添加来源；
- 从来源提取或添加 evidence；
- evidence 关联 source；
- 显示 added by；
- 点击 evidence 能找到 source。

V0.1 搜索：

- 默认搜索本地 JSON；
- title / publisher / summary 关键词匹配；
- 不要求真实搜索。

预留：

```ts
interface SearchProvider {
  search(query: string): Promise<SearchResult[]>;
}
```

实现：

```text
LocalCorpusSearchProvider
```

可选：

```text
TavilySearchProvider
```

真实搜索不得阻塞 V0.1 完成。

---

## 2. Research Notes

支持：

- Human 添加；
- Agent 添加；
- Human 直接编辑；
- 关联 source / evidence；
- 显示作者和更新时间。

普通 textarea 足够。

---

## 3. Claims / Analysis

每个 claim 显示：

- statement；
- reasoning；
- supporting evidence；
- counter evidence；
- confidence；
- status；
- creator；
- human decision note；
- updated time。

Human 操作：

- Confirm；
- Revise；
- Contest；
- Evidence Insufficient；
- Finalize。

Agent 不能代替 Human 完成这些判断。

---

## 4. Final Brief

支持：

- Markdown 编辑；
- Human 直接编辑；
- Agent 使用 `EDIT_BRIEF`；
- 显示 last updated by；
- 引用 `[C1]`、`[E1]`；
- 导出 Markdown。

不要做富文本、Word、PDF 和复杂版本 diff。

---

## 5. Activity Log

展示：

- actor；
- action；
- object；
- summary；
- timestamp；
- reason。

筛选：

- All；
- Human；
- Agent；
- System。

关键事件必须明显：

- Agent proposed；
- Human confirmed；
- Human revised；
- Human contested；
- Agent requested input；
- Agent waited；
- Action rejected；
- Brief edited。

---

# 十、Agent 行为

## 1. 一次触发，一次决策

用户点击 `Run Agent`：

1. 前端发送 workspace snapshot；
2. API 生成 `AgentTurn`；
3. Zod 校验；
4. 依次执行最多三个 action；
5. 写日志；
6. Agent 停止。

不要做无限循环 Agent。

## 2. 必须遵守

System Prompt 要明确：

1. 你是共享研究工作区中的任务参与者；
2. 你必须通过结构化动作工作；
3. 你不能替代人的关键判断；
4. 缺少方向性判断时调用 `REQUEST_HUMAN_INPUT`；
5. 请求未回答时调用 `WAIT`；
6. claim 必须引用现有 evidence；
7. 不得伪造 ID；
8. 一轮最多三个动作；
9. 人的修改优先于你的旧判断；
10. 不输出内部思维，只返回结构化结果。

---

# 十一、Mock Agent

必须实现：

```text
agent/mock-agent.ts
```

通过：

```text
USE_MOCK_AGENT=true
```

切换。

Mock Agent 必须稳定支持：

1. 添加 source；
2. 添加 evidence；
3. 添加 note；
4. propose claim；
5. request human input；
6. 用户回答后 edit brief；
7. wait。

没有 API key 时，项目仍然必须可完整演示。

---

# 十二、默认 Demo 数据

创建：

```text
data/demo-task.json
data/demo-sources.json
data/demo-trajectory.json
```

默认来源 6—8 条，围绕：

- 欧盟产业政策；
- Net-Zero Industry Act；
- Critical Raw Materials Act；
- Foreign Subsidies Regulation；
- European Chips Act；
- 中国企业欧洲投资；
- 本地化生产要求；
- 行业案例。

数据应真实，但 V0.1 重点是协作机制，不要求做完整事实研究系统。

---

# 十三、完整演示路径

必须跑通：

1. 进入 Landing Page；
2. 点击 Start Demo；
3. 打开默认研究任务；
4. 点击 Run Agent；
5. Agent 搜索并添加来源；
6. Agent 添加 evidence 和 notes；
7. Agent 提出 claims；
8. Human 确认一个；
9. Human 修改一个；
10. Human contest 一个；
11. Agent 识别人的修改；
12. Agent 补充或降低某个判断；
13. Agent 请求人确定研究重点；
14. Human 回答；
15. Agent 编辑 final brief；
16. Human 最终修改；
17. Human finalize claim；
18. Activity Log 展示全过程；
19. 导出 Markdown；
20. Human 完成任务。

---

# 十四、项目目录

```text
sharedground/
├── app/
│   ├── api/
│   │   └── agent/
│   │       └── route.ts
│   ├── page.tsx
│   ├── workspace/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── landing/
│   ├── workspace/
│   │   ├── workspace-shell.tsx
│   │   ├── sources-panel.tsx
│   │   ├── notes-panel.tsx
│   │   ├── claims-panel.tsx
│   │   ├── claim-card.tsx
│   │   ├── brief-editor.tsx
│   │   └── activity-log.tsx
│   ├── agent/
│   │   ├── agent-control-bar.tsx
│   │   ├── human-input-request.tsx
│   │   └── agent-status.tsx
│   └── ui/
├── core/
│   ├── types.ts
│   ├── schemas.ts
│   ├── reducer.ts
│   ├── permissions.ts
│   ├── selectors.ts
│   └── event-factory.ts
├── agent/
│   ├── system-prompt.ts
│   ├── build-context.ts
│   ├── action-schema.ts
│   ├── execute-agent-turn.ts
│   └── mock-agent.ts
├── search/
│   ├── types.ts
│   ├── providers/
│   │   └── local.ts
│   └── local-corpus.ts
├── data/
│   ├── demo-task.json
│   ├── demo-sources.json
│   └── demo-trajectory.json
├── store/
│   └── workspace-store.ts
├── eval/
│   ├── types.ts
│   ├── outcome-evaluator.ts
│   ├── process-evaluator.ts
│   ├── trace-evaluator.ts
│   ├── run-evaluation.ts
│   └── rules/
├── tests/
│   ├── reducer.test.ts
│   ├── permissions.test.ts
│   ├── demo-flow.test.ts
│   └── evaluation.test.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── OPEN_SOURCE_ATTRIBUTION.md
│   ├── DEMO_SCRIPT.md
│   └── PROJECT_REVIEW.md
├── README.md
├── LICENSE
├── .env.example
└── package.json
```

---


# 十五、Evaluation Layer

Evaluation 不是后续补丁，而是 V0.1 的正式组成部分。

本项目不能只评估“报告写得好不好”，必须同时评估：

1. Outcome：最终结果是否交付、是否有证据；
2. Process：人和 Agent 是否真实协作、控制权是否正确交换；
3. Traceability：最终判断能否追溯到来源、证据和人的决策。

创建目录：

```text
eval/
├── types.ts
├── outcome-evaluator.ts
├── process-evaluator.ts
├── trace-evaluator.ts
├── run-evaluation.ts
└── rules/
    ├── evidence-grounding.ts
    ├── citation-integrity.ts
    ├── control-handoff.ts
    ├── human-override.ts
    └── action-validity.ts
```

## 1. Evaluation 数据结构

在：

```text
eval/types.ts
```

定义：

```ts
type OutcomeEvaluation = {
  taskCompleted: boolean;
  finalClaimCount: number;
  groundedFinalClaimCount: number;
  groundedClaimRate: number;
  citationIntegrityRate: number;
  missingCitationIds: string[];
};

type ProcessEvaluation = {
  agentActionCount: number;
  humanActionCount: number;
  humanRevisionCount: number;
  contestedClaimCount: number;
  humanOverrideRate: number;
  humanRequestCount: number;
  answeredHumanRequestCount: number;
  effectiveHumanRequestRate: number;
  waitCount: number;
  correctWaitCount: number;
  unauthorizedActionCount: number;
  respectedHumanModification: boolean;
};

type TraceEvaluationItem = {
  claimId: string;
  hasSource: boolean;
  hasEvidence: boolean;
  hasHumanDecision: boolean;
  referencedInBrief: boolean;
  complete: boolean;
};

type EvaluationSummary = {
  generatedAt: string;
  outcome: OutcomeEvaluation;
  process: ProcessEvaluation;
  traceability: {
    items: TraceEvaluationItem[];
    completeTraceCount: number;
    totalTraceCount: number;
    completeTraceRate: number;
  };
};
```

## 2. Outcome Eval

至少计算：

### Task Completion

```ts
taskCompleted = workspace.completed && workspace.brief.markdown.trim().length > 0;
```

### Grounded Claim Rate

```ts
groundedClaimRate =
  groundedFinalClaimCount / Math.max(finalClaimCount, 1);
```

Final claim 至少关联一个真实存在的 evidence 才算 grounded。

### Citation Integrity

检查：

- Brief 中引用的 `[C#]` 是否存在；
- Brief 中引用的 `[E#]` 是否存在；
- Claim 引用的 evidence ID 是否存在；
- Evidence 引用的 source ID 是否存在。

不得只检查字符串格式。

## 3. Process Eval

至少计算：

### Human Override Rate

```ts
humanOverrideRate =
  revisedOrContestedAIClaimCount / Math.max(aiProposedClaimCount, 1);
```

该指标不设置“越低越好”的简单判断，只负责展示。

### Effective Human Request Rate

```ts
effectiveHumanRequestRate =
  answeredHumanRequestCount / Math.max(humanRequestCount, 1);
```

### Controlled Autonomy Rules

规则评分至少包括：

- Agent 在缺少方向性判断时调用 `REQUEST_HUMAN_INPUT`；
- 存在未回答请求时调用 `WAIT`；
- 人修改 claim 后，Agent 下一轮使用新状态；
- Agent 不得重复询问已回答问题；
- Agent 不得越权 final；
- Agent 不得覆盖 Human 修改。

建议记录 rule result：

```ts
type EvalRuleResult = {
  ruleId: string;
  passed: boolean;
  score: number;
  explanation: string;
  relatedEventIds: string[];
};
```

### Action Validity

检查：

- schema 是否有效；
- object ID 是否存在；
- actor 是否有权限；
- action 是否成功应用；
- action 是否产生预期事件；
- 被拒绝动作是否记录 `ACTION_REJECTED`。

## 4. Trace Eval

对每个 final claim 检查：

```text
Source
→ Evidence
→ Claim
→ Human Decision
→ Final Brief
```

完整条件：

1. Claim 至少有一个 supporting evidence；
2. Evidence 对应 source 存在；
3. Claim 至少有一次 Human decision event；
4. Claim 被 Final Brief 引用；
5. Claim 状态为 final。

如果其中任一环节缺失，`complete = false`。

## 5. Evaluation 页面

新增：

```text
app/evaluation/page.tsx
components/evaluation/evaluation-summary.tsx
components/evaluation/outcome-section.tsx
components/evaluation/process-section.tsx
components/evaluation/trace-section.tsx
```

页面至少展示：

```text
Outcome
- Task completed
- Final claims
- Grounded claims
- Citation integrity

Collaboration
- Agent actions
- Human actions
- Human revisions
- Contested AI claims
- Human requests answered

Control
- Unauthorized actions
- Correct waits
- Human modifications respected

Traceability
- Complete evidence chains
```

V0.1 不要求图表。优先使用数字、状态和简短解释。

## 6. Evaluation 导出

支持导出：

```text
evaluation-summary.json
evaluation-summary.md
```

内容必须基于当前 workspace 和 event log 实时计算，不保存手填分数。

## 7. Evaluation 测试

创建：

```text
tests/evaluation.test.ts
```

至少覆盖：

- final claim 无 evidence 时 grounded rate 降低；
- evidence 对应 source 不存在时 trace 不完整；
- brief 引用不存在 ID 时 citation integrity 降低；
- human revision 被正确计数；
- contested AI claim 被正确计数；
- REQUEST_HUMAN_INPUT / answer 被正确计数；
- 未回答请求后 WAIT 被识别为正确；
- Agent 越权动作被计入 unauthorized action；
- 完整 Source → Evidence → Claim → Human Decision → Brief 链条计为 complete。

## 8. Evaluation 的边界

V0.1 不做：

- 大规模 benchmark；
- 多模型横向比较；
- LLM-as-a-judge 综合打分；
- 人工标注数据集；
- 统计显著性；
- 正式用户实验；
- 与 STORM、Deep Research 的性能对比。

Evaluation 的目的不是证明模型世界领先，而是证明：

> SharedGround 可以观察和评估人机协作过程，而不仅是最终文本。

---

# 十六、测试

## reducer.test.ts

至少覆盖：

- Agent propose claim；
- Human confirm claim；
- Agent 尝试 human_confirmed 被拒绝；
- Agent 尝试 final 被拒绝；
- Human revise 后写事件；
- REQUEST_HUMAN_INPUT 改变状态；
- WAIT 不破坏共享状态；
- Human answer 后 Agent 可继续。

## permissions.test.ts

覆盖 actor/action 权限组合。

## demo-flow.test.ts

模拟完整流程，确认：

- final brief 非空；
- 至少一个 final claim；
- 至少一个 human revision；
- 至少一个 contested claim；
- 至少一个 human input request；
- 至少一个 WAIT；
- event log 能重建关键过程。

---

# 十七、README 要求

README 必须包括：

1. 项目一句话；
2. 核心产品问题；
3. 为什么不是聊天机器人；
4. Demo；
5. 功能；
6. 架构；
7. 数据模型；
8. Action protocol；
9. Controlled autonomy；
10. 本地运行；
11. Mock mode；
12. 开源借鉴；
13. 当前限制；
14. 后续方向。

项目一句话：

> A lightweight shared workspace where humans and AI agents jointly conduct complex research through structured actions, explicit control handoffs, and auditable evidence chains.

---

# 十八、明确不做

V0.1 不做：

- 多用户；
- 登录；
- 长期记忆；
- 定时任务；
- 自动新闻抓取；
- 向量数据库；
- RAG pipeline；
- 知识图谱；
- Co-STORM；
- 多 Agent；
- PDF 上传；
- Word 导出；
- 实时多人协同；
- 复杂 benchmark；
- 精致动画；
- 企业部署。

---

# 十九、删减顺序

时间不足时依次删：

1. 真实搜索；
2. 动态 evidence 提取；
3. brief diff；
4. 统计图；
5. UI 动画；
6. 多种 Demo 主题。

绝不能删：

1. shared workspace；
2. structured actions；
3. human edit；
4. Agent 响应 human edit；
5. claim status；
6. REQUEST_HUMAN_INPUT；
7. WAIT；
8. evidence chain；
9. event log；
10. Mock Agent。

---

# 二十、执行顺序

严格按顺序：

1. 初始化项目；
2. types；
3. schemas；
4. permissions；
5. reducer；
6. demo data；
7. Zustand store；
8. Landing Page；
9. Workspace UI；
10. Human operations；
11. Event log；
12. Mock Agent；
13. Real Agent API；
14. Evaluation Layer；
15. Evaluation 页面与导出；
16. tests；
17. README；
18. attribution；
19. deployment。

每完成一阶段：

- 运行 typecheck；
- 运行相关测试；
- 做一次清晰 commit。

不要在核心闭环完成前优化 UI。

---

# 二十一、完成标准

只有同时满足以下条件，V0.1 才算完成：

- [ ] 网页可运行；
- [ ] build 通过；
- [ ] typecheck 通过；
- [ ] tests 通过；
- [ ] 可 Start Demo；
- [ ] 可 New Research Task；
- [ ] 有 Sources / Evidence / Notes / Claims / Brief；
- [ ] Agent 使用结构化 action；
- [ ] Human 能修改共享对象；
- [ ] Agent 下一轮能识别人的修改；
- [ ] Agent 能 REQUEST_HUMAN_INPUT；
- [ ] Agent 能 WAIT；
- [ ] Agent 不能越权 final；
- [ ] 有完整 event log；
- [ ] claim 可追溯到 evidence；
- [ ] brief 可追溯到 claim；
- [ ] Mock mode 可完整演示；
- [ ] 可导出 Markdown；
- [ ] README 完成；
- [ ] 开源归因完成；
- [ ] Outcome / Process / Trace 三层 evaluation 可运行；
- [ ] 每个 final claim 至少关联一个 evidence；
- [ ] 每个 evidence 必须关联一个 source；
- [ ] 能计算 grounded claim rate；
- [ ] 能计算 human override rate；
- [ ] 能计算 effective human request rate；
- [ ] 能检查完整 evidence chain；
- [ ] 能导出 evaluation summary；
- [ ] Evaluation 页面可解释协作质量；
- [ ] 可部署到 Vercel。

---

# 二十二、最后原则

不要把这个项目做成：

- 搜索引擎；
- RAG 工具；
- AI 报告生成器；
- 多 Agent 讨论系统；
- 通用协作 SaaS。

它只需要证明一件事：

> AI 不是在聊天框里给答案，而是在共享任务状态中参与工作；人保留关键判断，控制权在正确节点交换。
