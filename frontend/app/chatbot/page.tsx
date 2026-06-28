"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Bot, Loader2, MessageSquareMore, RefreshCw, Sparkles, Wand2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import {
  createChatSession,
  fetchChatHistory,
  fetchChatSessions,
  generatePromptTemplate,
  getStoredToken,
  sendChatMessage,
  submitCheckIn,
  type ChatPromptInput,
  type CheckInResponse,
  type PromptTemplateResponse,
  type ChatMessage,
  type ChatSession,
} from "@/lib/api";

export default function Page() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("Plan my workout for tonight and suggest a high-protein dinner.");
  const [template, setTemplate] = useState<PromptTemplateResponse | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [promptForm, setPromptForm] = useState<ChatPromptInput>({
    goal: "general fitness",
    tone: "friendly",
    memory_summary: "",
    mood: "neutral",
    sentiment: "neutral",
  });
  const [checkInForm, setCheckInForm] = useState({
    energy_level: 7,
    soreness_level: 3,
    mood_text: "Feeling ready to move.",
  });

  const reload = () =>
    Promise.all([fetchChatSessions(getStoredToken()), fetchChatHistory(getStoredToken())])
      .then(([sessionList, history]) => {
        setSessions(sessionList);
        setMessages(history);
        setConversationId(sessionList[0]?.id ?? null);
      })
      .catch(() => {
        setSessions([]);
        setMessages([]);
      });

  useEffect(() => {
    reload();
  }, []);

  const visibleMessages = useMemo(() => messages.slice(-40), [messages]);

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Gym buddy"
          title="LLM fitness coach with memory and sentiment"
          description="Ask for workouts, meals, motivation, or daily check-ins. Responses are stored through the FastAPI chatbot module."
          actions={
            <button type="button" onClick={reload} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr_0.9fr]">
          <SectionCard title="Conversations" description="Recent sessions and stored memory.">
            <div className="space-y-3">
              {sessions.length ? (
                sessions.map((session) => (
                  <button
                    key={session.id ?? session.title}
                    type="button"
                    onClick={() => setConversationId(session.id ?? null)}
                    className={`w-full rounded-[20px] border px-4 py-3 text-left transition ${
                      conversationId === session.id ? "border-primary/30 bg-primary/10" : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium">{session.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{session.summary || "Memory available"}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No chat sessions yet. Start a conversation and the backend will persist it.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Chat"
            description="Your messages are forwarded to the LLM-backed chat API and the response is appended here."
            actions={
              <button
                type="button"
                onClick={() => setInput("I have 25 minutes. Give me a quick workout and a meal suggestion.")}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sample prompt
              </button>
            }
          >
            <div className="rounded-[24px] border border-border bg-background p-4">
              <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
                {visibleMessages.length ? (
                  visibleMessages.map((message, index) => (
                    <div key={message.id ?? `${message.conversation_id}-${index}`} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-foreground"
                        }`}
                      >
                        <p>{message.message}</p>
                        {message.sentiment || message.mood_detected ? (
                          <p className="mt-2 text-xs opacity-70">
                            {message.sentiment ? `${message.sentiment} sentiment` : ""} {message.mood_detected ? `| ${message.mood_detected}` : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Ask the coach a question to create the first conversation thread.
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={4}
                  className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-sm outline-none"
                  placeholder="Ask about workouts, meals, motivation, or recovery..."
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => {
                      void (async () => {
                        let sessionId = conversationId;
                        if (!sessionId) {
                          const session = await createChatSession("Daily coaching", getStoredToken());
                          sessionId = session.id ?? null;
                          setConversationId(sessionId);
                          setSessions((current) => [session, ...current]);
                        }
                        const result = await sendChatMessage(
                          {
                            message: input,
                            conversation_id: sessionId,
                            context: { source: "frontend", module: "chatbot" },
                            tone: "friendly",
                          },
                          getStoredToken(),
                        );
                        setMessages((current) => [
                          ...current,
                          {
                            conversation_id: sessionId ?? result.conversation_id,
                            sender: "user",
                            message: input,
                            created_at: new Date().toISOString(),
                          },
                          {
                            conversation_id: result.conversation_id,
                            sender: "assistant",
                            message: result.message,
                            sentiment: result.sentiment,
                            mood_detected: result.mood_detected,
                            created_at: new Date().toISOString(),
                          },
                        ]);
                        setInput("");
                      })().catch(() => undefined);
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareMore className="h-4 w-4" />}
                  Send message
                </button>
              </div>
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Prompt templates" description="Generate coach prompts for a specific tone, goal, and memory summary.">
              <div className="grid gap-3">
                <SmallField label="Goal" value={promptForm.goal ?? ""} onChange={(value) => setPromptForm((current) => ({ ...current, goal: value }))} />
                <SmallField
                  label="Tone"
                  value={promptForm.tone ?? ""}
                  onChange={(value) => setPromptForm((current) => ({ ...current, tone: value as ChatPromptInput["tone"] }))}
                />
                <SmallField
                  label="Mood"
                  value={promptForm.mood ?? ""}
                  onChange={(value) => setPromptForm((current) => ({ ...current, mood: value as ChatPromptInput["mood"] }))}
                />
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      void (async () => {
                        const result = await generatePromptTemplate(promptForm, getStoredToken());
                        setTemplate(result);
                      })().catch(() => undefined);
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate prompt
                </button>
              </div>
              {template ? (
                <div className="mt-4 space-y-3 rounded-[20px] border border-border bg-background p-4 text-sm">
                  <p className="font-semibold">System prompt</p>
                  <p className="leading-6 text-muted-foreground">{template.system_prompt}</p>
                  <p className="font-semibold">Guidelines</p>
                  <ul className="space-y-2 text-muted-foreground">
                    {template.response_guidelines?.map((item: string) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard title="Daily check-in" description="Capture energy, soreness, and mood before recommending next actions.">
              <div className="grid gap-3">
                <SmallField label="Energy" value={String(checkInForm.energy_level)} onChange={(value) => setCheckInForm((current) => ({ ...current, energy_level: Number(value) }))} />
                <SmallField label="Soreness" value={String(checkInForm.soreness_level)} onChange={(value) => setCheckInForm((current) => ({ ...current, soreness_level: Number(value) }))} />
                <textarea
                  value={checkInForm.mood_text}
                  onChange={(event) => setCheckInForm((current) => ({ ...current, mood_text: event.target.value }))}
                  className="rounded-[20px] border border-border bg-background px-4 py-3 text-sm outline-none"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      void (async () => {
                        const result = await submitCheckIn(checkInForm, getStoredToken());
                        setCheckInResult(result);
                      })().catch(() => undefined);
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Bot className="h-4 w-4" />
                  Run check-in
                </button>
              </div>
              {checkInResult ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{checkInResult.recommendation}</p> : null}
            </SectionCard>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SmallField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-[20px] border border-border bg-background px-4 py-3 text-sm outline-none" />
    </label>
  );
}
