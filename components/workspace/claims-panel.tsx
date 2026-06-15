"use client";

import React from "react";
import type { WorkspaceAction } from "@/core/schemas";
import type { Claim, Evidence } from "@/core/types";
import { ClaimCard } from "@/components/workspace/claim-card";

export function ClaimsPanel({
  claims,
  evidence,
  onAction,
}: {
  claims: Claim[];
  evidence: Evidence[];
  onAction: (action: WorkspaceAction) => void;
}) {
  return (
    <section>
      <h3 className="panel-title">Claims / Analysis ({claims.length})</h3>
      <div className="space-y-2">
        {claims.length === 0 && (
          <p className="text-xs text-text-muted italic">
            No claims proposed yet. Run the agent to get started.
          </p>
        )}
        {claims.map((claim) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            evidence={evidence}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}
