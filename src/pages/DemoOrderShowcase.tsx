import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoBot } from '@/context/DemoBotContext';
import type { DemoStepResult } from '@/lib/demoOrderJourney';
import {
  CheckCircle2, ExternalLink, Loader2, Play, Square, XCircle, Route,
  Factory, Package, Wrench, Sparkles, Monitor,
} from 'lucide-react';

type DemoKind = 'manufacture' | 'rental' | 'service';

const DEMO_CONFIG: Record<DemoKind, { title: string; description: string; icon: typeof Factory }> = {
  manufacture: {
    title: 'Manufacture Order',
    description: 'Oil Filtration Plant for Tata Power — full ERP chain from enquiry to dispatch.',
    icon: Factory,
  },
  rental: {
    title: 'Rental Order',
    description: 'Dry Air + Filtration Rig for Torrent Power — rental challan, pending tracking, return.',
    icon: Package,
  },
  service: {
    title: 'Service / AMC Order',
    description: 'AMC for Reliance — service ticket, spares, warranty repair, close.',
    icon: Wrench,
  },
};

function StepRow({ row, isActive }: { row: DemoStepResult; isActive: boolean }) {
  return (
    <div className={[
      'flex flex-col gap-3 rounded-lg border px-3 py-2.5 transition-all sm:flex-row sm:items-start',
      isActive ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-200' : 'border-zinc-100',
      row.status === 'ok' && !isActive ? 'bg-emerald-50/40' : '',
      row.status === 'error' ? 'bg-red-50/50 border-red-200' : '',
    ].join(' ')}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-bold">
          {isActive ? <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" /> : row.step}
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-medium">{row.title}</p>
          <p className="mt-0.5 break-words text-sm leading-relaxed text-muted-foreground">{row.detail}</p>
          {row.documentId && <p className="mt-1 break-all font-mono text-xs text-teal-700">{row.documentId}</p>}
        </div>
      </div>
      {row.path && row.status === 'ok' && !isActive && (
        <Link to={row.path} className="shrink-0 sm:self-start">
          <Button variant="ghost" size="sm" className="w-full justify-center text-xs sm:w-auto">
            Open <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function DemoPanel({ kind }: { kind: DemoKind }) {
  const { demoStates, botRunning, activeKind } = useDemoBot();
  const state = demoStates[kind];
  const config = DEMO_CONFIG[kind];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold">{config.title}</h3>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{config.description}</p>
        </div>
      </div>
      {state.results.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-lg">
          {botRunning && activeKind === kind
            ? 'Bot is navigating to modules and filling forms…'
            : 'Press Start Visual Auto Bot to begin.'}
        </p>
      ) : (
        <div className="max-h-[min(420px,calc(100vh-18rem))] space-y-2 overflow-y-auto pr-1">
          {state.results.map(row => (
            <StepRow
              key={row.step}
              row={row}
              isActive={state.currentStep?.step === row.step && botRunning && activeKind === kind}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DemoOrderShowcase() {
  const {
    botRunning, botStatus, logs, completedSteps, totalStepsTarget,
    startAutoBot, startSingleDemo, stopAutoBot, demoStates, activeKind,
  } = useDemoBot();
  const [activeTab, setActiveTab] = useState<DemoKind>('manufacture');

  const progressPct = totalStepsTarget > 0 ? Math.round((completedSteps / totalStepsTarget) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          <Route className="h-7 w-7 shrink-0 text-teal-600 sm:h-8 sm:w-8" />
          <span className="min-w-0">Live Demo Orders</span>
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          The <strong>Visual Auto Bot</strong> opens each ERP screen in front of you — navigates modules,
          fills forms field by field, then shows the created document.
        </p>
      </div>

      <Card className="overflow-hidden border-teal-200 bg-gradient-to-br from-teal-50/80 to-white">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Monitor className="h-5 w-5 shrink-0 text-teal-600" />
            Visual Auto Bot
          </CardTitle>
          <CardDescription className="max-w-4xl leading-relaxed">
            {botRunning
              ? `Step ${completedSteps} of ${totalStepsTarget} — watch the bot work across real screens (floating panel bottom-right).`
              : 'Starts on this page, then navigates through Enquiries, Quotations, PO, GRN, Production, and more.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-2 w-full rounded-full bg-teal-100 overflow-hidden">
            <div className="h-full bg-teal-600 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
            {!botRunning ? (
              <>
                <Button onClick={startAutoBot} size="lg" className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto">
                  <Sparkles className="h-4 w-4 mr-2" /> Start Visual Auto Bot
                </Button>
                <Button onClick={() => startSingleDemo(activeTab)} size="lg" variant="outline" className="w-full sm:w-auto">
                  <Play className="h-4 w-4 mr-2" /> Run {DEMO_CONFIG[activeTab].title} only
                </Button>
              </>
            ) : (
              <Button onClick={stopAutoBot} size="lg" variant="destructive" className="w-full sm:w-auto">
                <Square className="h-4 w-4 mr-2 fill-current" /> Stop Bot
              </Button>
            )}
            {botStatus === 'done' && !botRunning && (
              <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:justify-start">
                <CheckCircle2 className="h-4 w-4" /> Demo complete
              </span>
            )}
            {botStatus === 'stopped' && !botRunning && (
              <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 sm:justify-start">
                <XCircle className="h-4 w-4" /> Stopped
              </span>
            )}
          </div>
          {logs.length > 0 && (
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-300">
              {logs.slice(-8).map(l => (
                <div key={l.id} className="break-words">[{l.time}] {l.message}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={botRunning ? activeKind : activeTab} onValueChange={v => !botRunning && setActiveTab(v as DemoKind)}>
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-muted p-1 sm:grid-cols-3">
          <TabsTrigger value="manufacture" disabled={botRunning && activeKind !== 'manufacture'} className="w-full justify-center">
            <Factory className="mr-2 h-4 w-4" /> Manufacture
            {demoStates.manufacture.completed && <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-600" />}
          </TabsTrigger>
          <TabsTrigger value="rental" disabled={botRunning && activeKind !== 'rental'} className="w-full justify-center">
            <Package className="mr-2 h-4 w-4" /> Rental
            {demoStates.rental.completed && <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-600" />}
          </TabsTrigger>
          <TabsTrigger value="service" disabled={botRunning && activeKind !== 'service'} className="w-full justify-center">
            <Wrench className="mr-2 h-4 w-4" /> Service / AMC
            {demoStates.service.completed && <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-600" />}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manufacture" className="mt-4"><DemoPanel kind="manufacture" /></TabsContent>
        <TabsContent value="rental" className="mt-4"><DemoPanel kind="rental" /></TabsContent>
        <TabsContent value="service" className="mt-4"><DemoPanel kind="service" /></TabsContent>
      </Tabs>
    </div>
  );
}
