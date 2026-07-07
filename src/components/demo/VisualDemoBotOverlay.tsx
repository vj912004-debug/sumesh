import { Bot, CheckCircle2, Loader2, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoBotOptional } from '@/context/DemoBotContext';
import { useState } from 'react';

export function VisualDemoBotOverlay() {
  const bot = useDemoBotOptional();
  const [minimized, setMinimized] = useState(false);

  if (!bot?.visualMode) return null;

  const { botRunning, botStatus, botMessage, cursor, highlight, logs, completedSteps, totalStepsTarget, stopAutoBot } = bot;
  const progressPct = totalStepsTarget > 0 ? Math.round((completedSteps / totalStepsTarget) * 100) : 0;
  const showOverlay = botRunning || botStatus === 'running';

  return (
    <>
      {/* Spotlight on active field */}
      {highlight && showOverlay && (
        <div
          className="pointer-events-none fixed z-[9998] rounded-lg border-2 border-teal-400 shadow-[0_0_0_4px_rgba(20,184,166,0.25)] animate-pulse"
          style={{
            left: highlight.left - 4,
            top: highlight.top - 4,
            width: highlight.width + 8,
            height: highlight.height + 8,
          }}
        />
      )}

      {/* Animated cursor */}
      {cursor && showOverlay && (
        <div
          className="pointer-events-none fixed z-[9999] transition-all duration-300 ease-out"
          style={{ left: cursor.x - 6, top: cursor.y - 6 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
            <path
              d="M5 3L19 12L11 13L8 20L5 3Z"
              fill="#0d9488"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}

      {/* Bot control panel */}
      <div className="fixed inset-x-3 bottom-3 z-[10000] sm:left-auto sm:right-4 sm:bottom-4 sm:w-[min(380px,calc(100vw-2rem))]">
        {minimized ? (
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl hover:bg-teal-700 animate-pulse"
            aria-label="Open ERP Auto Bot"
          >
            <Bot className="h-6 w-6" />
          </button>
        ) : (
          <div className="max-h-[min(520px,calc(100vh-1.5rem))] overflow-hidden rounded-xl border border-teal-200 bg-white/95 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3 bg-teal-600 px-3 py-2.5 text-white sm:px-4 sm:py-3">
              <div className="relative">
                <Bot className="h-6 w-6" />
                {botRunning && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-white animate-ping" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">ERP Auto Bot</p>
                <p className="text-[11px] text-teal-100 truncate">
                  {botRunning ? 'Navigating & filling forms…' : botStatus === 'done' ? 'Complete' : 'Standby'}
                </p>
              </div>
              {botRunning ? (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-teal-700 shrink-0" onClick={stopAutoBot}>
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : botStatus === 'done' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="shrink-0 rounded-md p-1 text-teal-200 hover:bg-teal-700 hover:text-white"
                aria-label="Minimize ERP Auto Bot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-6rem)] space-y-2 overflow-y-auto px-3 py-3 sm:px-4">
              <div className="h-1.5 w-full rounded-full bg-teal-100 overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{completedSteps} / {totalStepsTarget} steps</p>

              {botMessage && (
                <div className="break-words rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm leading-relaxed text-teal-900">
                  {botMessage}
                </div>
              )}

              <div className="max-h-32 overflow-y-auto rounded-md bg-zinc-900 p-2 font-mono text-[10px] leading-relaxed text-zinc-300 sm:max-h-36">
                {logs.slice(-6).map(entry => (
                  <div key={entry.id} className="break-words">
                    <span className="text-zinc-500">[{entry.time}]</span>{' '}
                    <span className={
                      entry.tone === 'ok' ? 'text-emerald-400' :
                      entry.tone === 'error' ? 'text-red-400' :
                      entry.tone === 'system' ? 'text-teal-300' : ''
                    }>
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
