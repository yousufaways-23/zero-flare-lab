"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/lib/app-store";
import type { ChartSpec } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, X, Send, Wrench, Link2, Bot, Loader2, Volume2, VolumeX, UserRound, GripVertical } from "lucide-react";
import { AgentChart } from "@/components/flame/copilot/AgentChart";
import { CirOneAvatar } from "@/components/flame/copilot/CirOneAvatar";

interface ToolTrace {
  name: string;
  args: Record<string, unknown>;
  summary: string;
  provenance: string;
  ok: boolean;
}

/** Stable per-browser CIR-1 conversation id for the durable server log (ADR-014). */
function copilotSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem("cir1-session-id");
  if (!id || !/^[A-Za-z0-9._-]{1,64}$/.test(id)) {
    id = `c1-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
    window.localStorage.setItem("cir1-session-id", id);
  }
  return id;
}

interface UIMessage {
  role: "user" | "assistant";
  content: string;
  toolTrace?: ToolTrace[];
  charts?: ChartSpec[];
  sources?: string[];
  mode?: string;
  /** CODEX Phase 8 — click-confirmed navigation buttons (never auto-navigated). */
  navActions?: { view: string; investigation?: string; investigationTab?: string; environment?: string; label: string }[];
}

// Minimal markdown formatter: **bold**, `code`, and line breaks only.
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
    return (
      <span key={li}>
        {parts.map((part, pi) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pi} className="font-semibold text-[color:var(--hotcore)]">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return <code key={pi} className="rounded bg-background/60 px-1 py-0.5 font-mono text-[11px]">{part.slice(1, -1)}</code>;
          }
          return <span key={pi}>{part}</span>;
        })}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

export function CopilotDock() {
  const { copilotOpen, setCopilotOpen, view, environment, environmentLabel, selectedInvestigation, investigationTab, scenarioPillar, selectedEquipment, facility } = useAppStore();
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to FLAME EVIDENCE LAB. I'm CIR-1, the research copilot over NASA microgravity combustion evidence — 25 PSI investigations (including STDCE-1 from our live acquisition sweep), 24 recovered tables, 63 verified equations, honest model cards and a live NTRS link. Ask me anything, or try: \"Show FLEX oxygen vs extinction\" or \"Compare Moon vs Earth pO2\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* origin dock pattern — resizable drawer: width presets + left-edge drag handle, persisted */
  const WIDTH_MIN = 360;
  const WIDTH_MAX = 760;
  const [dockWidth, setDockWidth] = useState(440);
  const [desktop, setDesktop] = useState(false);
  const dockWidthRef = useRef(440);

  useEffect(() => {
    try {
      const w = Number(localStorage.getItem("copilot-dock-width"));
      // hydration sync: persisted width + viewport class only exist client-side
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Number.isFinite(w) && w >= WIDTH_MIN && w <= WIDTH_MAX) setDockWidth(w);
    } catch { /* storage unavailable — keep default */ }
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const persistWidth = useCallback((w: number) => {
    dockWidthRef.current = w;
    setDockWidth(w);
    try { localStorage.setItem("copilot-dock-width", String(w)); } catch { /* ignore */ }
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const onMove = (ev: PointerEvent) => {
        const w = Math.round(Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, window.innerWidth - ev.clientX - 20)));
        dockWidthRef.current = w;
        setDockWidth(w);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.userSelect = "";
        try { localStorage.setItem("copilot-dock-width", String(dockWidthRef.current)); } catch { /* ignore */ }
      };
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [],
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  // guided demo (audit §39): listen for deterministic scripted exchanges —
  // the payload is composed at dispatch time from the real registries.
  useEffect(() => {
    const onSeed = (e: Event) => {
      const detail = (e as CustomEvent<{ user: string; assistant: string; tools?: string[] }>).detail;
      if (!detail?.user || !detail?.assistant) return;
      setMessages((m) => [
        ...m,
        { role: "user", content: detail.user },
        {
          role: "assistant",
          content: detail.assistant,
          ...(detail.tools ? { toolTrace: detail.tools.map((name) => ({ name, args: {}, summary: "deterministic demo replay", provenance: "demo script — composed from live registries", ok: true })) } : {}),
        } as UIMessage,
      ]);
      setCopilotOpen(true);
    };
    window.addEventListener("flame:copilot-seed", onSeed);
    return () => window.removeEventListener("flame:copilot-seed", onSeed);
  }, [setCopilotOpen]);

  // apply UI actions from agent (navigate etc.)
  // CODEX Phase 8 — navigate actions become click-confirmed buttons; only
  // save_* actions apply immediately (they mutate the user's own shelves).
  const applyActions = useCallback((actions: Record<string, unknown>[]) => {
    const store = useAppStore.getState();
    const navs: { view: string; investigation?: string; investigationTab?: string; environment?: string; label: string }[] = [];
    for (const action of actions) {
      if (action.action === "navigate") {
        const view = String(action.view ?? "mission");
        const inv = typeof action.investigation === "string" ? action.investigation : undefined;
        const env = typeof action.environment === "string" ? action.environment : undefined;
        navs.push({
          view,
          investigation: inv,
          investigationTab: typeof action.investigationTab === "string" ? action.investigationTab : undefined,
          environment: env,
          label: inv ? `Open ${inv}` : `${view.charAt(0).toUpperCase()}${view.slice(1).replace("-", " ")}`,
        });
      } else if (action.action === "save_session") {
        store.saveSession({
          title: String(action.title ?? "Session"),
          notes: (action.notes as string) ?? undefined,
          provenance: (action.provenance as string) ?? undefined,
          environment,
          investigation: selectedInvestigation ?? undefined,
        });
      } else if (action.action === "save_gap") {
        store.toggleSavedGap({
          gapId: String(action.gapId ?? "gap"),
          topic: String(action.topic ?? "Research gap"),
          note: (action.note as string) ?? undefined,
          externalHits: typeof action.externalHits === "number" ? action.externalHits : undefined,
        });
      } else if (action.action === "save_item") {
        store.toggleSavedItem({
          kind: String(action.kind ?? "source") as never,
          label: String(action.label ?? "Saved item"),
          detail: (action.detail as string) ?? undefined,
          url: (action.url as string) ?? undefined,
          note: (action.note as string) ?? undefined,
        });
        store.setView("my-work");
      } else if (action.action === "compare") {
        const accs = Array.isArray(action.accessions) ? (action.accessions as string[]) : [];
        store.clearCompare();
        accs.forEach((a) => store.toggleCompare(a));
        navs.push({ view: "compare", label: `Open Comparison (${accs.join(", ")})` });
      }
    }
    return navs;
  }, [environment, selectedInvestigation]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    setBusy(true);
    const userMsg: UIMessage = { role: "user", content };
    setMessages((m) => [...m, userMsg]);
    // durable conversation log (ADR-014): best-effort server mirror
    const sid = copilotSessionId();
    void fetch("/api/workspace/conversations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: sid, role: "user", content, createdAt: new Date().toISOString() }),
    }).catch(() => undefined);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })).slice(-12),
          context: {
            view, environment, environmentLabel, investigation: selectedInvestigation, investigationTab,
            scenarioPillar, equipment: selectedEquipment,
            // compact facility context (§11.1) — ids and numbers only, no image bytes
            ...(view === "scenarios" && facility.compartments.length
              ? {
                  facility: {
                    name: facility.name,
                    layoutImageAttached: Boolean(facility.layoutImageName),
                    compartments: facility.compartments.map((c) => ({
                      name: c.name || "unnamed",
                      areaM2: c.areaM2,
                      heightM: c.heightM,
                      volumeM3: c.areaM2 * c.heightM,
                      materials: c.materials,
                      ignitionSources: c.ignitionSources,
                      ventilation: c.ventilation,
                      detection: c.detection,
                    })),
                  },
                }
              : {}),
          },
        }),
      });
      const data = await res.json();
      const navActions = Array.isArray(data.uiActions) ? applyActions(data.uiActions) : [];
      const assistantMsg: UIMessage = {
        role: "assistant",
        content: data.reply ?? data.error ?? "No reply.",
        toolTrace: data.toolTrace ?? [],
        charts: data.charts ?? [],
        sources: data.sources ?? [],
        mode: data.mode,
        navActions,
      };
      setMessages((m) => [...m, assistantMsg]);
      void fetch("/api/workspace/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          role: "assistant",
          content: assistantMsg.content,
          mode: data.mode ?? null,
          toolTrace: data.toolTrace ? JSON.stringify(data.toolTrace).slice(0, 20000) : null,
          createdAt: new Date().toISOString(),
        }),
      }).catch(() => undefined);
      if (voice && typeof window !== "undefined" && "speechSynthesis" in window && data.reply) {
        const utter = new SpeechSynthesisUtterance(String(data.reply).replace(/[*#`>]/g, "").slice(0, 600));
        utter.rate = 1.02;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error reaching the copilot. The deterministic sections keep working — please retry." }]);
    } finally {
      setBusy(false);
    }
  };

  if (!copilotOpen) {
    return (
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b45a2b] to-[#a34d28] px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-[#be5f35]/30 hover:brightness-110 transition-all"
        aria-label="Open CIR-1 research copilot"
      >
        <Sparkles className="h-4 w-4" />
        CIR-1
      </button>
    );
  }

  return (
    <div
      data-tour="tour-cir1"
      className="fixed inset-x-0 bottom-0 z-40 flex max-h-[76vh] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-h-[70vh]"
      style={desktop ? { width: dockWidth } : undefined}
    >
      {/* origin drag handle — resize the drawer from its left edge (desktop only) */}
      <div
        onPointerDown={startDrag}
        onDoubleClick={() => persistWidth(440)}
        className="absolute left-0 top-0 hidden h-full w-2 cursor-ew-resize items-center justify-center rounded-l-2xl transition-colors hover:bg-primary/20 sm:flex"
        role="separator"
        aria-orientation="vertical"
        aria-label="Drag to resize the copilot drawer (double-click resets)"
        title="Drag to resize · double-click to reset"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
      </div>
      <div className="flex w-full flex-col overflow-hidden rounded-t-2xl border border-border/60 bg-[color:var(--space-panel)]/97 backdrop-blur-xl shadow-2xl sm:rounded-2xl">
        {/* header — CIR-1 guide character reacts to the conversation state */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <CirOneAvatar state={busy ? "thinking" : messages.length > 1 ? "speaking" : "idle"} size={40} />
          <div className="leading-tight">
            <div className="text-sm font-semibold">CIR-1 — Research Copilot</div>
            <div className="text-[10px] text-muted-foreground">42 tools + citations · never invents data · <span className="italic">guide character, not a real astronaut</span></div>
          </div>
          {/* width presets (origin dock) */}
          <div className="ml-auto flex items-center gap-1" role="group" aria-label="Drawer width presets">
            {([["S", 380], ["M", 440], ["L", 620]] as const).map(([label, w]) => (
              <button
                key={label}
                onClick={() => persistWidth(w)}
                className={`hidden sm:inline-flex h-6 w-6 items-center justify-center rounded border font-mono text-[10px] transition-colors ${
                  Math.abs(dockWidth - w) < 30 ? "border-primary/60 bg-primary/15 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground"
                }`}
                aria-label={`Set drawer width to ${label} (${w}px)`}
                aria-pressed={Math.abs(dockWidth - w) < 30}
              >
                {label}
              </button>
            ))}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVoice(!voice)} aria-label={voice ? "Mute voice output" : "Enable voice output (AI voice disclosure)"}>
              {voice ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCopilotOpen(false)} aria-label="Close copilot">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {voice && (
          <div className="bg-accent/40 px-4 py-1.5 text-[10px] text-muted-foreground">
            Voice output uses your browser speech synthesis (AI-generated voice disclosure). No microphone input is used.
          </div>
        )}

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4 data-scroll">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/20 border border-primary/30 px-3.5 py-2 text-sm">
                  <span className="sr-only">You: </span>
                  {m.content}
                </div>
              ) : (
                <div className="max-w-full space-y-2">
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                    <div className="rounded-2xl rounded-bl-sm glass-panel px-3.5 py-2.5 text-sm leading-relaxed break-words [&_b]:text-[color:var(--hotcore)]">
                      {renderMarkdown(m.content)}
                    </div>
                  </div>
                  {m.charts && m.charts.length > 0 && (
                    <div className="pl-6 space-y-2">
                      {m.charts.map((c, ci) => (
                        <AgentChart key={ci} spec={c} />
                      ))}
                    </div>
                  )}
                  {/* CODEX Phase 8 — click-confirmed navigation buttons */}
                  {m.navActions && m.navActions.length > 0 && (
                    <div className="pl-6 flex flex-wrap gap-1.5" role="group" aria-label="Suggested navigation">
                      {m.navActions.map((nv, ni) => (
                        <button
                          key={ni}
                          onClick={() => {
                            const s = useAppStore.getState();
                            if (nv.investigation) s.openInvestigation(nv.investigation, (nv.investigationTab as never) ?? "overview");
                            else s.setView(nv.view as never);
                            if (nv.environment) s.setEnvironment(nv.environment as never);
                          }}
                          className="rounded-md border border-primary/50 bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/25"
                        >
                          {nv.label} →
                        </button>
                      ))}
                    </div>
                  )}
                  {m.toolTrace && m.toolTrace.length > 0 && (
                    <details className="pl-6">
                      <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                        <Wrench className="h-3 w-3" /> tool trace ({m.toolTrace.length}) — deterministic, inspectable
                      </summary>
                      <div className="mt-1.5 space-y-1.5">
                        {m.toolTrace.map((t, ti) => (
                          <div key={ti} className="rounded-md border border-border/40 bg-background/40 p-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={t.ok ? "default" : "destructive"} className="h-4 px-1.5 text-[9px] font-mono">{t.name}</Badge>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              running tools over the evidence base…
            </div>
          )}
        </div>

        {/* composer */}
        <div className="border-t border-border/60 p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about evidence, data, equations, models…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              aria-label="Message to the research copilot"
            />
            <Button onClick={() => send()} disabled={busy || !input.trim()} size="icon" className="h-9 w-9 shrink-0" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Research decision support only — not certified fire-safety guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
