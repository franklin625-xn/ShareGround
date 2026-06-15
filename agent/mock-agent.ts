import type { AgentAction, AgentTurn } from "@/agent/action-schema";
import type { AgentContext } from "@/agent/build-context";

export function runMockAgent(context: AgentContext): AgentTurn {
  if (context.openHumanRequest) {
    return {
      situation: "The agent is waiting for a human decision before drafting.",
      nextGoal: "Respect the open control handoff.",
      actions: [
        {
          type: "WAIT",
          payload: {
            waitingFor: context.openHumanRequest.question,
          },
          reason: "An open human input request must be answered first.",
        },
      ],
      stopReason: "waiting_for_human",
    };
  }

  if (context.answeredHumanRequest && !context.briefMarkdown.trim()) {
    return {
      situation: "Human guidance is available, so the agent can draft the brief.",
      nextGoal: "Turn the shared evidence and human direction into a concise brief.",
      actions: [buildBriefAction(context)],
      stopReason: "turn_complete",
    };
  }

  if (context.agentNotes.length === 0) {
    return {
      situation: "The workspace has demo materials but no agent research pass.",
      nextGoal: "Add a source, extract evidence, and record an initial note.",
      actions: [
        {
          type: "ADD_SOURCE",
          payload: {
            title: "SharedGround Demo Corpus Synthesis: EV Localization Response",
            publisher: "SharedGround Demo Corpus",
            summary:
              "A synthesis source connecting EU EV tariffs, battery rules, and Chinese firms' move toward localized European manufacturing.",
          },
          reason: "Mock agent adds a synthesized source to start the demo loop.",
        },
        {
          type: "ADD_EVIDENCE",
          payload: {
            sourceId: "demo-source-006",
            quoteOrFinding:
              "BYD's Hungary EV plant shows how Chinese automakers can reduce tariff exposure by producing inside the EU single market.",
            relevance:
              "Supports the claim that EU trade pressure pushes Chinese firms toward localization.",
          },
          reason: "Mock agent extracts evidence from the demo corpus.",
        },
        {
          type: "ADD_NOTE",
          payload: {
            content:
              "Initial agent read: EU policy pressure is not only restrictive. It redirects Chinese investment toward local production, especially in EVs and batteries.",
            sourceIds: ["demo-source-006", "demo-source-007"],
            evidenceIds: ["demo-evidence-004", "demo-evidence-005"],
          },
          reason: "Mock agent records the first research note.",
        },
      ],
      stopReason: "turn_complete",
    };
  }

  if (context.agentClaims.length < 2) {
    return {
      situation: "The agent has enough initial notes to propose claims.",
      nextGoal: "Create reviewable claims for the human to confirm or revise.",
      actions: [
        {
          type: "PROPOSE_CLAIM",
          payload: {
            statement:
              "EU industrial policy increases localization pressure on Chinese firms entering Europe.",
            reasoning:
              "Tariffs, foreign-subsidy scrutiny, and net-zero manufacturing benchmarks all make local EU production more attractive than pure export strategies.",
            supportingEvidenceIds: ["demo-evidence-001", "demo-evidence-004"],
            counterEvidenceIds: [],
            confidence: 0.78,
          },
          reason: "Mock agent proposes a claim grounded in demo evidence.",
        },
        {
          type: "PROPOSE_CLAIM",
          payload: {
            statement:
              "The impact varies by sector, with EV and battery investments facing the most direct pressure.",
            reasoning:
              "Demo evidence shows direct tariff and compliance pressure on EV makers and battery plants, while other strategic sectors face more indirect screening.",
            supportingEvidenceIds: ["demo-evidence-003", "demo-evidence-005"],
            counterEvidenceIds: [],
            confidence: 0.72,
          },
          reason: "Mock agent adds a sector-specific claim for human review.",
        },
      ],
      stopReason: "turn_complete",
    };
  }

  if (!context.answeredHumanRequest && !context.briefMarkdown.trim()) {
    return {
      situation: "The agent has proposed claims but needs a human direction choice.",
      nextGoal: "Ask the human which emphasis the final brief should take.",
      actions: [
        {
          type: "REQUEST_HUMAN_INPUT",
          payload: {
            question:
              "Should the final brief emphasize EV batteries, broader industrial policy risk, or market-entry strategy?",
            relatedObjectIds: context.agentClaims.map((claim) => claim.id),
          },
          reason: "The final framing is a human judgment call.",
        },
      ],
      stopReason: "waiting_for_human",
    };
  }

  return {
    situation: "The mock demo trajectory has already produced a brief.",
    nextGoal: "No further mock action is needed.",
    actions: [],
    stopReason: "turn_complete",
  };
}

function buildBriefAction(context: AgentContext): AgentAction {
  const answer = context.answeredHumanRequest?.answer ?? "Focus on EV batteries.";

  return {
    type: "EDIT_BRIEF",
    payload: {
      markdown: `# ${context.taskTitle}

## Direction

${answer}

## Working Answer

EU industrial policy is reshaping Chinese investment in Europe by making localized production a more attractive path than export-led market entry. The clearest pressure appears in EVs and batteries, where tariff exposure, battery compliance, and permitting requirements all push firms toward European manufacturing footprints.

## Evidence Trail

- NZIA-style manufacturing benchmarks create localization pressure for strategic clean technologies.
- BYD's Hungary plant illustrates tariff-driven localization in EVs.
- CATL's Debrecen battery plant shows that localization also brings permitting and compliance friction.

## Open Human Judgment

The final version should keep the human-selected emphasis visible and treat the agent claims as provisional until reviewed.`,
    },
    reason: "Mock agent drafts the brief after receiving human direction.",
  };
}
