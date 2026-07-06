import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ERP_INTERLOCKS,
  ERP_WORKFLOW_STEPS,
  ERP_CONFIGURATION_NOTES,
  getInterlockAfterStep,
  type ErpInterlock,
} from '@/lib/erpWorkflow';
import { processErpEvent } from '@/lib/erpEvents';
import {
  ArrowRight, GitBranch, Play, RotateCcw, ExternalLink, CheckCircle2,
  AlertTriangle, BookOpen, Link2,
} from 'lucide-react';

export default function ErpWorkflow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [simStep, setSimStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    'Manufacturing workflow ready. Each step hands off to the next via a mandatory interlock.',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 24));
  };

  const runInterlock = async (interlock: ErpInterlock, index: number) => {
    setActiveId(interlock.id);
    setActiveStep(interlock.afterStep);
    addLog(
      `Interlock ${index + 1} — ${interlock.name}: ${interlock.fromModule} → ${interlock.toModule} | ${interlock.dataPassed}`,
    );

    if (interlock.id === 'dispatch-to-finance' || interlock.id === 'warehouse-to-dispatch') {
      await processErpEvent('order.ready_for_dispatch', {
        orderId: 'SO-26-DEMO',
        customerName: 'Demo Customer',
      });
      addLog('   ↳ Auto-tasks: packing list & E-Way bill (Dispatch interlock).');
    }

    if (interlock.id === 'finance-to-sales') {
      await processErpEvent('order.status_update', {
        orderId: 'SO-26-DEMO',
        status: 'Closed — Invoiced',
        totalAmount: 1450000,
        customerName: 'Demo Customer',
      });
      addLog('   ↳ Sales order closed — invoice posted to AR/GL.');
    }
  };

  const runFullChain = async () => {
    setSimStep(0);
    addLog('—— Full chain: Sales order → MRP → Procurement → GRN → Shop floor → QC → FG → Dispatch → Finance → Sales close ——');
    for (let i = 0; i < ERP_INTERLOCKS.length; i++) {
      setSimStep(i + 1);
      await runInterlock(ERP_INTERLOCKS[i], i);
      await new Promise(r => setTimeout(r, 350));
    }
    addLog('—— Chain complete. All 9 interlocks satisfied. ——');
    setSimStep(ERP_INTERLOCKS.length);
  };

  const reset = () => {
    setSimStep(0);
    setActiveId(null);
    setActiveStep(null);
    setLogs(['Simulator reset.']);
  };

  const planningSteps = ERP_WORKFLOW_STEPS.filter(s => s.phase === 'order-to-stock');
  const executionSteps = ERP_WORKFLOW_STEPS.filter(s => s.phase === 'shop-floor-to-bill');

  const renderStepCard = (step: (typeof ERP_WORKFLOW_STEPS)[0]) => {
    const interlock = getInterlockAfterStep(step.step);
    const isActive = activeStep === step.step;
    const isDone = simStep >= step.step;

    return (
      <div key={step.step} className="relative">
        <button
          type="button"
          onClick={() => { setActiveStep(step.step); setActiveId(interlock?.id ?? null); }}
          className={`w-full text-left rounded-xl border p-4 transition-all hover:border-teal-500/40 ${
            isActive ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 ring-1 ring-teal-500/25' : 'border-border bg-card'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isDone ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.step}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm">{step.title}</span>
                <Badge variant="outline" className="text-[10px]">{step.module}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.description}</p>
              <Link
                to={step.path}
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              >
                Open module <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </button>
        {interlock && (
          <div className="flex items-center gap-2 my-2 ml-4 pl-4 border-l-2 border-dashed border-teal-300/60">
            <Link2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
              {interlock.name}: {interlock.dataPassed}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-8 w-8 text-teal-600" />
            ERP Manufacturing Workflow
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Module-by-module order-to-cash flow with nine mandatory interlocks. Raw material GRN confirms stock,
            then the shop floor runs production through billing.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={runFullChain} disabled={simStep > 0 && simStep < ERP_INTERLOCKS.length}>
            <Play className="h-4 w-4 mr-2" />
            Simulate Full Chain
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Phase 1: Order to stock */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phase 1 — Order to raw material stock</CardTitle>
          <CardDescription>Sales order → MRP → Procurement → GRN (inventory confirmed)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {planningSteps.map(renderStepCard)}
        </CardContent>
      </Card>

      {/* Phase 2: Shop floor to bill */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phase 2 — Shop floor to billing</CardTitle>
          <CardDescription>Production → QC → FG warehouse → Dispatch → Finance → Sales order closed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {executionSteps.map(renderStepCard)}
        </CardContent>
      </Card>

      {/* Compact flow strip */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Interlock map</CardTitle>
          <CardDescription>Click an interlock to highlight the hand-off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {ERP_INTERLOCKS.map((interlock, i) => (
              <div key={interlock.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveId(interlock.id); setActiveStep(interlock.afterStep); }}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition-all hover:border-teal-500/50 ${
                    activeId === interlock.id
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 ring-1 ring-teal-500/30'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="font-semibold text-teal-700 dark:text-teal-400 block">{interlock.name}</span>
                  <span className="text-muted-foreground">{interlock.fromModule} → {interlock.toModule}</span>
                </button>
                {i < ERP_INTERLOCKS.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-teal-700 border-teal-300">Loop closed</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interlock registry table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5 text-teal-600" />
            Where the interlocks sit
          </CardTitle>
          <CardDescription>
            Each row is a mandatory integration point — broken links cause overstocking, missed shipments, or invoice mismatches.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Interlock (data link)</th>
                  <th className="px-4 py-3 text-left font-semibold">From module</th>
                  <th className="px-4 py-3 text-left font-semibold">To module</th>
                  <th className="px-4 py-3 text-left font-semibold">What gets passed</th>
                  <th className="px-4 py-3 text-left font-semibold">If broken</th>
                  <th className="px-4 py-3 text-right font-semibold">Simulate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ERP_INTERLOCKS.map((interlock, i) => (
                  <tr
                    key={interlock.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      activeId === interlock.id ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-medium">
                      <span className="flex items-center gap-2">
                        {simStep > i && <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />}
                        {interlock.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link to={interlock.fromPath} className="text-primary hover:underline inline-flex items-center gap-1">
                        {interlock.fromModule}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link to={interlock.toPath} className="text-primary hover:underline inline-flex items-center gap-1">
                        {interlock.toModule}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{interlock.dataPassed}</td>
                    <td className="px-4 py-3.5">
                      <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5">
                        {interlock.failureModes.map(m => (
                          <li key={m} className="flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => runInterlock(interlock, i)}>
                        Run
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Configuration guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            ERP configuration notes
          </CardTitle>
          <CardDescription>Priority order for implementing interlocks in Sumesh Petroleum ERP</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {ERP_CONFIGURATION_NOTES.map(note => (
            <div key={note.title} className="rounded-lg border p-4 bg-muted/20">
              <h4 className="font-semibold text-sm mb-1.5">{note.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{note.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Event log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interlock event log</CardTitle>
          <CardDescription>Simulation output — document references copied at each hand-off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs p-4 max-h-52 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith('——') ? 'text-teal-400 font-semibold' : ''}>{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
