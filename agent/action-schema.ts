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
