"use client";

// FLAME EVIDENCE LAB — Fire Safety Assistant (enhancement brief §8).
// An AI-powered, scenario-contextual assistant embedded in the Scenarios
// experience. It analyses the facility screening configuration through the
// evidence-grounded agent (same tool protocol as the Copilot, with a dedicated
// fire-safety role prompt), asks follow-up questions when parameters are
// missing, and produces an evidence-linked assessment the user can save.
// HONESTY: research decision support only — NOT certified operational
// procedures and NOT a replacement for NASA standards or engineering review.

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/app-store";
import { screenCompartment, scoreColor, materialLabel } from "@/lib/science/screening";
import type { AtmosphereEnv } from "@/lib/data/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2, ShieldAlert, Wrench, Link2, Save, Bot, UserRound, HelpCircle } from "lucide-react";

interface ToolTrace {
  name: string;
  args: Record<string, unknown>;
  summary: string;
  provenance: string;
  ok: boolean;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
  toolTrace?: ToolTrace[];
  sources?: string[];
}

const SUGGESTED_FOLLOWUPS = [
  "Which compartment should get detection upgrades first, and why?",
  "What does the evidence say about smoke detector placement in this atmosphere?",
  "Are any of my selected materials untested in microgravity?",
  "What suppression physics is relevant for the highest-ranked compartment?",
  "What information is still missing for a defensible screening of this facility?",
];

export function FireSafetyAssistant({
  env,
  seedPrompt,
}: {
  env: AtmosphereEnv;
  seedPrompt?: { text: string; nonce: number } | null;
}) {
  const facility = useAppStore((s) => s.facility);
  const environment = useAppStore((s) => s.environment);
  const environmentLabel = useAppStore((s) => s.environmentLabel);
  const scenarioPillar = useAppStore((s) => s.scenarioPillar);
  const saveSession = useAppStore((s) => s.saveSession);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSeed = useRef<number>(-1);

  // deterministic screening computed with the SAME shared arithmetic as the panel
  const results = useMemo(
    () =>
      facility.compartments
        .map((c) => ({ c, r: screenCompartment(c, env) }))
        .sort((a, b) => b.r.score - a.r.score),
    [facility.compartments, env],
  );

  const buildContext = () => ({
    role: "fire-safety" as const,
    view: "scenarios",
    environment,
    environmentLabel,
    scenarioPillar,
    facility: {
      name: facility.name,
      layoutImageAttached: Boolean(facility.layoutImageName),
      compartments: facility.compartments.map((c) => {
        const r = screenCompartment(c, env);
        return {
          name: c.name || "unnamed",
          areaM2: c.areaM2,
          heightM: c.heightM,
          volumeM3: r.volume,
          materials: c.materials.map(materialLabel),
          ignitionSources: c.ignitionSources,
          ventilation: c.ventilation,
          detection: c.detection,
          screeningScore: r.score,
        };
      }),
      screeningScores: results.map(({ c, r }) => ({ name: c.name || "unnamed", score: r.score, label: scoreColor(r.score).label })),
    },
  });

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    setBusy(true);
    const userMsg: Msg = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })).slice(-12),
          context: buildContext(),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "No reply.",
          toolTrace: data.toolTrace ?? [],
          sources: data.sources ?? [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error reaching the assistant. The deterministic screening above keeps working — please retry." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  // seeded prompt from the FacilityScreening CTA
  useEffect(() => {
    if (seedPrompt && seedPrompt.nonce !== lastSeed.current) {
      lastSeed.current = seedPrompt.nonce;
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      void send(seedPrompt.text);
    }
  }, [seedPrompt]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const saveReport = () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    const citations = (lastAssistant.sources ?? []).slice(0, 8).join(" | ");
    saveSession({
      title: `Fire Safety Assistant — ${facility.name}`,
      notes: lastAssistant.content.slice(0, 4000),
      provenance: `AI-generated analysis over the facility screening (${facility.compartments.length} compartments, ${env.label}). Evidence links: ${citations || "see tool trace in-app"}. Research decision support — not certified guidance.`,
      environment: environment as never,
    });
  };

  return (
    <section ref={rootRef} aria-label="Fire Safety Assistant" className="glass-panel rounded-xl">
      <div className="flex flex-wrap items-center gap-2 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#be5f35] to-[#d98e4a]">
          <Sparkles className="h-4 w-4 text-white" aria-hidden />
        </div>
        <div className="leading-tight">
          <h3 className="text-sm font-semibold">Fire Safety Assistant</h3>
          <p className="text-[10.5px] text-muted-foreground">
            evidence-grounded scenario reasoning · asks when parameters are missing
          </p>
        </div>
        <Badge variant="outline" className="ml-auto border-border/60 text-[10px] text-muted-foreground">
          research decision support · not certified
        </Badge>
      </div>

      <div className="border-t border-border/50 p-4">
        {/* honesty banner (§8.3) */}
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-foreground/80">
          <ShieldAlert className="mr-1 inline h-3.5 w-3.5 text-amber-400" aria-hidden />
          <strong>Reliability bands:</strong> the assistant distinguishes experimentally validated findings (named NASA PSI
          investigations), derived engineering judgement, and AI-generated interpretation. Its output is{" "}
          <strong>not</strong> a certified operational procedure and does not replace validated space-agency safety protocols
          or qualified engineering review.
        </div>

        {/* facility context chips */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[10.5px]">
            {facility.name}
          </span>
          <span className="rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[10.5px]">
            {env.label} · pO₂ {env.pO2Kpa} kPa · {env.gravityG} g
          </span>
          {results.slice(0, 4).map(({ c, r }) => (
            <span
              key={c.id}
              className="rounded-full px-2.5 py-1 font-mono text-[10.5px]"
              style={{ background: scoreColor(r.score).bg2, color: scoreColor(r.score).text }}
              title={`Deterministic screening ${r.score}/100 (${scoreColor(r.score).label})`}
            >
              {c.name || "unnamed"}: {r.score}
            </span>
          ))}
          {results.length > 4 && (
            <span className="text-[10.5px] text-muted-foreground">+{results.length - 4} more</span>
          )}
        </div>

        {/* conversation */}
        <div ref={scrollRef} className="data-scroll max-h-96 space-y-3 overflow-y-auto rounded-lg border border-border/50 bg-background/30 p-3">
          {messages.length === 0 && (
            <div className="py-6 text-center">
              <Bot className="mx-auto h-6 w-6 text-primary/50" aria-hidden />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Ask for an analysis of the facility above — the assistant retrieves NASA PSI evidence, compares its
                reasoning with the deterministic screening scores, and asks follow-up questions when your configuration
                is missing parameters.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {SUGGESTED_FOLLOWUPS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => void send(q)}
                    className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10.5px] text-primary hover:border-primary/70"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-primary/30 bg-primary/20 px-3 py-2 text-[13px]">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-full space-y-2">
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    <div className="whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm border border-border/50 bg-card/50 px-3 py-2 text-[13px] leading-relaxed">
                      {m.content.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={pi} className="font-semibold text-[color:var(--hotcore)]">{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={pi}>{part}</span>
                        ),
                      )}
                    </div>
                  </div>
                  {m.toolTrace && m.toolTrace.length > 0 && (
                    <details className="pl-6">
                      <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                        <Wrench className="h-3 w-3" /> evidence trace ({m.toolTrace.length}) — deterministic, inspectable
                      </summary>
                      <div className="mt-1.5 space-y-1.5">
                        {m.toolTrace.map((t, ti) => (
                          <div key={ti} className="rounded-md border border-border/40 bg-background/40 p-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={t.ok ? "default" : "destructive"} className="h-4 px-1.5 font-mono text-[9px]">{t.name}</Badge>
                            </div>
                            <p className="mt-1 text-foreground/90">{t.summary}</p>
                            <p className="mt-0.5 flex items-start gap-1 text-[10px] text-muted-foreground">
                              <Link2 className="mt-0.5 h-2.5 w-2.5 shrink-0" /> {t.provenance}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> retrieving evidence and analysing your facility…
            </p>
          )}
        </div>

        {/* composer + follow-ups */}
        <div className="mt-3">
          {messages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_FOLLOWUPS.map((q) => (
                <button
                  key={q}
                  onClick={() => void send(q)}
                  disabled={busy}
                  className="flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[10.5px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
                >
                  <HelpCircle className="h-3 w-3" aria-hidden /> {q}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about this facility's fire-safety screening…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              aria-label="Message to the Fire Safety Assistant"
            />
            <Button onClick={() => void send(input)} disabled={busy || !input.trim()} size="icon" className="h-9 w-9 shrink-0" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
            <Button onClick={saveReport} disabled={!messages.some((m) => m.role === "assistant")} size="icon" variant="outline" className="h-9 w-9 shrink-0 border-border/60" aria-label="Save last assistant report to session shelf" title="Save last report to session shelf">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
