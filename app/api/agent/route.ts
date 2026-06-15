import { executeAgentTurn } from "@/agent/execute-agent-turn";
import { buildSystemPrompt } from "@/agent/system-prompt";
import { buildAgentContext, buildWorkspaceSnapshot } from "@/agent/build-context";
import { agentTurnSchema, type AgentTurn } from "@/agent/action-schema";
import { applyWorkspaceAction } from "@/core/reducer";
import type { WorkspaceState } from "@/core/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface AgentApiResult {
  turn: AgentTurn;
  state: WorkspaceState;
  source: "mock" | "real";
  usedFallback: boolean;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const state: WorkspaceState = await request.json();

    if (!state || !state.task || !state.task.id) {
      return NextResponse.json(
        { error: "Invalid workspace state." },
        { status: 400 },
      );
    }

    const useMock = process.env.USE_MOCK_AGENT !== "false";

    if (useMock) {
      const result = executeAgentTurn(state);
      return NextResponse.json({
        turn: result.turn,
        state: result.state,
        source: "mock",
        usedFallback: false,
      } satisfies AgentApiResult);
    }

    // Real agent path
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const result = executeAgentTurn(state);
      return NextResponse.json({
        turn: result.turn,
        state: result.state,
        source: "mock",
        usedFallback: true,
        error: "OPENAI_API_KEY not configured. Fell back to mock agent.",
      } satisfies AgentApiResult);
    }

    try {
      const result = await callRealAgent(state);
      return NextResponse.json(result);
    } catch (err) {
      const result = executeAgentTurn(state);
      return NextResponse.json({
        turn: result.turn,
        state: result.state,
        source: "mock",
        usedFallback: true,
        error: err instanceof Error ? err.message : "Real agent call failed. Fell back to mock agent.",
      } satisfies AgentApiResult);
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 },
    );
  }
}

async function callRealAgent(state: WorkspaceState): Promise<AgentApiResult> {
  const baseUrl =
    process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const apiKey = process.env.OPENAI_API_KEY!;

  const systemPrompt = buildSystemPrompt();
  const context = buildAgentContext(state);
  const workspaceSnapshot = buildWorkspaceSnapshot(state);

  const userMessage = [
    "## Current Workspace State",
    workspaceSnapshot,
    "",
    "## Agent Context Summary",
    `- Sources: ${context.sourceCount}`,
    `- Evidence: ${context.evidenceCount}`,
    `- Agent notes: ${context.agentNotes.length}`,
    `- Agent claims: ${context.agentClaims.length}`,
    `- Open request: ${context.openHumanRequest ? context.openHumanRequest.question : "none"}`,
    `- Brief drafted: ${context.briefMarkdown ? "yes" : "no"}`,
    "",
    "Based on the current workspace state, produce up to 3 actions to advance the research.",
    "Return valid JSON matching the schema described in the system prompt.",
  ].join("\n");

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  // Attempt 1: call the model
  const { turn, rawContent } = await modelCall(
    baseUrl, model, apiKey, messages,
  );
  return { turn, state: applyActions(state, turn), source: "real", usedFallback: false };
}

/**
 * Call the model, parse, validate with Zod.
 * If Zod fails on first attempt, send the error back to the model for a fix.
 * If Zod fails again, throw (caller falls back to mock).
 */
async function modelCall(
  baseUrl: string,
  model: string,
  apiKey: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  attempt = 1,
): Promise<{ turn: AgentTurn; rawContent: string }> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(
      `API error ${response.status}: ${errorBody.substring(0, 200)}`,
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Model returned empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // First retry: invalid JSON from model
    if (attempt < 2) {
      messages.push(
        { role: "assistant", content },
        {
          role: "user",
          content:
            "The JSON you returned is not valid JSON (parse error). " +
            "Return ONLY a single valid JSON object, no markdown, no code fences.",
        },
      );
      return modelCall(baseUrl, model, apiKey, messages, attempt + 1);
    }
    throw new Error("Model returned invalid JSON after retry.");
  }

  // Log raw content for debugging (without exposing API key)
  console.log(
    `[SharedGround] Model raw response (attempt ${attempt}):`,
    JSON.stringify(parsed).substring(0, 500),
  );

  const validation = agentTurnSchema.safeParse(parsed);

  if (!validation.success) {
    const zodPath = validation.error.issues
      .map((i) => `path=${i.path.join(".")} message=${i.message}`)
      .join("; ");

    console.log(
      `[SharedGround] Zod validation failed (attempt ${attempt}): ${zodPath}`,
    );

    // Retry once: send the error back to the model
    if (attempt < 2) {
      messages.push(
        { role: "assistant", content },
        {
          role: "user",
          content: [
            "Your previous response failed schema validation. Fix ONLY the structure — do NOT change the research content.",
            "",
            `Validation errors: ${zodPath}`,
            "",
            "Rules to follow:",
            "- Each action.type must be exactly one of the 13 allowed values (SEARCH_SOURCE, ADD_SOURCE, EDIT_SOURCE, ADD_EVIDENCE, EDIT_EVIDENCE, ADD_NOTE, EDIT_NOTE, PROPOSE_CLAIM, UPDATE_CLAIM, CHALLENGE_CLAIM, REQUEST_HUMAN_INPUT, WAIT, EDIT_BRIEF).",
            "- Each action.payload must contain exactly the fields listed for that action type.",
            "- Return ONLY the JSON object, no markdown.",
          ].join("\n"),
        },
      );
      return modelCall(baseUrl, model, apiKey, messages, attempt + 1);
    }

    throw new Error(
      `Zod validation failed after retry: ${zodPath.substring(0, 200)}`,
    );
  }

  return { turn: validation.data, rawContent: content };
}

function applyActions(state: WorkspaceState, turn: AgentTurn): WorkspaceState {
  return turn.actions.reduce(
    (current, action) => applyWorkspaceAction(current, action, "agent"),
    state,
  );
}
