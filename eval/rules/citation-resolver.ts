import type { WorkspaceState } from "@/core/types";

export const citationPattern = /\[([A-Za-z][A-Za-z0-9_-]*)\]/g;

export function extractBriefCitationIds(markdown: string): string[] {
  const ids = new Set<string>();
  for (const match of markdown.matchAll(citationPattern)) {
    const id = match[1];
    if (id) ids.add(id);
  }
  return [...ids];
}

export function resolveCitationId(
  state: WorkspaceState,
  citationId: string,
): string | undefined {
  const claimIndex = citationId.match(/^C(\d+)$/);
  if (claimIndex) {
    return state.claims[Number(claimIndex[1]) - 1]?.id;
  }

  const evidenceIndex = citationId.match(/^E(\d+)$/);
  if (evidenceIndex) {
    return state.evidence[Number(evidenceIndex[1]) - 1]?.id;
  }

  const sourceIndex = citationId.match(/^S(\d+)$/);
  if (sourceIndex) {
    return state.sources[Number(sourceIndex[1]) - 1]?.id;
  }

  return citationId;
}
