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
import {
  JOURNEY_PHASE_ORDER,
  JOURNEY_PHASES,
  ORDER_JOURNEY_STEPS,
  getJourneyStepsByPhase,
  type JourneyPhaseId,
  type OrderJourneyStep,
} from '@/lib/orderJourneyWorkflow';
import {
  ArrowRight, GitBranch, ExternalLink, CheckCircle2, Link2, BookOpen, Route, Play,
} from 'lucide-react';

const PHASE_RING: Record<JourneyPhaseId, string> = {
  'sales-quote': 'border-teal-500 bg-teal-50 text-teal-800',
  'buy-stock': 'border-blue-500 bg-blue-50 text-blue-800',
  'make-move': 'border-amber-500 bg-amber-50 text-amber-800',
  'finish-deliver': 'border-emerald-500 bg-emerald-50 text-emerald-800',
  'after-sales': 'border-violet-500 bg-violet-50 text-violet-800',
  'finance-history': 'border-zinc-500 bg-zinc-50 text-zinc-800',
};

function JourneyStepCard({
  step,
  isActive,
  onSelect,
}: {
  step: OrderJourneyStep;
  isActive: boolean;
  onSelect: () => void;
}) {
  const phase = JOURNEY_PHASES[step.phase];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-sm ${
        isActive ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/25' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold border-2 ${PHASE_RING[step.phase]}`}>
          {step.step}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold">{step.title}</span>
            <Badge variant="outline" className="text-[10px]">{step.module}</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.narrative}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link
              to={step.path}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline bg-teal-50 px-2 py-1 rounded"
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
            <p className="text-[11px] text-teal-700/80 mt-2 flex items-start gap-1">
              <ArrowRight className="h-3 w-3 shrink-0 mt-0.5" />
              <span><strong>Hands off:</strong> {step.handoff}</span>
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ErpWorkflow() {
  const [activeStep, setActiveStep] = useState<number | null>(1);
  const [activePhase, setActivePhase] = useState<JourneyPhaseId | 'all'>('all');

  const selected = ORDER_JOURNEY_STEPS.find(s => s.step === activeStep);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Route className="h-8 w-8 text-teal-600" />
            The Journey of One Order
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            From the first customer call for an Oil Filtration Plant through quotation, production, dispatch,
            AMC, rental, and month-end — every step links to a live module in this ERP.
          </p>
        </div>
        <Link to="/workflow/demo-order" className="shrink-0">
          <Button variant="outline" className="border-teal-300 text-teal-700">
            <Play className="h-4 w-4 mr-2" /> Run Live Demo
          </Button>
        </Link>
      </div>

      {/* Quick phase strip */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          size="sm"
          variant={activePhase === 'all' ? 'default' : 'outline'}
          onClick={() => setActivePhase('all')}
        >
          All 17 steps
        </Button>
        {JOURNEY_PHASE_ORDER.map(phase => (
          <Button
            key={phase}
            size="sm"
            variant={activePhase === phase ? 'default' : 'outline'}
            onClick={() => setActivePhase(phase)}
          >
            {JOURNEY_PHASES[phase].label}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="journey" className="print:hidden">
        <TabsList>
          <TabsTrigger value="journey">Order Journey (17 steps)</TabsTrigger>
          <TabsTrigger value="interlocks">Technical Interlocks</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="mt-4 space-y-6">
          {JOURNEY_PHASE_ORDER.map(phase => {
            const steps = getJourneyStepsByPhase(phase);
            if (activePhase !== 'all' && activePhase !== phase) return null;
            const meta = JOURNEY_PHASES[phase];
            return (
              <Card key={phase}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={PHASE_RING[phase]}>{meta.label}</Badge>
                    <CardTitle className="text-lg">{meta.subtitle}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {steps.map(step => (
                    <JourneyStepCard
                      key={step.step}
                      step={step}
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
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  Step {selected.step}: {selected.title}
                </CardTitle>
                <CardDescription>{selected.narrative}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link to={selected.path}>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                    Go to {selected.module} <ExternalLink className="h-3 w-3 ml-2" />
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
        </TabsContent>

        <TabsContent value="interlocks" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
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
                          <Link to={interlock.fromPath} className="text-primary hover:underline inline-flex items-center gap-1">
                            {interlock.fromModule} <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={interlock.toPath} className="text-primary hover:underline inline-flex items-center gap-1">
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
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-teal-600" />
                    {note.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{note.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Compact visual flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5 text-teal-600" />
            End-to-end flow at a glance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {ORDER_JOURNEY_STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(s.step)}
                  className={`rounded-md px-2 py-1 border transition-colors hover:border-teal-400 ${
                    activeStep === s.step ? 'bg-teal-100 border-teal-500 font-semibold' : 'bg-card'
                  }`}
                  title={s.title}
                >
                  {s.step}
                </button>
                {i < ORDER_JOURNEY_STEPS.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {ERP_WORKFLOW_STEPS.length} core manufacturing interlocks underpin steps 4–12 (WO → buy → GRN → issue → dispatch → invoice).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
