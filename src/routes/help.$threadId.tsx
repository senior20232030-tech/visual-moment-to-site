import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { loadThreads, newThread, saveThreads, titleFrom, type HelpThread } from "@/lib/threads";
import { cn } from "@/lib/utils";
import guideMark from "@/assets/guide-mark.png";

export const Route = createFileRoute("/help/$threadId")({
  head: () => ({
    meta: [
      { title: "Onboarding Guide — DICS Global" },
      { name: "description", content: "Ask questions about your DICS Global onboarding forms and documents." },
      { property: "og:title", content: "Onboarding Guide — DICS Global" },
      { property: "og:description", content: "Get answers about joining forms, declarations and required documents." },
    ],
  }),
  component: HelpThreadPage,
});

const SUGGESTIONS = [
  "Which forms do I need to fill in?",
  "What is EPF Nomination Form 2 for?",
  "Which file types can I upload?",
  "Who do I contact if I'm stuck?",
];

function HelpThreadPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<HelpThread[] | null>(null);

  useEffect(() => {
    const all = loadThreads();
    if (!all.some((t) => t.id === threadId)) {
      navigate({ to: "/help", replace: true });
      return;
    }
    setThreads(all);
  }, [threadId, navigate]);

  const active = threads?.find((t) => t.id === threadId);

  const startNew = () => {
    const all = loadThreads();
    const empty = all.find((t) => t.messages.length === 0);
    const t = empty ?? newThread();
    if (!empty) saveThreads([t, ...all]);
    navigate({ to: "/help/$threadId", params: { threadId: t.id } });
  };

  const remove = (id: string) => {
    const rest = loadThreads().filter((t) => t.id !== id);
    saveThreads(rest);
    if (id === threadId) navigate({ to: "/help" });
    else setThreads(rest);
  };

  const persist = (messages: UIMessage[]) => {
    const all = loadThreads();
    const next = all.map((t) =>
      t.id === threadId ? { ...t, messages, title: titleFrom(messages), updatedAt: Date.now() } : t,
    );
    saveThreads(next);
    setThreads(next.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden w-72 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex items-center gap-3 border-b p-4">
          <img src={guideMark} alt="Onboarding guide" width={816} height={816} className="size-9" />
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">Onboarding Guide</p>
            <p className="text-xs text-muted-foreground">DICS Global</p>
          </div>
        </div>
        <div className="p-3">
          <Button onClick={startNew} className="w-full justify-start">
            <Plus className="size-4" /> New question
          </Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3" aria-label="Conversations">
          {threads?.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center rounded-lg text-sm",
                t.id === threadId ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-muted",
              )}
            >
              <Link
                to="/help/$threadId"
                params={{ threadId: t.id }}
                className="flex-1 truncate px-3 py-2"
              >
                {t.title}
              </Link>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label={`Delete conversation ${t.title}`}
                className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-2 border-t p-4 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to onboarding
        </Link>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <Link to="/" aria-label="Back to onboarding"><ArrowLeft className="size-5" /></Link>
          <span className="font-display font-semibold">Onboarding Guide</span>
          <Button size="sm" variant="outline" onClick={startNew}><Plus className="size-4" /> New</Button>
        </header>
        {active && <ChatWindow key={threadId} thread={active} onPersist={persist} />}
      </main>
    </div>
  );
}

function ChatWindow({ thread, onPersist }: { thread: HelpThread; onPersist: (m: UIMessage[]) => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { threadId: thread.id } }),
    [thread.id],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (e) => {
      const msg = e.message || "";
      if (msg.includes("429")) setError("Too many questions right now. Please wait a moment and try again.");
      else if (msg.includes("402")) setError("The guide is temporarily unavailable. Please contact hr@dicsglobal.com.");
      else setError("Sorry, the answer couldn't be loaded. Check your connection and try again.");
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  useEffect(() => {
    if (!busy && messages.length > 0 && messages.length !== thread.messages.length) {
      persistRef.current(messages);
    }
    if (!busy) textareaRef.current?.focus();
  }, [busy, messages, thread.messages.length]);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setError(null);
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4">
      <Conversation className="flex-1">
        <ConversationContent className="py-8">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <img src={guideMark} alt="" width={816} height={816} className="size-16" />
              <h1 className="mt-4 text-2xl font-semibold">How can I help with your onboarding?</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Ask about any of the nine joining forms, declarations or supporting documents.
              </p>
              <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-xl border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-accent hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent
                  className={cn(m.role === "user" && "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground")}
                >
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      m.role === "assistant" ? (
                        <MessageResponse key={i}>{p.text}</MessageResponse>
                      ) : (
                        <p key={i} className="whitespace-pre-wrap">{p.text}</p>
                      )
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Checking the guidance…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="pb-4">
        <PromptInput onSubmit={(msg) => ask(msg.text ?? "")}>
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Ask about a form or document…"
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !input.trim()} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Answers are guidance only. Confirm anything official with hr@dicsglobal.com.
        </p>
      </div>
    </div>
  );
}
