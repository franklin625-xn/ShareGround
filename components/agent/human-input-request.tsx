"use client";

import React, { useState, type FormEvent } from "react";
import { buildAnswerHumanInputAction } from "@/core/human-actions";
import type { WorkspaceAction } from "@/core/schemas";
import type { HumanInputRequest as HumanInputRequestType } from "@/core/types";

export function HumanInputRequest({
  request,
  onAction,
}: {
  request: HumanInputRequestType;
  onAction: (action: WorkspaceAction) => void;
}) {
  const [answer, setAnswer] = useState("");

  if (request.status !== "open") return null;

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAction(buildAnswerHumanInputAction(request.id, answer));
    setAnswer("");
  }

  return (
    <div className="border-b border-accent-amber/30 bg-amber-50/80 px-4 py-2">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-accent-amber text-sm">✋</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-accent-amber uppercase tracking-wider">
            Agent Needs Your Input
          </p>
          <p className="text-sm text-text-primary mt-0.5">{request.question}</p>
          {request.relatedObjectIds.length > 0 && (
            <p className="text-2xs text-text-muted mt-0.5">
              Related: {request.relatedObjectIds.join(", ")}
            </p>
          )}
          <form onSubmit={submitAnswer} className="mt-2 flex gap-2">
            <input
              className="input h-8 flex-1 text-xs"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Answer the agent"
              required
            />
            <button type="submit" className="btn-primary h-8 px-3 text-xs">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
