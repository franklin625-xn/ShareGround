"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { createEmptyWorkspaceState } from "@/core/workspace-factory";

export default function LandingPage() {
  const router = useRouter();
  const loadDemo = useWorkspaceStore((s) => s.loadDemo);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    question: "",
    scope: "",
  });

  function handleStartDemo() {
    loadDemo();
    router.push("/workspace");
  }

  function handleCreateTask() {
    if (!form.title.trim() || !form.question.trim()) return;
    const workspace = createEmptyWorkspaceState({
      title: form.title.trim(),
      question: form.question.trim(),
      scope: form.scope.trim() || "Custom research task.",
    });
    setWorkspace(workspace);
    router.push("/workspace");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo / Title */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            SharedGround
          </h1>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            A shared research workspace for humans and AI agents.
            <br />
            Work together on complex research through structured actions,
            <br />
            explicit control handoffs, and auditable evidence chains.
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          {/* Start Demo */}
          <button
            onClick={handleStartDemo}
            className="card w-full cursor-pointer text-left transition-shadow hover:shadow-md active:shadow-sm"
          >
            <h2 className="text-base font-semibold text-accent-blue">
              ▶ Start Demo
            </h2>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              Jump into a pre-loaded research task on EU industrial policy and
              Chinese investment in Europe. See the full collaborative workspace
              with sources, evidence, and a ready-to-explore trajectory.
            </p>
          </button>

          {/* New Research Task */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="card w-full cursor-pointer text-left transition-shadow hover:shadow-md active:shadow-sm"
          >
            <h2 className="text-base font-semibold text-text-primary">
              ✦ New Research Task
            </h2>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              Start from scratch. Define your own research question, scope, and
              sources.
            </p>
          </button>

          {/* New Task Form */}
          {showForm && (
            <div className="card space-y-3">
              <div>
                <label className="label" htmlFor="task-title">
                  Research Title
                </label>
                <input
                  id="task-title"
                  className="input"
                  placeholder="e.g. AI Regulation in the EU"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label" htmlFor="task-question">
                  Research Question
                </label>
                <input
                  id="task-question"
                  className="input"
                  placeholder="e.g. How does the EU AI Act affect foundation model providers?"
                  value={form.question}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, question: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label" htmlFor="task-scope">
                  Scope / Expected Output
                </label>
                <textarea
                  id="task-scope"
                  className="input min-h-[64px] resize-y"
                  placeholder="Briefly describe what the research should cover..."
                  value={form.scope}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scope: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-text-muted">
                  <p>
                    Source Mode: <span className="font-medium">Demo Corpus</span>
                    <span className="ml-1.5 italic">(Live Search coming soon)</span>
                  </p>
                  <p className="mt-1 text-2xs text-accent-amber">
                    ⚠ Demo Corpus only supports the built-in EU industrial
                    policy case. For a custom topic, the agent will fall back
                    to the pre-built trajectory regardless of your task title.
                  </p>
                </div>
                <button
                  onClick={handleCreateTask}
                  disabled={!form.title.trim() || !form.question.trim()}
                  className={
                    form.title.trim() && form.question.trim()
                      ? "btn-primary"
                      : "btn-disabled"
                  }
                >
                  Start Research
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-2xs text-text-muted">
          SharedGround V0.1 &middot; A collaborative research workspace
        </p>
      </div>
    </div>
  );
}
