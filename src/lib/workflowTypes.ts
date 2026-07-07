/** Shared shape for all ERP workflow journey definitions. */

export type WorkflowStep = {
  step: number;
  title: string;
  narrative: string;
  module: string;
  path: string;
  phase: string;
  related?: Array<{ label: string; path: string }>;
  handoff?: string;
};

export type WorkflowPhaseMeta = {
  label: string;
  subtitle: string;
  color: string;
};

export type WorkflowDefinition = {
  id: string;
  title: string;
  subtitle: string;
  steps: WorkflowStep[];
  phases: Record<string, WorkflowPhaseMeta>;
  phaseOrder: string[];
  phaseRing: Record<string, string>;
};

export function getStepsByPhase(steps: WorkflowStep[], phase: string): WorkflowStep[] {
  return steps.filter(s => s.phase === phase);
}
