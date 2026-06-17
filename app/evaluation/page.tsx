"use client";

import React from "react";
import { EvaluationPageContent } from "@/components/evaluation/evaluation-page-content";
import { useClientMounted } from "@/components/hydration/client-mounted-gate";

export default function EvaluationPage() {
  const mounted = useClientMounted();

  return <EvaluationPageContent mounted={mounted} />;
}
