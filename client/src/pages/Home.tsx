import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Braces,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Cpu,
  Database,
  FileCheck2,
  Fingerprint,
  Gauge,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ScanLine,
  ServerCog,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
  Workflow,
  Zap,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

const scenarios = [
  { label: "Valid Action", icon: Check, note: "Authorize the vendor approval", tone: "allow" },
  { label: "Unauthorized Tool", icon: LockKeyhole, note: "Request an out of scope tool", tone: "deny" },
  { label: "Prompt Injection", icon: TriangleAlert, note: "Inject untrusted control text", tone: "escalate" },
  { label: "Changed Request", icon: Fingerprint, note: "Alter a request after approval", tone: "deny" },
  { label: "Burst Anomaly", icon: Activity, note: "Exceed the behavior threshold", tone: "freeze" },
  { label: "Replay Attempt", icon: TimerReset, note: "Reuse a consumed capability", tone: "deny" },
] as const;

const outcomeCopy = {
  ALLOW: "Authorized",
  DENY: "Blocked",
  ESCALATE: "Review required",
  FREEZE: "Agent contained",
} as const;

function shortHash(value?: string | null) {
  if (!value) return "not issued";
  return `${value.slice(0, 12)}…${value.slice(-6)}`;
}

function formatTime(value?: string | Date) {
  if (!value) return "Awaiting first event";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Home() {
  const utils = trpc.useUtils();
  const dashboard = trpc.authority.dashboard.useQuery(undefined, { refetchInterval: 3500 });
  const refreshContext = trpc.authority.refreshContext.useMutation({ onSuccess: () => utils.authority.dashboard.invalidate() });
  const runScenario = trpc.authority.runScenario.useMutation({
    onSuccess: data => {
      utils.authority.dashboard.invalidate();
      toast.success(`${data.event.outcome}: ${data.event.executionResult}`);
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    const interval = window.setInterval(() => refreshContext.mutate(), 7000);
    return () => window.clearInterval(interval);
  }, [refreshContext]);

  const data = dashboard.data;
  const resource = data?.resource;
  const events = data?.events || [];
  const latest = events[0];
  const executionActive = Boolean(resource?.executionState);
  const contextScore = resource?.contextScore || 72;
  const metrics = data?.metrics || { protectedResources: 0, totalEvents: 0, blockedEvents: 0 };
  const outcomeCounts = useMemo(() => ({
    allow: events.filter(event => event.outcome === "ALLOW").length,
    blocked: events.filter(event => event.outcome !== "ALLOW").length,
  }), [events]);

  return (
    <div className="sentra-shell">
      <header className="sticky top-0 z-30 border-b border-black/8 bg-[rgba(247,246,242,.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Sentra home">
            <img src="/manus-storage/sentra-logo_24a70887.png" className="h-10 w-10 object-contain" alt="Sentra logo" />
            <div><p className="text-sm font-extrabold tracking-[-.04em] text-[#101827]">Sentra</p><p className="mono text-[9px] tracking-[.16em] text-[#657084]">AUTHORITY OS</p></div>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-[#5d687a] md:flex">
            <a className="transition hover:text-[#8A1538]" href="#demo">Live demo</a>
            <a className="transition hover:text-[#8A1538]" href="#proof">Proof chain</a>
            <a className="transition hover:text-[#8A1538]" href="#architecture">Architecture</a>
            <a className="transition hover:text-[#8A1538]" href="#progress">Progress</a>
          </nav>
          <div className="flex items-center gap-2 rounded-full border border-[#23754a]/15 bg-[#e6f4eb] px-3 py-1.5"><span className="status-dot pulse" /><span className="mono text-[10px] font-medium tracking-wide text-[#23754a]">SYSTEM ONLINE</span></div>
        </div>
      </header>

      <main id="top">
        <section className="ambient-grid border-b border-black/7">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-24">
            <div className="reveal">
              <div className="mb-6 flex items-center gap-2"><span className="eyebrow">Round 2 live authority demo</span><span className="h-px w-12 bg-[#8A1538]/25" /></div>
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.07em] text-[#101827] md:text-6xl lg:text-7xl">The agent can reason.<br /><span className="text-[#8A1538]">Sentra controls</span> what it may do.</h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-[#586478] md:text-lg">A persistent runtime authority layer for autonomous software agents. Every requested tool action is canonicalized, evaluated by policy, bound to a signed capability, verified at the gateway, and written into a replayable proof chain.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3"><a href="#demo" className="group inline-flex items-center gap-2 rounded-full bg-[#8A1538] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#8A1538]/20 transition hover:bg-[#65102a] active:scale-[.97]">Run the live demo <ArrowDownRight className="h-4 w-4 transition group-hover:translate-y-0.5" /></a><a href="#proof" className="inline-flex items-center gap-2 rounded-full border border-[#cfd5dd] bg-white px-5 py-3 text-sm font-bold text-[#283347] transition hover:border-[#8A1538]/40 hover:text-[#8A1538] active:scale-[.97]">Inspect proof chain <Fingerprint className="h-4 w-4" /></a></div>
              <div className="mt-11 grid max-w-xl grid-cols-3 gap-3"><Metric label="Protected tools" value={String(metrics.protectedResources).padStart(2, "0")} detail="policy gateway" /><Metric label="Persistent decisions" value={String(metrics.totalEvents).padStart(2, "0")} detail="database stored" /><Metric label="Blocked paths" value={String(metrics.blockedEvents).padStart(2, "0")} detail="no tool action" /></div>
            </div>

            <div className="surface reveal relative overflow-hidden rounded-[28px] p-6 lg:p-7" style={{ animationDelay: "100ms" }}>
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#ef7d24]/10" />
              <div className="relative flex items-start justify-between"><div><p className="eyebrow">Live system state</p><h2 className="mt-2 text-xl font-extrabold tracking-[-.04em]">Procurement workspace boundary</h2></div><div className="rounded-xl border border-[#23754a]/15 bg-[#e6f4eb] p-2.5 text-[#23754a]"><ShieldCheck className="h-5 w-5" /></div></div>
              <div className="mt-7 rounded-2xl border border-[#dfe3e8] bg-[#fbfbfa] p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#ebf4fb] p-2.5 text-[#2e6495]"><Gauge className="h-5 w-5" /></div><div><p className="text-xs font-semibold text-[#687386]">Authority context score</p><p className="mt-0.5 text-2xl font-extrabold tracking-[-.05em]">{contextScore}<span className="text-sm text-[#657084]"> / 100</span></p></div></div><span className="mono rounded-md bg-white px-2 py-1 text-[10px] text-[#657084]">EVALUATING</span></div></div>
              <div className="mt-3 rounded-2xl border border-[#dfe3e8] bg-[#fbfbfa] p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`rounded-xl p-2.5 ${executionActive ? "bg-[#e6f4eb] text-[#23754a]" : "bg-[#f0f2f5] text-[#657084]"}`}><FileCheck2 className="h-5 w-5" /></div><div><p className="text-xs font-semibold text-[#687386]">Protected vendor approval</p><p className={`mt-0.5 text-sm font-extrabold ${executionActive ? "text-[#23754a]" : "text-[#657084]"}`}>{executionActive ? "APPROVED · gateway authorized" : "HELD · safe state"}</p></div></div><span className={`mono rounded-md px-2 py-1 text-[10px] ${executionActive ? "bg-[#e6f4eb] text-[#23754a]" : "bg-[#f0f2f5] text-[#657084]"}`}>{executionActive ? "AUTHORIZED" : "WAITING"}</span></div></div>
              <div className="mt-6 rounded-2xl bg-[#101827] p-4 text-white"><div className="flex items-center justify-between"><span className="mono text-[10px] tracking-[.12em] text-white/50">LATEST GATEWAY RESULT</span><ShieldCheck className="h-4 w-4 text-[#ef7d24]" /></div><p className="mt-3 text-sm font-semibold leading-6">{latest?.gatewayResult || "No request has reached the gateway yet."}</p><p className="mono mt-2 text-[10px] text-white/50">{latest ? `proof ${shortHash(latest.recordHash)}` : "proof chain begins at GENESIS"}</p></div>
            </div>
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <SectionHeading eyebrow="Interactive MVP" title="A protected tool can execute only through Sentra." description="Run a scenario. The server computes the authority outcome, persists the canonical request and proof records, and changes the protected workspace state only for an authorized action." />
          <div className="mt-9 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
            <div className="surface rounded-[26px] p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Agent to tool path</p><h3 className="mt-2 text-2xl font-extrabold tracking-[-.05em]">Proposal to protected execution</h3></div><span className="flex items-center gap-2 rounded-full bg-[#e6f4eb] px-3 py-1.5 text-xs font-bold text-[#23754a]"><span className="status-dot" /> Connected</span></div>
              <div className="mt-6 rounded-[22px] border border-[#dfe3e8] bg-[linear-gradient(145deg,#ffffff,#f0f3f5)] p-5"><PathStage icon={Cpu} title="Procurement agent" detail="procurement-agent-01" tone="blue" /><PathArrow /><PathStage icon={ShieldCheck} title="Sentra gateway" detail="policy · capability · verification" tone="brand" /><PathArrow /><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`rounded-2xl p-3 ${executionActive ? "bg-[#e6f4eb] text-[#23754a]" : "bg-[#f0f2f5] text-[#657084]"}`}><FileCheck2 className="h-7 w-7" /></div><div><p className="text-sm font-bold">Vendor approval tool</p><p className="mono mt-1 text-xs text-[#657084]">workspace/vendor-intake/contoso</p></div></div><div className={`rounded-full px-3 py-2 text-xs font-extrabold ${executionActive ? "bg-[#e6f4eb] text-[#23754a]" : "bg-[#f0f2f5] text-[#657084]"}`}>{executionActive ? "APPROVED" : "HELD"}</div></div></div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#fff7ed] p-4 text-sm leading-6 text-[#6f431c]"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#ef7d24]" /><p><strong>Hard rule:</strong> the workspace execution state is stored in the database and can change only after the server returns <strong>ALLOW</strong> with a verified capability.</p></div>
            </div>
            <div className="surface rounded-[26px] p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">Demo controls</p><h3 className="mt-2 text-2xl font-extrabold tracking-[-.05em]">Test the security boundary</h3></div><span className="mono rounded-full border border-[#dfe3e8] bg-white px-3 py-1.5 text-[10px] text-[#657084]">PERSISTENT SCENARIOS</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{scenarios.map(({ label, icon: Icon, note, tone }) => <button key={label} type="button" disabled={runScenario.isPending} onClick={() => runScenario.mutate({ scenario: label })} className="group rounded-2xl border border-[#dfe3e8] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#8A1538]/35 hover:shadow-[0_14px_30px_rgba(16,24,39,.07)] disabled:cursor-wait disabled:opacity-60 active:scale-[.985]"><div className="flex items-start justify-between gap-3"><span className={`rounded-xl p-2.5 ${tone === "allow" ? "bg-[#e6f4eb] text-[#23754a]" : tone === "escalate" ? "bg-[#fff4de] text-[#b36d16]" : tone === "freeze" ? "bg-[#ebf4fb] text-[#2e6495]" : "bg-[#fff0ef] text-[#b34343]"}`}><Icon className="h-4 w-4" /></span><ChevronRight className="h-4 w-4 text-[#a4adba] transition group-hover:translate-x-0.5 group-hover:text-[#8A1538]" /></div><p className="mt-4 text-sm font-extrabold tracking-[-.02em]">{label}</p><p className="mt-1 text-xs leading-5 text-[#657084]">{note}</p></button>)}</div><div className="mt-5 rounded-2xl border border-dashed border-[#cfd5dd] bg-[#fbfbfa] p-4"><p className="mono text-[10px] tracking-[.14em] text-[#657084]">CURRENT DECISION</p><div className="mt-2 flex flex-wrap items-center gap-3">{latest ? <><OutcomeBadge outcome={latest.outcome} /><p className="text-sm font-semibold text-[#334055]">{latest.gatewayResult}</p></> : <p className="text-sm text-[#657084]">Select a scenario to create the first signed proof record.</p>}</div></div></div>
          </div>
        </section>

        <section className="border-y border-black/7 bg-white/65"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><SectionHeading eyebrow="Authority decision feed" title="Every request becomes an inspectable record." description="The feed comes from the persisted authority event table. Each scenario stores the request, policy outcome, capability details, gateway result, and protected tool outcome." /><div className="mt-9 grid gap-5 lg:grid-cols-[1.06fr_.94fr]"><div className="surface overflow-hidden rounded-[26px]"><div className="flex items-center justify-between border-b border-[#dfe3e8] px-5 py-4"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#8A1538]" /><h3 className="text-sm font-extrabold">Recent authority decisions</h3></div><span className="mono text-[10px] text-[#657084]">{events.length} RECORDED</span></div><div className="divide-y divide-[#e9ebee]">{events.length === 0 ? <EmptyFeed /> : events.slice(0, 6).map(event => <DecisionRow key={event.eventId} event={event} />)}</div></div><div className="surface rounded-[26px] p-5"><p className="eyebrow">Canonical request inspector</p><h3 className="mt-2 text-xl font-extrabold tracking-[-.04em]">Exact authority, not a vague intention.</h3>{latest ? <div className="mt-5"><div className="rounded-2xl bg-[#101827] p-4"><p className="mono text-[10px] tracking-[.13em] text-white/45">CANONICAL REQUEST</p><pre className="mono mt-3 overflow-x-auto whitespace-pre-wrap text-[11px] leading-5 text-white/85">{JSON.stringify(latest.canonicalRequest, null, 2)}</pre></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><HashCard label="Request hash" value={latest.requestHash} /><HashCard label="Capability hash" value={latest.capabilityHash} /></div></div> : <div className="mt-5 rounded-2xl bg-[#f0f2f5] p-5 text-sm leading-6 text-[#657084]">Run a scenario to inspect the exact canonical request stored by Sentra.</div>}</div></div></div></section>

        <section id="proof" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><SectionHeading eyebrow="Hash linked audit proof" title="The chain is persistent, ordered, and replayable." description="Every record hashes its decision evidence together with the previous record hash. This makes the proof chain explicit and lets the judge inspect how an action moved from request to execution." /><div className="mt-9 grid gap-5 lg:grid-cols-[.72fr_1.28fr]"><div className="surface rounded-[26px] p-6"><p className="eyebrow">Proof chain invariant</p><h3 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.06em]">No valid policy decision.<br /><span className="text-[#8A1538]">No valid capability.</span><br />No gateway execution.</h3><div className="mt-8 space-y-5">{[["01", "Canonical request", "The stable request representation is hashed."], ["02", "Authority decision", "The policy outcome is recorded and bounded."], ["03", "Capability and gateway", "Signed scope is verified before the tool call."], ["04", "Execution proof", "The result is chained to prior evidence."]].map(([number, title, copy]) => <div key={number} className="flow-line flex gap-3"><span className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2e9ec] text-[11px] font-bold text-[#8A1538]">{number}</span><div><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-sm leading-5 text-[#657084]">{copy}</p></div></div>)}</div></div><div className="surface overflow-hidden rounded-[26px]"><div className="flex items-center justify-between border-b border-[#dfe3e8] px-5 py-4"><div className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-[#8A1538]" /><h3 className="text-sm font-extrabold">Persisted audit timeline</h3></div><span className="mono text-[10px] text-[#657084]">GENESIS → LATEST</span></div><div className="max-h-[520px] overflow-y-auto p-5">{events.length === 0 ? <div className="rounded-2xl border border-dashed border-[#dfe3e8] p-8 text-center text-sm text-[#657084]">The first scenario will create a persistent proof record after GENESIS.</div> : events.map((event, index) => <ProofRow key={event.eventId} event={event} latest={index === 0} />)}</div></div></div></section>

        <section id="architecture" className="border-y border-black/7 bg-[#101827] text-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="eyebrow !text-[#ef7d24]">Architecture and request to proof flow</p><div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><h2 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-.06em] md:text-5xl">Four planes prevent one agent from owning the entire chain.</h2><p className="max-w-md text-sm leading-6 text-white/60">Sentra keeps policy, enforcement, evidence, and protected tool responsibilities separate. The agent can propose, but the gateway owns execution.</p></div><div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{[["Control", "Identity, contracts, policies, approvals, and revocation.", ShieldCheck], ["Data", "Canonical request intake, context, and deterministic policy input.", Database], ["Enforcement", "Capability issuer, gateway verification, state machine, and tool control.", LockKeyhole], ["Evidence", "Hash linked audit, replay review, incidents, and proof export.", Fingerprint]].map(([title, copy, Icon]) => { const PlaneIcon = Icon as typeof ShieldCheck; return <div key={title as string} className="rounded-[22px] border border-white/10 bg-white/5 p-5"><PlaneIcon className="h-5 w-5 text-[#ef7d24]" /><p className="mt-8 text-xl font-extrabold tracking-[-.04em]">{title as string}</p><p className="mt-2 text-sm leading-6 text-white/60">{copy as string}</p></div>; })}</div><div className="mt-8 rounded-[26px] border border-white/10 bg-white/5 p-5 md:p-7"><div className="flex flex-wrap items-center gap-3">{[["1", "Agent request", Cpu], ["2", "Canonical request", Braces], ["3", "Policy decision", ScanLine], ["4", "Signed capability", KeyRound], ["5", "Gateway verifies", ShieldCheck], ["6", "Tool execution", FileCheck2], ["7", "Proof record", Fingerprint]].map(([number, label, Icon], index, list) => { const FlowIcon = Icon as typeof Cpu; return <div key={label as string} className="flex items-center gap-3"><div className="flex min-w-[130px] items-center gap-2 rounded-xl border border-white/10 bg-[#101827]/50 px-3 py-2.5"><span className="mono text-[10px] text-[#ef7d24]">{number as string}</span><FlowIcon className="h-3.5 w-3.5 text-white/70" /><span className="text-xs font-bold">{label as string}</span></div>{index < list.length - 1 && <ArrowRight className="h-4 w-4 text-white/25" />}</div>; })}</div><p className="mt-6 text-center text-sm font-semibold text-[#ef7d24]">The model can change its reasoning. It cannot change its authority.</p></div></div></section>

        <section id="progress" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><SectionHeading eyebrow="Round 2 progress update" title="Built as a focused, software-only MVP." description="The project requires no IoT device or physical hardware. It proves the authority boundary with a persistent application, controlled protected tool state, and replayable evidence." /><div className="mt-9 grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><div className="surface rounded-[26px] p-6"><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold tracking-[-.04em]">MVP implementation status</h3><BadgeCheck className="h-5 w-5 text-[#23754a]" /></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Persistent protected tool state", "Deterministic policy outcomes", "Signed capability record", "Independent gateway result", "Hash linked audit chain", "Replayable authority events"].map(item => <div key={item} className="flex items-start gap-3 rounded-xl border border-[#dfe3e8] bg-[#fbfbfa] p-3.5"><span className="mt-0.5 rounded-full bg-[#e6f4eb] p-0.5 text-[#23754a]"><Check className="h-3 w-3" /></span><span className="text-sm font-semibold leading-5">{item}</span></div>)}</div><div className="mt-5 rounded-2xl border border-[#ebd8b8] bg-[#fff7ed] p-4 text-sm leading-6 text-[#704218]"><span className="font-extrabold">In progress:</span> connecting the same authority API to repository documentation, final test evidence, and a recorded judge demonstration.</div><div className="mt-3 rounded-2xl bg-[#fff7ed] p-4 text-sm leading-6 text-[#704218]"><strong>Known limitation:</strong> this is a controlled software MVP. The persistent proof chain demonstrates the enforcement model but does not represent external penetration testing or production certification.</div></div><div className="surface rounded-[26px] p-6"><p className="eyebrow">Evidence metrics</p><div className="mt-5 grid grid-cols-2 gap-3"><MetricLarge value={String(metrics.totalEvents).padStart(2, "0")} label="Persisted events" icon={Database} /><MetricLarge value={String(metrics.blockedEvents).padStart(2, "0")} label="Blocked paths" icon={ShieldCheck} /><MetricLarge value={String(outcomeCounts.allow).padStart(2, "0")} label="Allowed actions" icon={Zap} /><MetricLarge value="06" label="Passing tests" icon={BadgeCheck} /><MetricLarge value="04" label="Proof chain stages" icon={Workflow} /></div><div className="mt-5 border-t border-[#dfe3e8] pt-5"><p className="text-sm font-extrabold">Judge verification checklist</p><div className="mt-3 space-y-2.5">{["The protected tool changes state only after ALLOW.", "Adverse scenarios create no tool side effect.", "Each event contains canonical request and hashes.", "The timeline links every record to previous proof."].map(item => <div key={item} className="flex gap-2.5 text-sm leading-5 text-[#586478]"><ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#23754a]" />{item}</div>)}</div></div></div></div></section>
      </main>
      <footer className="border-t border-black/7 bg-white/60"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-[#657084] md:flex-row md:items-center md:justify-between lg:px-8"><div className="flex items-center gap-2"><img src="/manus-storage/sentra-logo_24a70887.png" className="h-6 w-6 object-contain" alt="" /><span><strong className="text-[#101827]">Sentra Authority OS</strong> · Brand New Day</span></div><p className="mono text-[10px] tracking-wide">RUNTIME AUTHORITY · PERSISTENT PROOF · TOOL ENFORCEMENT</p></div></footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="max-w-3xl"><p className="eyebrow">{eyebrow}</p><h2 className="mt-3 text-4xl font-extrabold leading-[1.04] tracking-[-.06em] text-[#101827] md:text-5xl">{title}</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#657084]">{description}</p></div>; }
function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-[#dfe3e8] bg-white/80 p-3.5"><p className="mono text-[10px] text-[#657084]">{label.toUpperCase()}</p><p className="mt-1.5 text-2xl font-extrabold tracking-[-.06em] text-[#101827]">{value}</p><p className="mt-0.5 text-xs text-[#657084]">{detail}</p></div>; }
function MetricLarge({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Database }) { return <div className="rounded-2xl border border-[#dfe3e8] bg-[#fbfbfa] p-4"><Icon className="h-4 w-4 text-[#8A1538]" /><p className="mt-4 text-3xl font-extrabold tracking-[-.06em]">{value}</p><p className="mt-1 text-xs font-semibold text-[#657084]">{label}</p></div>; }
function OutcomeBadge({ outcome }: { outcome: "ALLOW" | "DENY" | "ESCALATE" | "FREEZE" }) { return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-[.08em] outcome-${outcome}`}><CircleDot className="h-3 w-3" />{outcome}</span>; }
function PathStage({ icon: Icon, title, detail, tone }: { icon: typeof Cpu; title: string; detail: string; tone: "blue" | "brand" }) { return <div className="flex items-center gap-3"><div className={`rounded-2xl p-3 ${tone === "blue" ? "bg-[#ebf4fb] text-[#2e6495]" : "bg-[#f2e9ec] text-[#8A1538]"}`}><Icon className="h-6 w-6" /></div><div><p className="text-sm font-bold">{title}</p><p className="mono mt-1 text-xs text-[#657084]">{detail}</p></div></div>; }
function PathArrow() { return <div className="my-4 flex items-center justify-center gap-3 text-[#8A1538]"><span className="h-px w-12 bg-[#8A1538]/20" /><ArrowDownRight className="h-4 w-4" /><span className="h-px w-12 bg-[#8A1538]/20" /></div>; }
function EmptyFeed() { return <div className="px-5 py-14 text-center"><ServerCog className="mx-auto h-6 w-6 text-[#c1c8d1]" /><p className="mt-3 text-sm font-bold text-[#586478]">No authority decisions yet</p><p className="mt-1 text-xs text-[#8490a0]">Use any demo control to persist the first request and proof record.</p></div>; }
function EvidenceChip({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#f5f6f8] px-2.5 py-2"><p className="mono text-[8px] tracking-[.09em] text-[#7a8595]">{label.toUpperCase()}</p><p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-semibold text-[#475267]">{value}</p></div>; }
function PayloadBlock({ request, capability, label }: { request: Record<string, unknown>; capability?: Record<string, unknown> | null; label: string }) { return <details className="group mt-3 rounded-xl border border-[#dfe3e8] bg-white px-3 py-2.5"><summary className="cursor-pointer list-none text-xs font-extrabold text-[#334055]"><span className="inline-flex items-center gap-2"><Braces className="h-3.5 w-3.5 text-[#8A1538]" />{label}<ChevronRight className="h-3.5 w-3.5 text-[#9ba4b2] transition group-open:rotate-90" /></span></summary><div className="mt-3 grid gap-2 lg:grid-cols-2"><div className="rounded-lg bg-[#101827] p-3"><p className="mono text-[9px] tracking-[.1em] text-white/45">CANONICAL REQUEST</p><pre className="mono mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[10px] leading-5 text-white/85">{JSON.stringify(request, null, 2)}</pre></div><div className="rounded-lg bg-[#f5f6f8] p-3"><p className="mono text-[9px] tracking-[.1em] text-[#657084]">SIGNED CAPABILITY</p><pre className="mono mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[10px] leading-5 text-[#334055]">{JSON.stringify(capability || { issued: false, reason: "No capability was issued for this outcome." }, null, 2)}</pre></div></div></details>; }
function HashCard({ label, value }: { label: string; value?: string | null }) { return <div className="rounded-xl border border-[#dfe3e8] bg-white p-3"><p className="mono text-[9px] tracking-[.1em] text-[#657084]">{label.toUpperCase()}</p><p className="mono mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#334055]">{shortHash(value)}</p></div>; }
function DecisionRow({ event }: { event: any }) { return <div className={`border-l-4 px-5 py-4 scenario-${event.outcome}`}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><OutcomeBadge outcome={event.outcome} /><div><p className="text-sm font-extrabold">{event.scenario}</p><p className="mt-0.5 mono text-[10px] text-[#7a8595]">{event.requestId} · {formatTime(event.createdAt)}</p></div></div><span className="text-xs font-semibold text-[#657084]">{outcomeCopy[event.outcome as keyof typeof outcomeCopy]}</span></div><p className="mt-3 text-xs leading-5 text-[#586478]">{event.executionResult}</p><div className="mt-3 grid gap-2 sm:grid-cols-3"><EvidenceChip label="Canonical request" value={`${event.canonicalRequest.action} · ${event.canonicalRequest.resource.split("/").pop()}`} /><EvidenceChip label="Request hash" value={shortHash(event.requestHash)} /><EvidenceChip label="Capability" value={event.capability ? shortHash(event.capabilityHash) : "not issued"} /></div><p className="mt-3 text-xs font-semibold text-[#334055]">Gateway: <span className="font-normal text-[#657084]">{event.gatewayResult}</span></p><PayloadBlock request={event.canonicalRequest} capability={event.capability} label="Inspect stored request and capability" /></div>; }
function ProofRow({ event, latest }: { event: any; latest: boolean }) { return <div className="relative ml-3 border-l border-[#dfe3e8] pb-6 pl-6 last:pb-0"><span className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-[3px] ${latest ? "border-[#8A1538] bg-white" : "border-[#c8ced6] bg-white"}`} /><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><OutcomeBadge outcome={event.outcome} /><p className="text-sm font-extrabold">{event.scenario}</p></div><span className="mono text-[10px] text-[#7a8595]">{formatTime(event.createdAt)}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-[#f5f6f8] p-3"><p className="mono text-[9px] tracking-[.1em] text-[#657084]">PREVIOUS HASH</p><p className="mono mt-1 text-[10px] text-[#334055]">{shortHash(event.previousHash)}</p></div><div className="rounded-xl bg-[#101827] p-3"><p className="mono text-[9px] tracking-[.1em] text-white/45">RECORD HASH</p><p className="mono mt-1 text-[10px] text-white/85">{shortHash(event.recordHash)}</p></div></div><div className="mt-2 grid gap-2 sm:grid-cols-2"><EvidenceChip label="Request hash" value={shortHash(event.requestHash)} /><EvidenceChip label="Capability hash" value={shortHash(event.capabilityHash)} /><EvidenceChip label="Gateway" value={event.gatewayResult} /><EvidenceChip label="Execution" value={event.executionResult} /></div><p className="mt-3 text-xs leading-5 text-[#657084]">Canonical action: <span className="font-semibold text-[#334055]">{event.canonicalRequest.action}</span> on <span className="font-semibold text-[#334055]">{event.canonicalRequest.resource}</span></p><PayloadBlock request={event.canonicalRequest} capability={event.capability} label="Reveal full persisted proof payload" /></div>; }
