# SharedGround Project Guide and Execution Manual

> 工作名：SharedGround  
> 项目阶段：V0.1  
> 项目负责人：Franklin  
> 用途：控制项目方向、安排每日执行、避免范围漂移

---

# 一、这个项目到底是什么

一句话：

> SharedGround 是一个让人和 AI Agent 在同一个共享工作区中，共同完成复杂研究任务的轻量级工作台。

它不是普通聊天机器人。

它也不是“输入一个问题，AI 自动生成一份报告”。

它真正要展示的是：

- 人和 Agent 看的是同一份任务状态；
- Agent 可以对资料、笔记、判断和报告执行动作；
- 人可以直接修改这些对象；
- Agent 会读取人的修改并调整下一步；
- Agent 知道什么时候继续、什么时候问人、什么时候停；
- 最终报告能追溯到资料、证据和人的判断。

---

# 二、为什么要做这个项目

你现在有三条作品线：

## 1. Research Deliberation

回答：

> AI 如何参与研究判断、评审和分歧识别？

## 2. Afu OS

回答：

> AI 如何进入个人长期工作空间，理解上下文、记忆、任务和项目？

## 3. SharedGround

回答：

> 人和 Agent 如何在同一个共享工作区中共同完成任务？

三者统一成一句话：

> 我关注的不是 AI 如何回答问题，而是 AI 如何真正进入人的复杂知识工作。

这个项目的作用不是再证明一次“AI 会写报告”。

它是补上作品集里最关键的一块：

> 人和 Agent 的协作过程本身可以被设计。

---

# 三、默认案例不是产品边界

默认案例：

> 欧盟产业政策变化对中国企业欧洲投资的影响。

它只是样板间。

系统未来可以用于：

- AI 近期进展报告；
- 宏观经济研究；
- 产业政策分析；
- 企业战略；
- 市场进入研究；
- 咨询项目；
- 文献综述；
- 技术趋势研究。

系统固定的是协作结构：

```text
Sources
→ Evidence
→ Notes
→ Claims
→ Human Decision
→ Final Brief
```

系统不固定研究题目。

V0.1 使用预置案例，是为了：

- 保证演示稳定；
- 不被搜索 API 卡住；
- 确保每次都能跑出完整协作过程；
- 先验证产品机制。

真实搜索属于增强能力，不是 V0.1 的核心证明。

---

# 四、这个项目的核心命题

必须始终围绕这句话：

> 在复杂知识工作中，人和 Agent 如何共享任务状态、分配主动权，并在正确节点交换控制权？

对应四个产品判断：

## 1. AI 是任务参与者，不是回答机器

Agent 要修改共享对象，而不只是输出一段文字。

## 2. 人保留关键判断

AI 可以提判断，但不能替人确认、定稿和最终负责。

## 3. 自主性必须可控制

Agent 不是越自主越好。

好的 Agent 应该知道：

- 什么时候主动推进；
- 什么时候需要人的方向判断；
- 什么时候等待。

## 4. 协作过程必须可审计

最终成果不能只看成品。

还要看到：

- Agent 做过什么；
- 人改过什么；
- 哪些 AI 判断被拒绝；
- 哪些内容是共同形成的。

---

# 五、V0.1 只验证什么

V0.1 只验证以下七件事：

1. 人和 Agent 能操作同一个 workspace；
2. Agent 能执行结构化 action；
3. 人能直接编辑 AI 产物；
4. Agent 能响应人的修改；
5. Agent 能请求人的输入；
6. Agent 能等待；
7. 整个过程有 event log。

只要这七件事跑通，V0.1 就有价值。

---

# 六、V0.1 明确不验证什么

暂时不验证：

- AI 能不能自动完成高质量研究；
- 搜索覆盖是否足够全面；
- RAG 是否先进；
- 多 Agent 是否更强；
- 是否能服务多个用户；
- 是否适合企业部署；
- 是否能替代研究员；
- 是否能长期记忆；
- 是否能自动追踪新闻；
- 是否能支持所有行业。

这些都不是当前阶段的问题。

---

# 七、页面上必须出现什么

## 1. Sources / Evidence

人和 Agent 都能添加。

必须能看出：

- 来源是什么；
- 证据是什么；
- 谁添加的；
- 证据支持哪个 claim。

## 2. Research Notes

人和 Agent 都能写。

作用是保存：

- 初步发现；
- 资料摘录；
- 研究线索；
- 待验证想法。

## 3. Claims / Analysis

这是核心。

每个 claim 必须有状态：

- AI proposed
- Human confirmed
- Human revised
- Contested
- Evidence insufficient
- Final

如果 claim 没有这些状态，这个项目就退化成普通 AI 写作工具。

## 4. Final Brief

Agent 可以起草。

人可以直接修改。

最终内容必须能追溯到 claim 和 evidence。

## 5. Activity Log

必须展示：

- Agent 做了什么；
- 人做了什么；
- 谁修改了谁；
- Agent 什么时候问人；
- Agent 什么时候等待；
- 哪个动作被拒绝。

---

# 八、你每天判断需求时只问四个问题

任何新想法出现时，先问：

## 1. 它是否加强共享状态？

如果没有，不做。

## 2. 它是否加强控制权交换？

如果没有，不做。

## 3. 它是否让协作过程更可追踪？

如果没有，不做。

## 4. 没有它，Demo 能不能完整跑通？

如果能，放到后续。

四个问题里没有至少两个“是”，V0.1 不加。

---

# 九、最容易漂移的方向

## 1. 漂移成搜索工具

表现：

- 开始研究 Tavily、Exa、Bing；
- 比较搜索质量；
- 做网页抓取；
- 做来源去重；
- 做资讯追踪。

纠偏：

> 搜索只是给工作区提供原材料，不是这个项目的主角。

## 2. 漂移成 RAG 项目

表现：

- 开始切块；
- embedding；
- vector DB；
- reranking；
- citation pipeline。

纠偏：

> V0.1 要验证的是协作，不是知识库。

## 3. 漂移成多 Agent 项目

表现：

- 加 researcher；
- critic；
- writer；
- planner；
- reviewer。

纠偏：

> 当前只需要一个 Agent 和一个 Human。多 Agent 会掩盖真正的问题：人和 Agent 如何协作。

## 4. 漂移成报告生成器

表现：

- 重点变成 prompt；
- 追求报告更长；
- 追求语言更漂亮；
- 自动生成完整结论。

纠偏：

> 报告质量不是第一目标，协作过程才是。

## 5. 漂移成通用协作 SaaS

表现：

- 登录；
- 团队；
- 权限；
- 多项目；
- 云存储；
- 邀请成员。

纠偏：

> V0.1 是单人加单 Agent 的作品集 Demo。

## 6. 漂移成 UI 项目

表现：

- 调颜色；
- 做动画；
- 做复杂拖拽；
- 做富文本。

纠偏：

> 能看懂、能操作、能演示就够了。

---

# 十、第一版不可删除的功能

以下功能无论如何不能砍：

1. Shared Workspace；
2. Structured Actions；
3. Human Edit；
4. Agent Reads Human Edit；
5. Claim Status；
6. REQUEST_HUMAN_INPUT；
7. WAIT；
8. Evidence Chain；
9. Event Log；
10. Mock Agent。

这些是项目本体。

---

# 十一、可以随时砍掉的功能

时间不够时，按顺序砍：

1. Live Web Search；
2. 自动 evidence 提取；
3. 多个 Demo 案例；
4. Brief Diff；
5. 数据统计图；
6. UI 动画；
7. 高级导出；
8. 响应式移动端；
9. 复杂视觉设计。

---

# 十二、两天执行节奏

## 第一天上午：打地基

完成：

- 项目初始化；
- types；
- action schema；
- permissions；
- reducer；
- demo data；
- localStorage。

当天上午的成功标准：

> 不接模型，也能通过按钮让共享状态正确变化，并生成事件日志。

如果上午还在调 UI，说明顺序错了。

## 第一天下午：完成工作台

完成：

- Landing Page；
- Start Demo；
- New Research Task；
- Sources；
- Evidence；
- Notes；
- Claims；
- Brief；
- Activity Log。

成功标准：

> Human 能完整操作 workspace。

## 第一天晚上：接入 Mock Agent

完成：

- Run Agent；
- Agent action；
- REQUEST_HUMAN_INPUT；
- WAIT；
- Human answer；
- Agent 继续。

成功标准：

> 不依赖真实 API，也能跑完一条完整人机协作轨迹。

## 第二天上午：接真实模型

完成：

- API route；
- structured output；
- Zod 校验；
- 错误处理；
- 模型配置。

成功标准：

> 模型可以操作 workspace，但失败时不影响 Demo。

## 第二天下午：打磨演示

完成：

- 默认案例；
- 演示轨迹；
- README；
- 归因；
- 部署；
- 录视频；
- 项目复盘；
- 简历 bullet；
- 面试讲解。

成功标准：

> 陌生人三分钟内能看懂这个项目为什么不是普通聊天机器人。

---

# 十三、每日检查表

开始开发前：

- [ ] 今天最重要的一个结果是什么？
- [ ] 它是否直接服务核心闭环？
- [ ] 今天是否准备引入新框架？
- [ ] 新框架是否真的不可替代？
- [ ] 今天是否在做搜索、RAG、多 Agent 或 UI 扩展？
- [ ] 如果是，能否先不做？

结束开发前：

- [ ] Demo 是否比昨天更完整？
- [ ] Human 是否能修改共享状态？
- [ ] Agent 是否能看到 Human 修改？
- [ ] Event log 是否记录了变化？
- [ ] Final claim 是否有 evidence？
- [ ] Human decision 是否被记录？
- [ ] Evaluation summary 是否仍然可计算？
- [ ] 是否出现了范围漂移？
- [ ] 明天第一件事是什么？

---

# 十四、与 Codex 或六月沟通时的规则

不要只说：

> 帮我继续完善项目。

要说：

> 当前阶段是 X。  
> 当前已完成 Y。  
> 这次只完成 Z。  
> 不要修改 A、B、C。  
> 完成标准是 D。  
> 完成后运行 typecheck、test、build。

每次任务只给一个清楚目标。

例如：

```text
当前阶段：实现 reducer 和权限控制。

这次只做：
1. 创建 core/types.ts；
2. 创建 core/permissions.ts；
3. 创建 core/reducer.ts；
4. 添加对应测试。

不要做 UI，不要接模型，不要引入数据库。

完成标准：
- Agent 无法把 claim 标为 final；
- Human 可以 revise claim；
- 每次动作生成 event；
- npm run test 和 npm run typecheck 通过。
```

---

# 十五、什么时候开新对话

出现以下情况时，应该开新对话：

1. 当前对话已经混入多个开发阶段；
2. Agent 开始忘记“不做什么”；
3. 同一个 bug 连续修三轮仍未解决；
4. 准备从架构阶段切到具体实现阶段；
5. 准备从实现阶段切到包装与复盘阶段。

开新对话时提供：

- 项目执行书；
- 当前目录；
- 当前状态；
- 已完成；
- 未完成；
- 这次唯一任务；
- 禁止修改项。

---

# 十六、什么时候换分支

建议分支：

```text
main
feat/core-workspace
feat/mock-agent
feat/real-agent
feat/demo-polish
```

规则：

- 核心数据结构单独分支；
- Agent 接入单独分支；
- UI 小修不必频繁开分支；
- 不要同时开五个未完成分支；
- 一个分支只解决一个明确问题。

V0.1 时间很短，也可以只使用：

```text
main
v0.1-build
```

不要为了“规范”增加管理成本。

---

# 十七、什么时候允许改变方案

只有三种情况允许改变方案：

## 1. 当前技术路线无法在当天跑通

例如：

- 框架装不上；
- API 无法稳定返回；
- 某依赖导致大量配置。

处理：

> 立即降级，不继续硬扛。

## 2. 某功能无法展示核心命题

例如：

- claim 状态看不出；
- event log 无法体现协作；
- Agent 修改和 Human 修改无法区分。

处理：

> 优先重做这个功能。

## 3. Demo 无法稳定复现

处理：

> 优先使用 Mock Agent 和预置数据，不追求实时能力。

除此之外，不因为“有一个更酷的想法”改方向。

---


# 十八、你对 Evaluation 的原则

Evaluation 不是项目完成后的评分表，而是产品设计的一部分。

SharedGround 的评估不能只问：

> 最终报告写得好不好？

必须同时问三层问题：

## 1. Outcome

- 任务是否完成；
- final claim 是否有 evidence；
- brief 引用是否真实；
- 最终内容是否可交付。

## 2. Process

- Human 是否真的参与；
- AI claim 被确认、修改或争议了多少；
- Agent 是否在正确节点询问；
- Agent 是否在应该等待时等待；
- Agent 是否越权；
- Agent 是否尊重人的修改。

## 3. Traceability

每个最终判断能否完整追溯：

```text
Source
→ Evidence
→ Claim
→ Human Decision
→ Final Brief
```

这三层缺一不可。

如果只看 Outcome，这个项目会退化成报告生成器。

如果只看 Process，可能无法证明最终成果可用。

如果没有 Traceability，就无法证明判断是如何形成的。

---

# 十九、V0.1 必须展示的 Eval

Evaluation 页面至少展示：

## Outcome

- Task completed
- Final claims
- Grounded claims
- Citation integrity

## Collaboration

- Agent actions
- Human actions
- Human revisions
- Contested AI claims
- Human requests answered

## Control

- Unauthorized actions
- Correct waits
- Human modifications respected

## Traceability

- Complete evidence chains

不需要复杂图表。

先用数字、状态和解释把逻辑讲清楚。

---

# 二十、你如何解读这些指标

## 1. Human Override Rate

不是越低越好。

过高可能说明：

- Agent 判断质量差；
- Agent 太激进；
- evidence 不足。

过低也可能说明：

- Human 没有真正参与；
- UI 没有推动人做判断；
- 演示只是 Agent 单方面完成。

所以必须结合 event log 看。

## 2. Human Request Rate

请求越多不一定越好。

过多说明 Agent 太依赖人。

过少可能说明 Agent 在越权推进。

真正要看的是：

> Agent 是否在方向性判断、证据冲突和最终确认这些正确节点询问人。

## 3. WAIT

WAIT 不是“Agent 什么都没做”。

它代表：

> Agent 识别到当前主动权属于 Human。

这是项目中必须被正面展示的能力。

## 4. Grounded Claim Rate

这是底线指标。

Final claim 没有 evidence，就不应该进入最终报告。

## 5. Complete Trace Rate

这是 SharedGround 最有辨识度的指标。

它不是普通引用率。

它检查的是：

> 一个最终判断是否经过来源、证据、AI 提议、人的决策和最终成稿。

---

# 二十一、Eval 也可能导致漂移

最危险的 Eval 漂移包括：

- 开始做几十条 benchmark；
- 比较多个模型；
- 大量设计 LLM judge prompt；
- 追求复杂综合分；
- 做统计显著性；
- 做论文级实验。

纠偏：

> V0.1 的 Eval 是为了证明系统可观察、可审计、可解释，不是为了发表论文。

V0.1 只需要：

- 自动规则；
- 基础比例；
- 完整链条检查；
- Evaluation summary；
- Demo 可解释。

---

# 二十二、演示 Eval 时怎么讲

不要说：

> 我们的模型得了 87 分。

要说：

> 这个系统同时评估结果、协作过程和证据链。  
> 报告完成只是第一层；更重要的是，人是否真正修改过 AI 判断，Agent 是否在正确节点交还控制权，以及最终结论能否追溯到证据和人的决策。

演示顺序：

1. 打开 Evaluation；
2. 展示 grounded final claims；
3. 展示 human revision 和 contested claim；
4. 展示 REQUEST_HUMAN_INPUT 与 WAIT；
5. 打开一条完整 evidence chain；
6. 回到 Activity Log 验证过程。

一句结论：

> SharedGround 不只是记录 AI 做了什么，也评估它是否以正确方式和人共同完成工作。

---

# 二十三、项目成功标准

项目不是看代码多少。

成功标准是：

## 1. 能运行

陌生人能打开网页。

## 2. 能演示

三分钟内能走完一条人机协作流程。

## 3. 能解释

你能清楚说明：

- 为什么不用聊天界面；
- 为什么 claim 要有状态；
- 为什么 Agent 要 WAIT；
- 为什么最终判断归人；
- 为什么要有 event log。

## 4. 能形成作品集叙事

面试官能看懂：

> 你不是简单调用模型，而是在设计人机协作机制。

---

# 二十四、演示时必须讲清楚的故事

演示不是展示所有功能。

只讲一条故事：

1. Agent 先搜索并整理资料；
2. Agent 提出一个判断；
3. 人确认其中一个判断；
4. 人修改另一个判断；
5. 人争议第三个判断；
6. Agent 读取人的修改；
7. Agent 对争议判断补证或降低置信度；
8. Agent 遇到方向性问题，主动问人；
9. 人回答；
10. Agent 根据人的判断更新报告；
11. 日志展示最终成果如何形成。

一句结论：

> 这里展示的不是 AI 自动生成报告，而是一个可控、可追溯的人机协作过程。

---

# 二十五、项目完成后的产物

必须有：

1. 可运行网页；
2. GitHub README；
3. 默认 Demo；
4. Event Log；
5. 2—3 分钟视频；
6. 一页项目复盘；
7. 简历 bullet；
8. 面试讲解稿；
9. Open-source attribution；
10. 架构说明；
11. Evaluation 页面；
12. Evaluation summary 导出；
13. Outcome / Process / Trace 三层评估说明。

项目结束后再考虑：

- Live Search；
- Co-STORM；
- 多案例；
- 过程评估指标；
- 更多业务场景。

---

# 二十六、你的底线

当你开始犹豫“要不要再加一点”时，回到这句话：

> 第一版不是要做强大的研究 Agent，而是要把人和 Agent 如何共同工作这件事做清楚。

当你开始追求报告质量时，回到这句话：

> 成果只是表面，控制权和状态变化才是产品。

当你开始觉得功能太少时，回到这句话：

> 一个完整闭环，比十个半成品功能更像产品。

---

# 二十七、项目最终判断

SharedGround 的真正价值不是：

> AI 帮人完成研究。

而是：

> AI 的工作进入共享状态，人能够接手、修正、否决和定稿；Agent 再根据人的操作继续推进。

这就是这个项目和普通 AI 研究工具的区别。

也是它在你作品集中的位置。
