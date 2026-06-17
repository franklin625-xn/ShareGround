"use client";

import React, { useState, type FormEvent } from "react";
import { buildAnswerHumanInputAction } from "@/core/human-actions";
import type { WorkspaceAction } from "@/core/schemas";
import type { HumanInputRequest as HumanInputRequestType } from "@/core/types";

export function focusHumanRequestComposer() {
  if (typeof document === "undefined") return;

  const composer = document.getElementById("human-request-composer");
  const input = document.getElementById("human-request-answer");
  composer?.scrollIntoView({ block: "center", behavior: "smooth" });
  input?.focus();
}

export function HumanRequestShortcutButton({
  className = "btn-secondary text-xs",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={focusHumanRequestComposer}
      title="Focus the pending human request answer box"
    >
      Answer pending request
    </button>
  );
}

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
    if (!answer.trim()) return;
    onAction(buildAnswerHumanInputAction(request.id, answer));
    setAnswer("");
  }

  return (
    <aside
      id="human-request-composer"
      aria-labelledby="human-request-title"
      aria-live="assertive"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-md border border-accent-amber/40 bg-amber-50 p-3 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-accent-amber text-sm">✋</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              id="human-request-title"
              className="text-xs font-medium uppercase tracking-wider text-accent-amber"
            >
              Agent Needs Your Input
            </p>
            <HumanRequestShortcutButton className="btn-ghost px-2 py-1 text-2xs" />
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
            {request.question}
          </p>
          {request.relatedObjectIds.length > 0 && (
            <p className="text-2xs text-text-muted mt-0.5">
              Related: {request.relatedObjectIds.join(", ")}
            </p>
          )}
          <form onSubmit={submitAnswer} className="mt-3 space-y-2">
            <textarea
              id="human-request-answer"
              className="input min-h-20 resize-y text-xs"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer so the agent can continue"
              required
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="submit"
                className="btn-primary px-3 py-1.5 text-xs"
                disabled={!answer.trim()}
              >
                Submit Answer
              </button>
            </div>
          </form>
        </div>
      </div>
    </aside>
  );
}
