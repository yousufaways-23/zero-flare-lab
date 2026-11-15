"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore, VIEW_META, type ViewId, type AdvancedPanel, type EnvId, type PillarId } from "@/lib/app-store";
import { getCorpusTotals, getInvestigations } from "@/lib/data/catalog";
import { EQUATIONS } from "@/lib/science/equations";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Rocket, FlaskConical, GitCompare, Calculator, Boxes, Database, Wrench, Sparkles, ChevronRight, Globe2, FolderOpen, Play, Shield, Radar, TrendingUp, Flame } from "lucide-react";

/* origin nav instrument chips — compact environment readout by destination */
const ENV_CHIP: Record<EnvId, string> = {
  earth: "Earth · 1 g",
  iss: "ISS · ~10⁻⁶ g",
  moon: "Lunar · 0.166 g",
  mars: "Mars · 0.38 g",
  spacecraft: "Cabin · transit",
  spacesuit: "Suit · 4.3 psi",
};

const ENV_LABELS: Record<EnvId, string> = {
  earth: "Earth reference (1 g)",
  iss: "ISS — microgravity (CIR/ACME era)",
  moon: "Lunar habitat concept (0.166 g)",
  mars: "Mars habitat concept (0.38 g)",
  spacecraft: "Spacecraft cabin concept",
  spacesuit: "Spacesuit concept (4.3 psi O2)",
};

const VIEW_ICONS: Record<ViewId, React.ComponentType<{ className?: string }>> = {
  mission: Rocket,
  investigations: FlaskConical,
  compare: GitCompare,
  scenarios: Calculator,
  lab3d: Boxes,
  "data-sources": Database,
  "my-work": FolderOpen,
  tools: Wrench,
};

const ADVANCED_PANELS: { id: AdvancedPanel; label: string; hint: string }[] = [
  { id: "model-studio", label: "Model Studio", hint: "Model cards, guarded playgrounds, negative results" },
  { id: "math-models", label: "Mathematical Models", hint: "Model registry: governing equations, applicability, selection" },
  { id: "variables", label: "Variable Dictionary", hint: "Canonical variables, units, fill rates" },
  { id: "equations", label: "Equation Registry", hint: "Verified equations with reference tests" },
  { id: "evaluation", label: "AI Evaluation", hint: "§15 metrics: retrieval, data quality, evidence, absences" },
  { id: "diagnostics", label: "Diagnostics & Reconciliation", hint: "Recovery ledger, discrepancies, integrity" },
];

const PILLAR_META: { id: PillarId; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "prevention", label: "Prevention", hint: "Flammability, ignition, atmosphere evidence", icon: Shield },
  { id: "detection", label: "Detection", hint: "Smoke, aerosols, sensor evidence", icon: Radar },
  { id: "prediction", label: "Prediction", hint: "Guarded models — never out of domain", icon: TrendingUp },
  { id: "suppression", label: "Suppression", hint: "Extinction and diluent evidence", icon: Flame },
];

export function MegaNav() {
  const { view, setView, openAdvanced, openInvestigation, commandOpen, setCommandOpen, setCopilotOpen, setEnvironment, environment, environmentLabel } = useAppStore();
  const investigations = useMemo(() => getInvestigations(), []);
  const totals = useMemo(() => getCorpusTotals(), []);
  // Investigations mega picker filter — every investigation is listed (no slice);
  // the query narrows by accession, title, label or research area.
  const [invQuery, setInvQuery] = useState("");
  const filteredInvestigations = useMemo(() => {
    const q = invQuery.trim().toLowerCase();
    if (!q) return investigations;
    return investigations.filter((inv) =>
      [inv.accession, inv.title, inv.shortLabel, inv.researchArea, inv.subResearchArea].some(
        (v) => (v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [investigations, invQuery]);

  // Ctrl+K / Cmd+K command search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  const navItem = (id: ViewId) => {
    const meta = VIEW_META[id];
    const Icon = VIEW_ICONS[id];
    return (
      <NavigationMenuItem key={id}>
        <button
          onClick={() => setView(id)}
          title={meta.label}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
            view === id ? "text-primary" : "text-foreground/80 hover:text-foreground",
          )}
          aria-current={view === id ? "page" : undefined}
          aria-label={meta.label}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden xl:inline">{meta.label}</span>
        </button>
      </NavigationMenuItem>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-[color:var(--space-deep)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:px-5">
          {/* brand — ZERO emblem extracted from the supplied team brand art (never wraps, never shrinks) */}
          <div data-header-slot="brand" className="flex min-w-0 shrink-0">
            {/* accessible name comes from the visible text itself (label-content-name-mismatch fix) */}
            <button onClick={() => setView("mission")} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap pr-2">
              <img src="/brand/zero-flare-emblem.png" width={30} height={30} alt="ZERO FLARE emblem" className="shrink-0" />
              <div className="hidden text-left leading-tight md:block">
                <div className="whitespace-nowrap text-[13px] font-semibold tracking-wide">FLAME EVIDENCE LAB</div>
                <div className="whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-muted-foreground">ZERO FLARE Mission Team</div>
              </div>
            </button>
          </div>

          <div className="hidden md:block w-px h-6 bg-border/60 mx-1 shrink-0" aria-hidden="true" />

          {/* main nav with per-trigger mega-menu content — viewport={false} renders each
              NavigationMenuContent absolutely anchored under its OWN trigger (the Phase-4
              shared viewport put every popup at the nav's left edge, which made Scenarios
              and Research Tools appear under Mission). Popup widths are clamped to the
              viewport so nothing overflows on md–xl screens; no overflow clip here because
              the absolute popups legitimately extend beyond the nav box. */}
          <div data-header-slot="nav" className="hidden min-w-0 flex-1 md:block">
            <NavigationMenu viewport={false} className="min-w-0 justify-start">
              <NavigationMenuList className="min-w-0 data-scroll">
              {navItem("mission")}
              {/* Investigations mega */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-transparent" title="Investigations" aria-label="Investigations">
                  <FlaskConical className="mr-1 h-4 w-4" />
                  <span className="hidden xl:inline">Investigations</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="md:w-[min(calc(100vw-20rem),820px)] p-0">
                  <div className="grid grid-cols-[1fr_230px]">
                    <div className="flex max-h-[min(70vh,560px)] flex-col">
                      <div className="border-b border-border/50 p-2.5">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                          <input
                            value={invQuery}
                            onChange={(e) => setInvQuery(e.target.value)}
                            placeholder={`Filter all ${investigations.length} investigations — accession, title or area…`}
                            aria-label="Filter investigations"
                            className="h-8 w-full rounded-md border border-border/60 bg-background/60 pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/50"
                          />
                        </div>
                      </div>
                      <div className="grid flex-1 grid-cols-2 content-start gap-1 overflow-y-auto p-2">
                        {filteredInvestigations.length === 0 ? (
                          <p className="col-span-2 px-3 py-6 text-center text-xs text-muted-foreground">
                            No investigation matches “{invQuery.trim()}”.
                          </p>
                        ) : (
                          filteredInvestigations.map((inv) => (
                            <button
                              key={inv.accession}
                              onClick={() => openInvestigation(inv.accession)}
                              className="flex flex-col items-start rounded-md px-3 py-2 text-left hover:bg-accent/60 transition-colors"
                            >
                              <span className="text-xs font-mono text-primary">{inv.accession}</span>
                              <span className="text-[13px] leading-tight">{inv.shortLabel}</span>
                              <span className="text-[11px] text-muted-foreground">{inv.tableRows} rows · {inv.subResearchArea ?? inv.researchArea ?? ""}</span>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="border-t border-border/50 px-3 py-1.5 text-[10px] text-muted-foreground">
                        Showing {filteredInvestigations.length} of {investigations.length} investigations
                      </div>
                    </div>
                    <div className="border-l border-border/60 p-4 flex flex-col gap-2 bg-accent/20">
                      <p className="text-xs font-semibold text-primary">Evidence workspaces</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Each investigation embeds EDA over real recovered tables, equipment, authentic NASA media, equation
                        context, a typed mini graph and documented gaps.
                      </p>
                      <button onClick={() => setView("investigations")} className="mt-auto flex items-center gap-1 text-xs text-primary hover:underline">
                        Open the full atlas <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {/* Scenarios mega */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-transparent" title="Scenarios" aria-label="Scenarios">
                  <Calculator className="mr-1 h-4 w-4" />
                  <span className="hidden xl:inline">Scenarios</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="md:w-[min(calc(100vw-24rem),600px)] p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {PILLAR_META.map(({ id, label, hint, icon: PillarIcon }) => (
                      <button
                        key={id}
                        onClick={() => {
                          useAppStore.getState().setScenarioPillar(id);
                          setView("scenarios");
                        }}
                        className="flex flex-col items-start gap-1.5 rounded-md border border-border/50 p-3 text-left hover:border-primary/50 hover:bg-accent/40 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <PillarIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                          {label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{hint}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">One scenario context shared across the fire-safety lifecycle · equation resolver · saved session shelf</p>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {navItem("compare")}
              {navItem("lab3d")}
              {navItem("data-sources")}
              {navItem("my-work")}
              {/* Advanced tools mega */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-transparent" title="Research Tools" aria-label="Research Tools">
                  <Wrench className="mr-1 h-4 w-4" />
                  <span className="hidden xl:inline">Research Tools</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="md:left-auto md:right-0 md:w-[min(calc(100vw-14rem),640px)] p-3">
                  <div className="grid grid-cols-2 gap-1">
                    {ADVANCED_PANELS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openAdvanced(p.id)}
                        className="flex flex-col items-start rounded-md px-3 py-2.5 text-left hover:bg-accent/60 transition-colors"
                      >
                        <span className="text-sm font-medium">{p.label}</span>
                        <span className="text-[11px] text-muted-foreground">{p.hint}</span>
                      </button>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* right actions — fixed cluster, never wrapped */}
          <div data-header-slot="actions" className="ml-auto flex shrink-0 items-center gap-2">
            {/* active research environment — live switcher (visible on widest screens where nav has room) */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="hidden min-[1728px]:flex whitespace-nowrap items-center gap-1.5 rounded-full border border-[#5799d1]/40 bg-[#5799d1]/10 px-2.5 py-1.5 font-mono text-[10px] tracking-wide text-[#9ccae9] transition-colors hover:border-[#5799d1]/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5799d1]/60"
                title={`Active research environment: ${environmentLabel} — click to switch`}
                aria-label={`Active research environment: ${environmentLabel}. Open menu to switch environment.`}
              >
                <Globe2 className="h-3 w-3" aria-hidden="true" />
                {ENV_CHIP[environment] ?? environmentLabel}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Research environment context</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(ENV_CHIP) as EnvId[]).map((id) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={() => setEnvironment(id, ENV_LABELS[id])}
                    className={cn("font-mono text-xs", id === environment && "bg-primary/15 text-primary")}
                    aria-pressed={id === environment}
                  >
                    {ENV_LABELS[id]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  The environment context pre-fills calculators, scenarios and CIR-1 answers. Evidence coverage is always shown per gravity regime.
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* origin data badge — live corpus readout (widest screens only) */}
            <span
              className="hidden min-[1728px]:inline-flex whitespace-nowrap items-center rounded-full border border-border/60 bg-accent/25 px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
              aria-label={`${totals.rows ?? 0} recovered experimental rows across ${totals.tables ?? 0} tables`}
            >
              {(totals.rows ?? 0).toLocaleString("en-US")} rows · {totals.tables ?? 0} tables
            </span>
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 rounded-md border border-border/60 bg-accent/30 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              aria-label="Open command search"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden min-[1728px]:inline">Search…</span>
              <kbd className="hidden min-[1728px]:inline rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">Ctrl K</kbd>
            </button>
            <button
              onClick={() => setCopilotOpen(true)}
              className="cta-glow flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#b45a2b] to-[#a34d28] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110"
              aria-label="Open CIR-1, the research copilot"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CIR-1</span>
            </button>
          </div>
        </div>

        {/* mobile nav */}
        <nav className="md:hidden relative" aria-label="Mobile sections">
          <div
            className="flex overflow-x-auto data-scroll gap-1 px-2 pb-2 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-36px),transparent)]"
          >
            {(Object.keys(VIEW_META) as ViewId[]).map((id) => {
              const Icon = VIEW_ICONS[id];
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    view === id ? "border-primary/60 bg-primary/15 text-primary" : "border-border/50 text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {VIEW_META[id].label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </>
  );
}

function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { setView, openInvestigation, openAdvanced, setEnvironment, setCopilotOpen } = useAppStore();
  const investigations = useMemo(() => getInvestigations(), []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a section, investigation, equation or ask the Copilot…" />
      <CommandList className="max-h-[440px]">
        <CommandEmpty>No match. Try an investigation (PSI-69), equation (Ra) or section name.</CommandEmpty>
        <CommandGroup heading="Sections">
          {(Object.keys(VIEW_META) as ViewId[]).map((id) => (
            <CommandItem key={id} value={`section ${VIEW_META[id].label} ${VIEW_META[id].hint}`} onSelect={() => { setView(id); setOpen(false); }}>
              <ChevronRight className="mr-2 h-3.5 w-3.5" />
              <span className="font-medium">{VIEW_META[id].label}</span>
              <span className="ml-2 text-xs text-muted-foreground truncate">{VIEW_META[id].hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Investigations (NASA PSI)">
          {investigations.map((inv) => (
            <CommandItem
              key={inv.accession}
              value={`inv ${inv.accession} ${inv.title} ${inv.shortLabel}`}
              onSelect={() => { openInvestigation(inv.accession); setOpen(false); }}
            >
              <span className="mr-2 font-mono text-xs text-primary">{inv.accession}</span>
              <span className="truncate">{inv.shortLabel}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Equations (verified registry)">
          {EQUATIONS.slice(0, 200).map((eqx) => (
            <CommandItem
              key={eqx.id}
              value={`eq ${eqx.name} ${eqx.id} ${eqx.statement}`}
              onSelect={() => { openAdvanced("equations"); setOpen(false); }}
            >
              <span className="mr-2 font-mono text-xs text-primary">ƒ</span>
              <span className="truncate">{eqx.name}</span>
              <Badge variant="outline" className="ml-auto text-[10px]">{eqx.id}</Badge>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Mission environments">
          {[
            ["earth", "Earth reference (1 g)"],
            ["iss", "ISS — microgravity (CIR/ACME era)"],
            ["moon", "Lunar habitat concept (0.166 g)"],
            ["mars", "Mars habitat concept (0.38 g)"],
            ["spacecraft", "Spacecraft cabin concept"],
            ["spacesuit", "Spacesuit concept (4.3 psi O2)"],
          ].map(([id, label]) => (
            <CommandItem key={id} value={`env ${label}`} onSelect={() => { setEnvironment(id as never, label); setView("scenarios"); setOpen(false); }}>
              <span className="mr-2 font-mono text-xs text-primary">g</span>
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ask CIR-1">
          <CommandItem value="copilot ask ai cir-1" onSelect={() => { setCopilotOpen(true); setOpen(false); }}>
            <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
            Ask CIR-1 — the research copilot
          </CommandItem>
          <CommandItem value="demo guided tour judge walkthrough" onSelect={() => { useAppStore.getState().setDemoOpen(true); setOpen(false); }}>
            <Play className="mr-2 h-3.5 w-3.5 text-primary" />
            Start the 90-second guided tour (deterministic demo)
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
