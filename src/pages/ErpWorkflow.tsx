import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ERP_INTERLOCKS,
  ERP_WORKFLOW_STEPS,
  ERP_CONFIGURATION_NOTES,
} from '@/lib/erpWorkflow';
import { MANUFACTURE_ORDER_WORKFLOW } from '@/lib/orderJourneyWorkflow';
import { SERVICE_AMC_WORKFLOW } from '@/lib/serviceAmcWorkflow';
import { EQUIPMENT_RENTAL_WORKFLOW } from '@/lib/equipmentRentalWorkflow';
import {
  getStepsByPhase,
  type WorkflowDefinition,
  type WorkflowStep,
} from '@/lib/workflowTypes';
import {
  ArrowRight, GitBranch, ExternalLink, CheckCircle2, Link2, BookOpen, Route, Play,
  Factory, Headset, Package,
} from 'lucide-react';

const WORKFLOWS: WorkflowDefinition[] = [
  MANUFACTURE_ORDER_WORKFLOW,
  SERVICE_AMC_WORKFLOW,
  EQUIPMENT_RENTAL_WORKFLOW,
];

const WORKFLOW_ICONS: Record<string, typeof Factory> = {
  manufacture: Factory,
  'service-amc': Headset,
  'equipment-rental': Package,
};

function JourneyStepCard({
  step,
  phaseRing,
  isActive,
  onSelect,
}: {
  step: WorkflowStep;
  phaseRing: Record<string, string>;
  isActive: boolean;
  onSelect: () => void;
}) {
  const ring = phaseRing[step.phase] ?? 'border-border bg-muted text-foreground';
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
        isActive ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/25' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${ring}`}>
          {step.step}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold">{step.title}</span>
            <Badge variant="outline" className="text-[10px]">{step.module}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.narrative}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={step.path}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700 hover:underline"
            >
              Open {step.module} <ExternalLink className="h-3 w-3" />
            </Link>
            {step.related?.map(r => (
              <Link
                key={r.path}
                to={r.path}
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {r.label}
              </Link>
            ))}
          </div>
          {step.handoff && (
            <p className="mt-2 flex items-start gap-1 text-[11px] text-teal-700/80">
              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
              <span><strong>Hands off:</strong> {step.handoff}</span>
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function WorkflowJourneyPanel({ workflow }: { workflow: WorkflowDefinition }) {
  const [activeStep, setActiveStep] = useState<number | null>(1);
  const [activePhase, setActivePhase] = useState<string | 'all'>('all');
  const selected = workflow.steps.find(s => s.step === activeStep);
  const Icon = WORKFLOW_ICONS[workflow.id] ?? Route;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Icon className="h-5 w-5 shrink-0 text-teal-600" />
            {workflow.title}
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{workflow.subtitle}</p>
        </div>
        {workflow.id === 'manufacture' && (
          <Link to="/workflow/demo-order" className="shrink-0">
            <Button variant="outline" className="w-full border-teal-300 text-teal-700 sm:w-auto">
              <Play className="mr-2 h-4 w-4" /> Run Live Demo
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activePhase === 'all' ? 'default' : 'outline'}
          onClick={() => setActivePhase('all')}
        >
          All {workflow.steps.length} steps
        </Button>
        {workflow.phaseOrder.map(phase => (
          <Button
            key={phase}
            size="sm"
            variant={activePhase === phase ? 'default' : 'outline'}
            onClick={() => setActivePhase(phase)}
          >
            {workflow.phases[phase]?.label ?? phase}
          </Button>
        ))}
      </div>

      {workflow.phaseOrder.map(phase => {
        const steps = getStepsByPhase(workflow.steps, phase);
        if (activePhase !== 'all' && activePhase !== phase) return null;
        const meta = workflow.phases[phase];
        if (!meta) return null;
        return (
          <Card key={phase}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={workflow.phaseRing[phase]}>{meta.label}</Badge>
                <CardTitle className="text-lg">{meta.subtitle}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map(step => (
                <JourneyStepCard
                  key={step.step}
                  step={step}
                  phaseRing={workflow.phaseRing}
                  isActive={activeStep === step.step}
                  onSelect={() => setActiveStep(step.step)}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}

      {selected && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
              Step {selected.step}: {selected.title}
            </CardTitle>
            <CardDescription>{selected.narrative}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to={selected.path}>
              <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700">
                Go to {selected.module} <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </Link>
            {selected.related?.map(r => (
              <Link key={r.path} to={r.path}>
                <Button size="sm" variant="outline">{r.label}</Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-teal-600" />
            {workflow.title} at a glance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {workflow.steps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(s.step)}
                  className={`rounded-md border px-2 py-1 transition-colors hover:border-teal-400 ${
                    activeStep === s.step ? 'border-teal-500 bg-teal-100 font-semibold' : 'bg-card'
                  }`}
                  title={s.title}
                >
                  {s.step}
                </button>
                {i < workflow.steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErpWorkflow() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Route className="h-7 w-7 shrink-0 text-teal-600 sm:h-8 sm:w-8" />
          Order Journey & Workflows
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Manufacture, Service & AMC, and Equipment Rental — each workflow maps every business step
          to a live module in this ERP.
        </p>
      </div>

      <Tabs defaultValue="manufacture">
        <TabsList className="flex h-auto w-full flex-wrap gap-1">
          <TabsTrigger value="manufacture" className="flex-1 sm:flex-none">
            <Factory className="mr-2 h-4 w-4" /> Manufacture (17)
          </TabsTrigger>
          <TabsTrigger value="service-amc" className="flex-1 sm:flex-none">
            <Headset className="mr-2 h-4 w-4" /> Service & AMC (7)
          </TabsTrigger>
          <TabsTrigger value="equipment-rental" className="flex-1 sm:flex-none">
            <Package className="mr-2 h-4 w-4" /> Equipment Rental (7)
          </TabsTrigger>
          <TabsTrigger value="interlocks" className="flex-1 sm:flex-none">
            <GitBranch className="mr-2 h-4 w-4" /> Interlocks
          </TabsTrigger>
        </TabsList>

        {WORKFLOWS.map(wf => (
          <TabsContent key={wf.id} value={wf.id} className="mt-4">
            <WorkflowJourneyPanel workflow={wf} />
          </TabsContent>
        ))}

        <TabsContent value="interlocks" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-5 w-5 text-teal-600" />
                Manufacturing interlocks (order → stock → shop → bill)
              </CardTitle>
              <CardDescription>
                Mandatory data links between modules — if any link is broken, you get overstocking, missed shipments, or invoice mismatches.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 text-left">Interlock</th>
                      <th className="px-4 py-3 text-left">From</th>
                      <th className="px-4 py-3 text-left">To</th>
                      <th className="px-4 py-3 text-left">Data passed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ERP_INTERLOCKS.map(interlock => (
                      <tr key={interlock.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{interlock.name}</td>
                        <td className="px-4 py-3">
                          <Link to={interlock.fromPath} className="inline-flex items-center gap-1 text-primary hover:underline">
                            {interlock.fromModule} <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={interlock.toPath} className="inline-flex items-center gap-1 text-primary hover:underline">
                            {interlock.toModule} <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{interlock.dataPassed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {ERP_CONFIGURATION_NOTES.map(note => (
              <Card key={note.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-teal-600" />
                    {note.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-relaxed text-muted-foreground">{note.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {ERP_WORKFLOW_STEPS.length} core manufacturing interlocks underpin the manufacture journey (WO → buy → GRN → issue → dispatch → invoice).
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
