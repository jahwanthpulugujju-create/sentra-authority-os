import { trpc } from "@/lib/trpc";
import {
  ArrowDownRight,
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  CircleDot,
  FileCheck2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const scenarios = [
  { label: "Valid Action", icon: Check, note: "Authorize the scoped vendor approval." },
  { label: "Unauthorized Tool", icon: LockKeyhole, note: "Request a tool that is not in scope." },
  { label: "Prompt Injection", icon: TriangleAlert, note: "Submit untrusted control language." },
  { label: "Changed Request", icon: Braces, note: "Modify the request after approval." },
  { label: "Burst Anomaly", icon: Zap, note: "Cross the request-rate boundary." },
  { label: "Replay Attempt", icon: TimerReset, note: "Reuse a consumed authority token." },
] as const;

const outcomeWords = { ALLOW: "AUTHORIZED", DENY: "REFUSED", ESCALATE: "HELD FOR REVIEW", FREEZE: "CONTAINED" } as const;

function shortHash(value?: string | null) {
  if (!value) return "NOT ISSUED";
  return `${value.slice(0, 9)}…${value.slice(-5)}`.toUpperCase();
}

function outcomeTone(outcome?: "ALLOW" | "DENY" | "ESCALATE" | "FREEZE") {
  return outcome || "DENY";
}

export default function Home() {
  const utils = trpc.useUtils();
  const dashboard = trpc.authority.dashboard.useQuery(undefined, { refetchInterval: 5000 });
  const refreshContext = trpc.authority.refreshContext.useMutation({ onSuccess: () => utils.authority.dashboard.invalidate() });
  const runScenario = trpc.authority.runScenario.useMutation({
    onSuccess: result => {
      utils.authority.dashboard.invalidate();
      toast.success(`${result.event.outcome}: ${result.event.executionResult}`);
    },
    onError: error => toast.error(error.message),
  });

  const [selectedScenario, setSelectedScenario] = useState<(typeof scenarios)[number]["label"]>("Valid Action");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = window.setInterval(() => refreshContext.mutate(), 8500);
    return () => window.clearInterval(interval);
  }, [refreshContext]);

  const resource = dashboard.data?.resource;
  const events = dashboard.data?.events || [];
  const latest = events[0];
  const metrics = dashboard.data?.metrics || { protectedResources: 0, totalEvents: 0, blockedEvents: 0 };
  const selectedCopy = scenarios.find(scenario => scenario.label === selectedScenario) || scenarios[0];
  const resolvedOutcome = latest?.outcome || "DENY";
  const allowCount = useMemo(() => events.filter(event => event.outcome === "ALLOW").length, [events]);

  const chooseAndRun = (scenario: (typeof scenarios)[number]["label"]) => {
    setSelectedScenario(scenario);
    runScenario.mutate({ scenario });
  };

  return (
    <div className="sentra-root">
      <header className="site-nav">
        <a className="brand-lockup" href="#top" aria-label="Sentra Authority OS">
          <img src="/manus-storage/sentra-logo_24a70887.png" alt="Sentra" />
          <span><span className="brand-name">Sentra</span><span className="brand-detail">AUTHORITY OS</span></span>
        </a>
        <nav className="nav-links" aria-label="Page navigation"><a href="#boundary">Boundary</a><a href="#proof">Proof</a><a href="#architecture">System</a><a href="#notes">Notes</a></nav>
        <span className="nav-status"><i />LIVE AUTHORITY</span>
      </header>

      <main id="top">
        <section className="hero paper-texture">
          <div className="hero-grid">
            <div>
              <div className="hero-topline"><span className="kicker">A runtime authority instrument</span><span className="reading-rule" /></div>
              <h1 className="hero-title">A model may <em>propose.</em><br />Sentra decides.</h1>
              <p className="hero-deck">Not another guardrail. Sentra is the narrow authority boundary between an autonomous agent and a protected software action. It makes the permission legible, verifiable, and impossible to quietly widen.</p>
              <div className="hero-actions"><a className="button-ink" href="#boundary">Enter the boundary <ArrowDownRight size={15} /></a><a className="button-quiet" href="#proof">Read the evidence <Fingerprint size={14} /></a></div>
              <div className="hero-meta"><div><strong>{String(metrics.protectedResources).padStart(2, "0")}</strong><span>Protected tools</span></div><div><strong>{String(metrics.totalEvents).padStart(2, "0")}</strong><span>Proof records</span></div><div><strong>{String(metrics.blockedEvents).padStart(2, "0")}</strong><span>Refused paths</span></div></div>
            </div>

            <AuthorityArtifact
              outcome={resolvedOutcome}
              status={latest?.gatewayResult || "AWAITING A FORMAL REQUEST"}
              recordHash={latest?.recordHash}
              tilt={tilt}
              onMove={event => {
                const rect = event.currentTarget.getBoundingClientRect();
                setTilt({ x: ((event.clientY - rect.top) / rect.height - .5) * -13, y: ((event.clientX - rect.left) / rect.width - .5) * 16 });
              }}
              onLeave={() => setTilt({ x: 0, y: 0 })}
            />
          </div>
        </section>

        <div className="marquee" aria-hidden="true"><div className="marquee-track">{Array.from({ length: 2 }, (_, index) => <span key={index}>CANONICAL REQUEST <b>✳</b> DETERMINISTIC POLICY <b>✳</b> SIGNED CAPABILITY <b>✳</b> GATEWAY VERIFICATION <b>✳</b> HASH-LINKED PROOF <b>✳</b></span>)}</div></div>

        <section id="boundary" className="narrative-section">
          <div className="section-head"><span className="section-number">01</span><div><span className="kicker">The authority boundary</span><h2 className="section-title">One agent.<br /><em>Six</em> ways to test its authority.</h2><p className="section-copy">Each scenario is a real server-side decision. The protected workspace state can move only when Sentra returns <strong>ALLOW</strong> with a matching capability. Everything else becomes evidence, not execution.</p></div></div>
          <div className="control-layout">
            <div className="case-list">{scenarios.map((scenario, index) => { const Icon = scenario.icon; return <button key={scenario.label} className={`case-button ${selectedScenario === scenario.label ? "active" : ""}`} type="button" onClick={() => setSelectedScenario(scenario.label)}><span className="case-number">0{index + 1}</span><span><span className="case-name">{scenario.label}</span><span className="case-meta">{scenario.note}</span></span><Icon /></button>; })}</div>
            <DecisionDocket scenario={selectedCopy.label} latest={latest} isPending={runScenario.isPending} onRun={() => chooseAndRun(selectedCopy.label)} />
          </div>
        </section>

        <section id="proof" className="proof-section"><div className="narrative-section"><div className="section-head"><span className="section-number">02</span><div><span className="kicker">Persistent evidence</span><h2 className="section-title">A ledger that <em>remembers</em> every boundary crossed.</h2></div></div><div className="proof-layout"><aside className="proof-intro"><p className="section-copy">Sentra does not only explain what happened. It binds the canonical request, outcome, capability, gateway result, and execution state into a hash-linked record.</p><p className="proof-law">No valid policy decision.<br /><span>No valid capability.</span><br />No protected execution.</p></aside><div className="ledger">{events.length ? events.map((event, index) => <LedgerEntry key={event.eventId} event={event} index={events.length - index} />) : <div className="ledger-entry"><span className="ledger-index">—</span><div><p className="ledger-title">The ledger is waiting for its first request.</p><p className="ledger-sub">Choose a boundary test to create the first persistent proof record.</p></div></div>}</div></div></div></section>

        <section id="architecture" className="narrative-section diagram-section"><div className="section-head"><span className="section-number">03</span><div><span className="kicker">Four deliberate separations</span><h2 className="section-title">Authority is stronger when <em>no single plane</em> owns the whole story.</h2><p className="section-copy">The agent proposes. Independent planes determine the allowed path, enforce it, and preserve its proof.</p></div></div><div className="diagram-board"><div className="diagram-heading"><strong>THE SENTRA SYSTEM</strong><span>REQUEST → PROOF / V1.0</span></div><div className="planes">{[["01", "Control", "Contracts, identity, policy, approval, and revocation."], ["02", "Data", "Canonical request intake and deterministic context."], ["03", "Enforcement", "Capability issuance and independent gateway verification."], ["04", "Evidence", "Hash-linked records, replay review, and proof export."]].map(([number, title, copy]) => <div className="plane" key={title}><span className="plane-no">{number}</span><h3>{title}</h3><p>{copy}</p></div>)}</div><div className="flow-ribbon"><div><CpuMark /> Agent request</div><ArrowRight /><div><Braces size={12} /> Canonical request</div><ArrowRight /><div><ScanLine size={12} /> Policy decision</div><ArrowRight /><div><KeyRound size={12} /> Capability</div><ArrowRight /><div><ShieldCheck size={12} /> Verify</div><ArrowRight /><div><FileCheck2 size={12} /> Execute</div><ArrowRight /><div><Fingerprint size={12} /> Proof</div></div></div></section>

        <section id="notes" className="narrative-section field-notes"><div className="section-head"><span className="section-number">04</span><div><span className="kicker">Round 2 field notes</span><h2 className="section-title">Built to be inspected,<br />not merely <em>described.</em></h2></div></div><div className="notes-grid"><div className="note-panel"><span className="kicker">MVP STATUS / LIVE</span><h3>What a judge can verify.</h3>{["A valid request is the only path that changes protected state.", "Every adverse path produces no protected tool side effect.", "The capability is bound to the exact canonical request hash.", "Every record links backwards through the proof chain."].map(item => <div className="milestone" key={item}><span className="tick">✓</span><p>{item}</p></div>)}<p className="field-note">This is a controlled software MVP. It demonstrates the authority model and its replayable records; it does not claim production certification or external penetration testing.</p></div><div className="note-panel"><span className="kicker">CURRENT READING</span><div className="metric-stack"><MetricCard value={String(metrics.totalEvents).padStart(2, "0")} label="Proof records" /><MetricCard value={String(metrics.blockedEvents).padStart(2, "0")} label="Refused paths" /><MetricCard value={String(allowCount).padStart(2, "0")} label="Allowed actions" /><MetricCard value="06" label="Passing tests" /></div><p className="field-note">The demo remains software-only: no hardware, IoT, or external device is required for the judge to inspect the full authority chain.</p></div></div></section>
      </main>

      <footer className="site-footer"><span className="footer-mark">Sentra</span><p>THE MODEL CAN CHANGE ITS REASONING. IT CANNOT CHANGE ITS AUTHORITY.</p><p>BRAND NEW DAY / 2026</p></footer>
    </div>
  );
}

function AuthorityArtifact({ outcome, status, recordHash, tilt, onMove, onLeave }: { outcome: "ALLOW" | "DENY" | "ESCALATE" | "FREEZE"; status: string; recordHash?: string | null; tilt: { x: number; y: number }; onMove: React.MouseEventHandler<HTMLDivElement>; onLeave: React.MouseEventHandler<HTMLDivElement> }) {
  return <div className="artifact-wrap" onMouseMove={onMove} onMouseLeave={onLeave}><div className="artifact-caption"><span className="kicker">Live authority artifact</span><p>Move across the capability seal. Its depth responds to the same current authority state held by the server.</p></div><div className="artifact-scene"><div className="artifact-orbit" /><div className="capability-object" style={{ transform: `translate(-50%, -50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}><div className="seal-face seal-front"><div className="seal-mark"><ShieldCheck /></div><span className="seal-state">{outcomeWords[outcome]}</span><span className="seal-code">CAPABILITY / {shortHash(recordHash)}</span></div><div className="seal-face seal-back"><div className="seal-mark"><Fingerprint /></div><span className="seal-state">PROOF LINKED</span><span className="seal-code">PREVIOUS → CURRENT</span></div></div><div className="artifact-slip artifact-slip-one"><small>GATEWAY VERDICT</small><strong>{outcome}</strong><span className={`stamp ${outcome.toLowerCase()}`}>{outcomeWords[outcome]}</span></div><div className="artifact-slip artifact-slip-two"><small>RUNTIME NOTE</small><strong>{status.slice(0, 44)}</strong><span className="stamp">SERVER PERSISTED</span></div></div><div className="artifact-foot"><span>INTERACTIVE CAPABILITY SEAL</span><span>POINTER DEPTH ENABLED</span></div></div>;
}

function DecisionDocket({ scenario, latest, isPending, onRun }: { scenario: string; latest?: any; isPending: boolean; onRun: () => void }) {
  const outcome = latest?.outcome || "DENY";
  const request = latest?.canonicalRequest;
  return <div className="decision-table"><div className="decision-top"><div><p className="kicker">Authority docket</p><p className="decision-ref">SCENARIO / {scenario.toUpperCase()}</p></div><span className={`outcome-stamp outcome-${outcome}`}>{outcomeWords[outcome as keyof typeof outcomeWords]}</span></div><div className="decision-grid"><DocketCell label="Requested tool" value={request?.tool || "workspace.vendor.approve"} mono /><DocketCell label="Scoped resource" value={request?.resource || "vendor-intake/contoso"} mono /><DocketCell label="Authority outcome" value={outcome} /><DocketCell label="Capability binding" value={shortHash(latest?.capabilityHash)} mono /><DocketCell label="Gateway observation" value={latest?.gatewayResult || "WAITING FOR REQUEST"} /><DocketCell label="Execution result" value={latest?.executionResult || "NO SIDE EFFECT"} /></div><p className="decision-note">{latest ? "The current docket reads from the persistent authority event table. Expand the ledger below to inspect the full request and capability payload." : "Select a case file, then execute it. Sentra will create the first canonical request and proof record."}</p><button className="run-trigger" type="button" disabled={isPending} onClick={onRun}>{isPending ? "EVALUATING…" : `Run ${scenario}`} <ArrowRight size={14} /></button></div>;
}

function DocketCell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="decision-cell"><label>{label}</label>{mono ? <span className="mono">{value}</span> : <strong>{value}</strong>}</div>; }
function LedgerEntry({ event, index }: { event: any; index: number }) { return <details className="ledger-entry"><span className="ledger-index">{String(index).padStart(2, "0")}</span><div><summary><div><p className="ledger-title">{event.scenario} <span className={`outcome-stamp outcome-${event.outcome}`} style={{ marginLeft: 8 }}>{event.outcome}</span></p><p className="ledger-sub">{event.executionResult}</p></div><ChevronRight className="ledger-chevron" size={16} /></summary><div className="payload-grid"><Payload title="Canonical request" value={event.canonicalRequest} /><Payload title="Signed capability" value={event.capability || { issued: false, reason: "No authority was issued." }} /><Payload title="Hash link" value={{ previous: event.previousHash, current: event.recordHash, request: event.requestHash }} /><Payload title="Gateway and execution" value={{ gateway: event.gatewayResult, execution: event.executionResult }} /></div></div></details>; }
function Payload({ title, value }: { title: string; value: unknown }) { return <div className="payload-block"><b>{title.toUpperCase()}</b><pre>{JSON.stringify(value, null, 2)}</pre></div>; }
function MetricCard({ value, label }: { value: string; label: string }) { return <div className="metric-card"><strong>{value}</strong><span>{label}</span></div>; }
function CpuMark() { return <span className="mono" style={{ color: "var(--vermilion)", fontSize: 10 }}>01</span>; }
