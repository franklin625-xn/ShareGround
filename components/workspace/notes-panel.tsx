"use client";

import React, { useState, type FormEvent } from "react";
import { buildAddNoteAction, buildEditNoteAction } from "@/core/human-actions";
import type { WorkspaceAction } from "@/core/schemas";
import type { Evidence, ResearchNote, Source } from "@/core/types";

function selectedValues(options: HTMLCollectionOf<HTMLOptionElement>) {
  return Array.from(options)
    .filter((option) => option.selected)
    .map((option) => option.value);
}

export function NotesPanel({
  notes,
  sources,
  evidence,
  onAction,
}: {
  notes: ResearchNote[];
  sources: Source[];
  evidence: Evidence[];
  onAction: (action: WorkspaceAction) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSourceIds, setEditSourceIds] = useState<string[]>([]);
  const [editEvidenceIds, setEditEvidenceIds] = useState<string[]>([]);

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAction(buildAddNoteAction({ content, sourceIds, evidenceIds }));
    setContent("");
    setSourceIds([]);
    setEvidenceIds([]);
    setShowForm(false);
  }

  function startEditing(note: ResearchNote) {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditSourceIds(note.sourceIds);
    setEditEvidenceIds(note.evidenceIds);
  }

  function cancelEditing() {
    setEditingNoteId(null);
    setEditContent("");
    setEditSourceIds([]);
    setEditEvidenceIds([]);
  }

  function submitEditNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingNoteId) return;

    onAction(
      buildEditNoteAction({
        noteId: editingNoteId,
        content: editContent,
        sourceIds: editSourceIds,
        evidenceIds: editEvidenceIds,
      }),
    );
    cancelEditing();
  }

  return (
    <section>
      <div className="mb-2 mt-3 flex items-center justify-between gap-2">
        <h3 className="panel-title mb-0">Research Notes ({notes.length})</h3>
        <button
          type="button"
          className="btn-secondary px-2 py-1 text-2xs"
          onClick={() => setShowForm((value) => !value)}
        >
          Add Note
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitNote} className="card-sm mb-2 space-y-2">
          <textarea
            className="input min-h-24 resize-y text-xs"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Research note"
            required
          />
          {sources.length > 0 && (
            <label className="block">
              <span className="label">Related sources</span>
              <select
                className="input min-h-20 text-xs"
                multiple
                value={sourceIds}
                onChange={(event) =>
                  setSourceIds(selectedValues(event.currentTarget.options))
                }
              >
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {evidence.length > 0 && (
            <label className="block">
              <span className="label">Related evidence</span>
              <select
                className="input min-h-20 text-xs"
                multiple
                value={evidenceIds}
                onChange={(event) =>
                  setEvidenceIds(selectedValues(event.currentTarget.options))
                }
              >
                {evidence.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.quoteOrFinding}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className="btn-ghost px-2 py-1 text-2xs"
              onClick={() => setShowForm(false)}
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
        {notes.length === 0 && (
          <p className="text-xs text-text-muted italic">No notes yet.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="card-sm">
            {editingNoteId === note.id ? (
              <form onSubmit={submitEditNote} className="space-y-2">
                <textarea
                  className="input min-h-24 resize-y text-xs"
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  required
                />
                {sources.length > 0 && (
                  <label className="block">
                    <span className="label">Related sources</span>
                    <select
                      className="input min-h-20 text-xs"
                      multiple
                      value={editSourceIds}
                      onChange={(event) =>
                        setEditSourceIds(
                          selectedValues(event.currentTarget.options),
                        )
                      }
                    >
                      {sources.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {evidence.length > 0 && (
                  <label className="block">
                    <span className="label">Related evidence</span>
                    <select
                      className="input min-h-20 text-xs"
                      multiple
                      value={editEvidenceIds}
                      onChange={(event) =>
                        setEditEvidenceIds(
                          selectedValues(event.currentTarget.options),
                        )
                      }
                    >
                      {evidence.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.quoteOrFinding}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-2xs"
                    onClick={cancelEditing}
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
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {note.content}
                </p>
                <div className="mt-1 flex items-center gap-2 text-2xs text-text-muted">
                  <span className="actor-human">{note.createdBy}</span>
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    className="ml-auto text-accent-blue hover:underline"
                    onClick={() => startEditing(note)}
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
