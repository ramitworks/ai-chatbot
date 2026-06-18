"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus, Square } from "lucide-react";
import { MarkdownMessage } from "@/components/markdown";
import { PERSONAS, getPersona, type Persona } from "@/lib/personas";

const GITHUB_URL = "https://github.com/ramitworks";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

/** Flatten a UI message's text parts into a single string. */
function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function Home() {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [resetKey, setResetKey] = useState(0);
  const persona = getPersona(personaId);

  return (
    <div className="flex flex-1 flex-col">
      <Header
        persona={persona}
        onNewChat={() => setResetKey((k) => k + 1)}
      />
      {/* Remounting via key gives us a clean "new chat" reset. */}
      <Chat
        key={resetKey}
        persona={persona}
        personaId={personaId}
        onPersonaChange={setPersonaId}
      />
    </div>
  );
}

function Header({
  persona,
  onNewChat,
}: {
  persona: Persona;
  onNewChat: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-lg">
            {persona.emoji}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">
              {persona.name}{" "}
              <span className="font-normal text-muted">· {persona.tagline}</span>
            </p>
            <p className="text-xs text-muted">AI Chatbot demo</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-border-strong hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New chat
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted transition hover:border-border-strong hover:text-foreground"
            aria-label="GitHub"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Chat({
  persona,
  personaId,
  onPersonaChange,
}: {
  persona: Persona;
  personaId: string;
  onPersonaChange: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view as it streams.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed }, { body: { persona: personaId } });
    setInput("");
  }

  const isEmpty = messages.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6">
        {isEmpty ? (
          <EmptyState
            persona={persona}
            personaId={personaId}
            onPersonaChange={onPersonaChange}
            onPick={submit}
          />
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                emoji={persona.emoji}
                text={messageText(m)}
              />
            ))}
            {status === "submitted" && <TypingIndicator emoji={persona.emoji} />}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message ||
              "Something went wrong. Check that the Gemini API key is set."}
          </div>
        )}
      </div>

      <Composer
        input={input}
        setInput={setInput}
        onSubmit={() => submit(input)}
        onStop={stop}
        isBusy={isBusy}
      />
    </main>
  );
}

function EmptyState({
  persona,
  personaId,
  onPersonaChange,
  onPick,
}: {
  persona: Persona;
  personaId: string;
  onPersonaChange: (id: string) => void;
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center pt-10 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-3xl">
        {persona.emoji}
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        Chat with <span className="text-gradient">{persona.name}</span>
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">{persona.tagline}</p>

      {/* Persona switcher */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {PERSONAS.map((p) => {
          const active = p.id === personaId;
          return (
            <button
              key={p.id}
              onClick={() => onPersonaChange(p.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-accent/60 bg-accent-soft text-foreground"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground"
              }`}
            >
              <span>{p.emoji}</span>
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Starter prompts */}
      <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-1">
        {persona.starters.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-foreground/90 transition hover:border-border-strong hover:bg-surface-2"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  emoji,
  text,
}: {
  role: string;
  emoji: string;
  text: string;
}) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[0.95rem] text-white">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-base">
        {emoji}
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3">
        <MarkdownMessage content={text} />
      </div>
    </div>
  );
}

function TypingIndicator({ emoji }: { emoji: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-base">
        {emoji}
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-4">
        <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
        <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
        <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
      </div>
    </div>
  );
}

function Composer({
  input,
  setInput,
  onSubmit,
  onStop,
  isBusy,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isBusy: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-5 pt-2">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-border-strong">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={1}
          placeholder="Send a message…  (Enter to send, Shift+Enter for newline)"
          className="max-h-44 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted/70"
        />
        {isBusy ? (
          <button
            onClick={onStop}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-foreground transition hover:bg-white/10"
            aria-label="Stop"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!input.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white transition enabled:hover:opacity-90 disabled:opacity-30"
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[0.7rem] text-muted/60">
        Powered by Google Gemini via the Vercel AI SDK · Demo by Ramit
      </p>
    </div>
  );
}
