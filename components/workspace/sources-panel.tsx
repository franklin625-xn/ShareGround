"use client";

import React, { useState, type FormEvent } from "react";
import {
  buildAddEvidenceAction,
  buildAddSourceAction,
  buildEditEvidenceAction,
  buildEditSourceAction,
} from "@/core/human-actions";
import type { WorkspaceAction } from "@/core/schemas";
import type { Source, Evidence } from "@/core/types";

export function SourcesPanel({
  sources,
  evidence,
  onAction,
}: {
  sources: Source[];
  evidence: Evidence[];
  onAction: (action: WorkspaceAction) => void;
}) {
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [sourceForm, setSourceForm] = useState({
    title: "",
    publisher: "",
    url: "",
    publishedAt: "",
    summary: "",
  });
  const [evidenceForm, setEvidenceForm] = useState({
    sourceId: sources[0]?.id ?? "",
    quoteOrFinding: "",
    relevance: "",
  });
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [sourceEditForm, setSourceEditForm] = useState({
    title: "",
    publisher: "",
    url: "",
    publishedAt: "",
    summary: "",
  });
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(
    null,
  );
  const [evidenceEditForm, setEvidenceEditForm] = useState({
    quoteOrFinding: "",
    relevance: "",
  });

  function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAction(buildAddSourceAction(sourceForm));
    setSourceForm({
      title: "",
      publisher: "",
      url: "",
      publishedAt: "",
      summary: "",
    });
    setShowSourceForm(false);
  }

  function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAction(
      buildAddEvidenceAction({
        ...evidenceForm,
        sourceId: evidenceForm.sourceId || sources[0]?.id || "",
      }),
    );
    setEvidenceForm({
      sourceId: sources[0]?.id ?? "",
      quoteOrFinding: "",
      relevance: "",
    });
    setShowEvidenceForm(false);
  }

  function startEditingSource(source: Source) {
    setEditingSourceId(source.id);
    setSourceEditForm({
      title: source.title,
      publisher: source.publisher,
      url: source.url ?? "",
      publishedAt: source.publishedAt ?? "",
      summary: source.summary,
    });
  }

  function cancelEditingSource() {
    setEditingSourceId(null);
    setSourceEditForm({
      title: "",
      publisher: "",
      url: "",
      publishedAt: "",
      summary: "",
    });
  }

  function submitSourceEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSourceId) return;

    onAction(
      buildEditSourceAction({
        sourceId: editingSourceId,
        ...sourceEditForm,
      }),
    );
    cancelEditingSource();
  }

  function startEditingEvidence(item: Evidence) {
    setEditingEvidenceId(item.id);
    setEvidenceEditForm({
      quoteOrFinding: item.quoteOrFinding,
      relevance: item.relevance,
    });
  }

  function cancelEditingEvidence() {
    setEditingEvidenceId(null);
    setEvidenceEditForm({
      quoteOrFinding: "",
      relevance: "",
    });
  }

  function submitEvidenceEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEvidenceId) return;

    onAction(
      buildEditEvidenceAction({
        evidenceId: editingEvidenceId,
        ...evidenceEditForm,
      }),
    );
    cancelEditingEvidence();
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="panel-title mb-0">Sources ({sources.length})</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn-ghost px-2 py-1 text-2xs"
            onClick={() => setShowEvidenceForm((value) => !value)}
            disabled={sources.length === 0}
          >
            Add Evidence
          </button>
          <button
            type="button"
            className="btn-secondary px-2 py-1 text-2xs"
            onClick={() => setShowSourceForm((value) => !value)}
          >
            Add Source
          </button>
        </div>
      </div>

      {showSourceForm && (
        <form onSubmit={submitSource} className="card-sm mb-2 space-y-2">
          <input
            className="input text-xs"
            value={sourceForm.title}
            onChange={(event) =>
              setSourceForm((form) => ({ ...form, title: event.target.value }))
            }
            placeholder="Source title"
            required
          />
          <input
            className="input text-xs"
            value={sourceForm.publisher}
            onChange={(event) =>
              setSourceForm((form) => ({
                ...form,
                publisher: event.target.value,
              }))
            }
            placeholder="Publisher"
            required
          />
          <input
            className="input text-xs"
            value={sourceForm.url}
            onChange={(event) =>
              setSourceForm((form) => ({ ...form, url: event.target.value }))
            }
            placeholder="URL"
            type="url"
          />
          <input
            className="input text-xs"
            value={sourceForm.publishedAt}
            onChange={(event) =>
              setSourceForm((form) => ({
                ...form,
                publishedAt: event.target.value,
              }))
            }
            placeholder="Published date"
          />
          <textarea
            className="input min-h-20 resize-y text-xs"
            value={sourceForm.summary}
            onChange={(event) =>
              setSourceForm((form) => ({
                ...form,
                summary: event.target.value,
              }))
            }
            placeholder="Short summary"
            required
          />
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className="btn-ghost px-2 py-1 text-2xs"
              onClick={() => setShowSourceForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-2 py-1 text-2xs">
              Save
            </button>
          </div>
        </form>
      )}

      {showEvidenceForm && (
        <form onSubmit={submitEvidence} className="card-sm mb-2 space-y-2">
          <select
            className="input text-xs"
            value={evidenceForm.sourceId || sources[0]?.id || ""}
            onChange={(event) =>
              setEvidenceForm((form) => ({
                ...form,
                sourceId: event.target.value,
              }))
            }
            required
          >
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.title}
              </option>
            ))}
          </select>
          <textarea
            className="input min-h-20 resize-y text-xs"
            value={evidenceForm.quoteOrFinding}
            onChange={(event) =>
              setEvidenceForm((form) => ({
                ...form,
                quoteOrFinding: event.target.value,
              }))
            }
            placeholder="Quote or finding"
            required
          />
          <textarea
            className="input min-h-16 resize-y text-xs"
            value={evidenceForm.relevance}
            onChange={(event) =>
              setEvidenceForm((form) => ({
                ...form,
                relevance: event.target.value,
              }))
            }
            placeholder="Why it matters"
            required
          />
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className="btn-ghost px-2 py-1 text-2xs"
              onClick={() => setShowEvidenceForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-2 py-1 text-2xs">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="space-y-1.5">
        {sources.length === 0 && (
          <p className="text-xs text-text-muted italic">No sources yet.</p>
        )}
        {sources.map((src) => (
          <div key={src.id} className="card-sm">
            {editingSourceId === src.id ? (
              <form onSubmit={submitSourceEdit} className="space-y-2">
                <input
                  className="input text-xs"
                  value={sourceEditForm.title}
                  onChange={(event) =>
                    setSourceEditForm((form) => ({
                      ...form,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Source title"
                  required
                />
                <input
                  className="input text-xs"
                  value={sourceEditForm.publisher}
                  onChange={(event) =>
                    setSourceEditForm((form) => ({
                      ...form,
                      publisher: event.target.value,
                    }))
                  }
                  placeholder="Publisher"
                  required
                />
                <input
                  className="input text-xs"
                  value={sourceEditForm.url}
                  onChange={(event) =>
                    setSourceEditForm((form) => ({
                      ...form,
                      url: event.target.value,
                    }))
                  }
                  placeholder="URL"
                  type="url"
                />
                <input
                  className="input text-xs"
                  value={sourceEditForm.publishedAt}
                  onChange={(event) =>
                    setSourceEditForm((form) => ({
                      ...form,
                      publishedAt: event.target.value,
                    }))
                  }
                  placeholder="Published date"
                />
                <textarea
                  className="input min-h-20 resize-y text-xs"
                  value={sourceEditForm.summary}
                  onChange={(event) =>
                    setSourceEditForm((form) => ({
                      ...form,
                      summary: event.target.value,
                    }))
                  }
                  placeholder="Short summary"
                  required
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-2xs"
                    onClick={cancelEditingSource}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-2 py-1 text-2xs"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-medium text-text-primary leading-snug line-clamp-2">
                    {src.title}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 text-2xs text-accent-blue hover:underline"
                    onClick={() => startEditingSource(src)}
                  >
                    Edit Source
                  </button>
                </div>
                <p className="mt-0.5 text-2xs text-text-muted">
                  {src.publisher}
                </p>
                <p className="mt-1 text-2xs text-text-secondary leading-relaxed line-clamp-2">
                  {src.summary}
                </p>
              </>
            )}

            {/* Linked evidence */}
            {(() => {
              const linked = evidence.filter((e) => e.sourceId === src.id);
              if (linked.length === 0) return null;
              return (
                <div className="mt-1.5 space-y-1 border-t border-surface-border pt-1">
                  {linked.map((ev) => (
                    <div key={ev.id} className="pl-1.5 border-l-2 border-accent-blue/30">
                      {editingEvidenceId === ev.id ? (
                        <form
                          onSubmit={submitEvidenceEdit}
                          className="space-y-1.5"
                        >
                          <textarea
                            className="input min-h-16 resize-y text-xs"
                            value={evidenceEditForm.quoteOrFinding}
                            onChange={(event) =>
                              setEvidenceEditForm((form) => ({
                                ...form,
                                quoteOrFinding: event.target.value,
                              }))
                            }
                            placeholder="Quote or finding"
                            required
                          />
                          <textarea
                            className="input min-h-14 resize-y text-xs"
                            value={evidenceEditForm.relevance}
                            onChange={(event) =>
                              setEvidenceEditForm((form) => ({
                                ...form,
                                relevance: event.target.value,
                              }))
                            }
                            placeholder="Why it matters"
                            required
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className="btn-ghost px-2 py-1 text-2xs"
                              onClick={cancelEditingEvidence}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn-primary px-2 py-1 text-2xs"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-2xs text-text-primary leading-snug line-clamp-2">
                              {ev.quoteOrFinding}
                            </p>
                            <button
                              type="button"
                              className="shrink-0 text-2xs text-accent-blue hover:underline"
                              onClick={() => startEditingEvidence(ev)}
                            >
                              Edit Evidence
                            </button>
                          </div>
                          <p className="text-2xs text-text-muted mt-0.5">
                            Relevance: {ev.relevance}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </section>
  );
}
