import type { UIMessage } from "ai";

export type HelpThread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };

const KEY = "dics-onboarding-help-threads";

export function loadThreads(): HelpThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as HelpThread[]) : [];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: HelpThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(threads));
}

export function newThread(): HelpThread {
  return { id: crypto.randomUUID().slice(0, 8), title: "New question", updatedAt: Date.now(), messages: [] };
}

/** Returns the most recent empty thread, or creates one. Idempotent across StrictMode re-runs. */
export function getOrCreateStartThread(): HelpThread {
  const threads = loadThreads();
  const empty = threads.find((t) => t.messages.length === 0);
  if (empty) return empty;
  const t = newThread();
  saveThreads([t, ...threads]);
  return t;
}

export function titleFrom(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts.find((p) => p.type === "text");
  const s = text && "text" in text ? text.text.trim() : "";
  return s ? (s.length > 48 ? `${s.slice(0, 48)}…` : s) : "New question";
}
