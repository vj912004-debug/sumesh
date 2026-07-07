/**
 * DOM automation helpers for the visual ERP demo bot.
 * Types into fields, clicks buttons, and moves a virtual cursor in front of the user.
 */

export type VisualDriverCallbacks = {
  onCursorMove: (x: number, y: number) => void;
  onHighlight: (rect: DOMRect | null) => void;
  onMessage: (msg: string) => void;
};

const CHAR_DELAY_MS = 35;
const ACTION_PAUSE_MS = 400;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

function centerOf(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  descriptor?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function createVisualDriver(callbacks: VisualDriverCallbacks, signal?: AbortSignal) {
  const wait = (ms: number) => sleep(ms, signal);

  async function waitForSelector(selector: string, timeoutMs = 8000): Promise<Element> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const el = document.querySelector(selector);
      if (el) return el;
      await wait(120);
    }
    throw new Error(`Element not found: ${selector}`);
  }

  async function moveTo(el: Element): Promise<void> {
    const { x, y } = centerOf(el);
    callbacks.onCursorMove(x, y);
    await wait(280);
  }

  async function highlight(el: Element | null, holdMs = 900): Promise<void> {
    if (!el) {
      callbacks.onHighlight(null);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(200);
    callbacks.onHighlight(el.getBoundingClientRect());
    await wait(holdMs);
  }

  async function click(selector: string): Promise<void> {
    const el = await waitForSelector(selector);
    await moveTo(el);
    await highlight(el, 350);
    (el as HTMLElement).click();
    await wait(ACTION_PAUSE_MS);
  }

  async function typeInto(selector: string, text: string): Promise<void> {
    const el = await waitForSelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    await moveTo(el);
    await highlight(el, 300);
    el.focus();
    setNativeValue(el, '');
    for (const ch of text) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      setNativeValue(el, el.value + ch);
      await wait(CHAR_DELAY_MS);
    }
    await wait(ACTION_PAUSE_MS);
  }

  async function selectValue(selector: string, value: string): Promise<void> {
    const el = await waitForSelector(selector) as HTMLSelectElement;
    await moveTo(el);
    await highlight(el, 350);
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(ACTION_PAUSE_MS);
  }

  async function pulsePage(selector = '[data-demo-page]'): Promise<void> {
    try {
      const el = await waitForSelector(selector, 4000);
      await highlight(el, 1200);
    } catch {
      await wait(800);
    }
  }

  async function narrate(msg: string, holdMs = 1000): Promise<void> {
    callbacks.onMessage(msg);
    await wait(holdMs);
  }

  return {
    wait,
    waitForSelector,
    moveTo,
    highlight,
    click,
    typeInto,
    selectValue,
    pulsePage,
    narrate,
    clearHighlight: () => callbacks.onHighlight(null),
  };
}

export type VisualDriver = ReturnType<typeof createVisualDriver>;

export { sleep as visualSleep };
