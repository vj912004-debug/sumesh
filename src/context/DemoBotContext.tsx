import {
  createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  runDemoOilFiltrationOrder,
  runDemoRentalOrder,
  runDemoServiceOrder,
  type DemoRunOptions,
  type DemoStepResult,
} from '@/lib/demoOrderJourney';
import { createVisualDriver, visualSleep } from '@/lib/visualDemoDriver';
import { playResultScene, playVisualScene, type DemoKind } from '@/lib/visualDemoScenes';

const DEMO_SEQUENCE: DemoKind[] = ['manufacture', 'rental', 'service'];

const STEP_COUNTS: Record<DemoKind, number> = {
  manufacture: 12,
  rental: 7,
  service: 8,
};

const TOTAL_STEPS = 27;
const STEP_DELAY_MS = 1200;

const DEMO_RUNNERS: Record<DemoKind, (opts?: DemoRunOptions) => ReturnType<typeof runDemoOilFiltrationOrder>> = {
  manufacture: runDemoOilFiltrationOrder,
  rental: runDemoRentalOrder,
  service: runDemoServiceOrder,
};

const DEMO_TITLES: Record<DemoKind, string> = {
  manufacture: 'Manufacture Order',
  rental: 'Rental Order',
  service: 'Service / AMC Order',
};

export type BotLogEntry = {
  id: number;
  time: string;
  message: string;
  tone: 'info' | 'ok' | 'error' | 'system';
};

export type DemoPanelState = {
  results: DemoStepResult[];
  summary: Record<string, string | undefined>;
  currentStep: DemoStepResult | null;
  completed: boolean;
};

const emptyPanel = (): DemoPanelState => ({
  results: [],
  summary: {},
  currentStep: null,
  completed: false,
});

type DemoBotContextValue = {
  visualMode: boolean;
  botRunning: boolean;
  botStatus: 'idle' | 'running' | 'done' | 'stopped';
  logs: BotLogEntry[];
  completedSteps: number;
  totalStepsTarget: number;
  demoStates: Record<DemoKind, DemoPanelState>;
  activeKind: DemoKind;
  cursor: { x: number; y: number } | null;
  highlight: DOMRect | null;
  botMessage: string;
  startAutoBot: () => Promise<void>;
  startSingleDemo: (kind: DemoKind) => Promise<void>;
  stopAutoBot: () => void;
};

const DemoBotContext = createContext<DemoBotContextValue | null>(null);

function formatTime(): string {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function DemoBotProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);
  const logIdRef = useRef(0);

  const [visualMode, setVisualMode] = useState(false);
  const [botRunning, setBotRunning] = useState(false);
  const [botStatus, setBotStatus] = useState<'idle' | 'running' | 'done' | 'stopped'>('idle');
  const [logs, setLogs] = useState<BotLogEntry[]>([]);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalStepsTarget, setTotalStepsTarget] = useState(TOTAL_STEPS);
  const [activeKind, setActiveKind] = useState<DemoKind>('manufacture');
  const [demoStates, setDemoStates] = useState<Record<DemoKind, DemoPanelState>>({
    manufacture: emptyPanel(),
    rental: emptyPanel(),
    service: emptyPanel(),
  });
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);
  const [botMessage, setBotMessage] = useState('');

  const addLog = useCallback((message: string, tone: BotLogEntry['tone'] = 'info') => {
    logIdRef.current += 1;
    setLogs(prev => [...prev, { id: logIdRef.current, time: formatTime(), message, tone }]);
  }, []);

  const makeDriver = useCallback((signal: AbortSignal) =>
    createVisualDriver({
      onCursorMove: (x, y) => setCursor({ x, y }),
      onHighlight: rect => setHighlight(rect),
      onMessage: setBotMessage,
    }, signal),
  []);

  const runDemoLive = useCallback(async (kind: DemoKind, signal: AbortSignal) => {
    setActiveKind(kind);
    setVisualMode(true);
    setDemoStates(prev => ({ ...prev, [kind]: emptyPanel() }));
    addLog(`▶ Starting ${DEMO_TITLES[kind]}…`, 'system');

    const driver = makeDriver(signal);

    const out = await DEMO_RUNNERS[kind]({
      signal,
      onBeforeStep: async (step, ctx) => {
        setDemoStates(prev => ({
          ...prev,
          [kind]: { ...prev[kind], currentStep: step },
        }));
        addLog(`🖥 Opening ${step.title}…`, 'info');
        await playVisualScene({
          kind,
          step,
          summary: ctx.summary,
          navigate: path => navigate(path),
          driver,
        });
      },
      onStep: async (result, ctx) => {
        setDemoStates(prev => ({
          ...prev,
          [kind]: {
            ...prev[kind],
            results: [...prev[kind].results, result],
            summary: ctx.summary,
            currentStep: result,
          },
        }));
        setCompletedSteps(prev => prev + 1);
        const tone = result.status === 'ok' ? 'ok' : 'error';
        addLog(`✓ ${result.title} — ${result.detail}`, tone);

        if (result.status === 'ok' && result.path) {
          await playResultScene({
            kind,
            step: result,
            navigate: path => navigate(path),
            driver,
            documentId: result.documentId,
          });
        }
        await visualSleep(STEP_DELAY_MS, signal);
      },
    });

    setDemoStates(prev => ({
      ...prev,
      [kind]: {
        results: out.results,
        summary: out.summary,
        currentStep: null,
        completed: true,
      },
    }));

    const errCount = out.results.filter(r => r.status === 'error').length;
    if (errCount === 0) {
      addLog(`✅ ${DEMO_TITLES[kind]} complete.`, 'ok');
    } else {
      addLog(`⚠ ${DEMO_TITLES[kind]} finished with ${errCount} error(s).`, 'error');
    }
    return out;
  }, [addLog, makeDriver, navigate]);

  const startRun = useCallback(async (kinds: DemoKind[], targetSteps: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBotRunning(true);
    setBotStatus('running');
    setVisualMode(true);
    setLogs([]);
    setCompletedSteps(0);
    setTotalStepsTarget(targetSteps);
    setCursor(null);
    setHighlight(null);
    setBotMessage('');
    setDemoStates({
      manufacture: emptyPanel(),
      rental: emptyPanel(),
      service: emptyPanel(),
    });

    try {
      for (const kind of kinds) {
        if (controller.signal.aborted) break;
        await runDemoLive(kind, controller.signal);
        if (controller.signal.aborted) break;
        await visualSleep(600, controller.signal);
      }
      if (!controller.signal.aborted) {
        setBotStatus('done');
        setBotMessage('All journeys complete!');
        addLog('🎉 Demo complete — every document is live in your ERP.', 'system');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setBotStatus('stopped');
        addLog('⏹ Auto Bot stopped.', 'system');
      } else {
        setBotStatus('stopped');
        addLog(err instanceof Error ? err.message : 'Demo failed.', 'error');
      }
    } finally {
      setBotRunning(false);
      setCursor(null);
      setHighlight(null);
      abortRef.current = null;
    }
  }, [addLog, runDemoLive]);

  const startAutoBot = useCallback(() => startRun(DEMO_SEQUENCE, TOTAL_STEPS), [startRun]);
  const startSingleDemo = useCallback((kind: DemoKind) => {
    addLog(`🤖 Running ${DEMO_TITLES[kind]} with visual navigation…`, 'system');
    return startRun([kind], STEP_COUNTS[kind]);
  }, [addLog, startRun]);

  const stopAutoBot = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const value = useMemo<DemoBotContextValue>(() => ({
    visualMode,
    botRunning,
    botStatus,
    logs,
    completedSteps,
    totalStepsTarget,
    demoStates,
    activeKind,
    cursor,
    highlight,
    botMessage,
    startAutoBot,
    startSingleDemo,
    stopAutoBot,
  }), [
    visualMode, botRunning, botStatus, logs, completedSteps, totalStepsTarget,
    demoStates, activeKind, cursor, highlight, botMessage,
    startAutoBot, startSingleDemo, stopAutoBot,
  ]);

  return (
    <DemoBotContext.Provider value={value}>
      {children}
    </DemoBotContext.Provider>
  );
}

export function useDemoBot(): DemoBotContextValue {
  const ctx = useContext(DemoBotContext);
  if (!ctx) throw new Error('useDemoBot must be used within DemoBotProvider');
  return ctx;
}

export function useDemoBotOptional(): DemoBotContextValue | null {
  return useContext(DemoBotContext);
}
