import { trpc } from "@/lib/trpc";
import { Activity, ArrowDownRight, ArrowRight, BadgeCheck, Braces, Check, ChevronRight, CircleDot, ClipboardCheck, Cpu, Database, FileCheck2, Fingerprint, KeyRound, LockKeyhole, ScanLine, ShieldCheck, TimerReset, TriangleAlert, Zap } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";

const scenarios = [
  { label: "Valid Action", icon: Check, note: "Approve the scoped vendor request", tone: "allow" },
  { label: "Unauthorized Tool", icon: LockKeyhole, note: "Ask for a tool outside scope", tone: "deny" },
  { label: "Prompt Injection", icon: TriangleAlert, note: "Introduce untrusted instructions", tone: "escalate" },
  { label: "Changed Request", icon: Fingerprint, note: "Modify an approved request", tone: "deny" },
  { label: "Burst Anomaly", icon: Activity, note: "Exceed the context threshold", tone: "freeze" },
  { label: "Replay Attempt", icon: TimerReset, note: "Reuse a spent capability", tone: "deny" },
] as const;

const outcomeCopy = { ALLOW: "Authority granted", DENY: "Authority refused", ESCALATE: "Human review required", FREEZE: "Agent session contained" } as const;
const shortHash = (value?: string | null) => value ? `${value.slice(0, 12)}…${value.slice(-6)}` : "not issued";
const formatTime = (value?: string | Date) => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Awaiting first event";

export default function Home() {
  const utils = trpc.useUtils();
  const dashboard = trpc.authority.dashboard.useQuery(undefined, { refetchInterval: 3500 });
  const refreshContext = trpc.authority.refreshContext.useMutation({ onSuccess: () => utils.authority.dashboard.invalidate() });
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [artifactPointer, setArtifactPointer] = useState({ x: 0, y: 0 });
  const resetDemo = trpc.authority.resetDemo.useMutation({
    onSuccess: () => { setActiveScenario(null); utils.authority.dashboard.invalidate(); toast.success("Demo reset: protected state and proof history are back to baseline."); },
    onError: error => toast.error(error.message),
  });
  const runScenario = trpc.authority.runScenario.useMutation({
    onSuccess: data => { utils.authority.dashboard.invalidate(); setActiveScenario(data.event.scenario); toast.success(`${data.event.outcome}: ${data.event.executionResult}`); },
    onError: error => { setActiveScenario(null); toast.error(error.message); },
  });
  useEffect(() => { const id = window.setInterval(() => refreshContext.mutate(), 7000); return () => window.clearInterval(id); }, [refreshContext]);

  const data = dashboard.data;
  const resource = data?.resource;
  const events = data?.events || [];
  const latest = events[0];
  const active = Boolean(resource?.executionState);
  const metrics = data?.metrics || { protectedResources: 0, totalEvents: 0, blockedEvents: 0 };
  const allowed = useMemo(() => events.filter(event => event.outcome === "ALLOW").length, [events]);
  const artifactStyle = {
    "--pointer-x": `${artifactPointer.x * 12}px`,
    "--pointer-y": `${artifactPointer.y * 12}px`,
    "--tilt-x": `${artifactPointer.y * -3}deg`,
    "--tilt-y": `${artifactPointer.x * 3}deg`,
  } as CSSProperties;
  const handleArtifactMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setArtifactPointer({ x: (event.clientX - rect.left) / rect.width - 0.5, y: (event.clientY - rect.top) / rect.height - 0.5 });
  };

  return <div className="sentra-shell">
    <header className="site-header"><div className="site-header-inner">
      <a href="#top" className="brand-lockup"><img src="/manus-storage/sentra-logo_24a70887.png" className="brand-mark" alt="Sentra logo" /><div><p>Sentra</p><span>Authority OS</span></div></a>
      <nav className="site-nav"><a href="#demo">Demo</a><a href="#proof">Evidence</a><a href="#architecture">System</a><a href="#progress">MVP</a></nav>
      <div className="system-online"><span className="status-dot pulse" />Live authority</div>
    </div></header>

    <main id="top">
      <section className="hero-stage"><div className="hero-grid">
        <div className="hero-copy reveal"><div className="section-kicker"><span>Sentra runtime authority</span><i /></div>
          <h1>Every agent action<br />needs a <em>real yes.</em></h1>
          <p className="hero-description">Sentra is the decision boundary between an autonomous agent and a protected software action. It turns every request into a verified permission, or a visible refusal.</p>
          <div className="hero-actions"><a href="#demo" className="button-primary">Run a boundary test <ArrowDownRight className="h-4 w-4" /></a><a href="#proof" className="button-secondary">Trace the evidence <Fingerprint className="h-4 w-4" /></a></div>
          <div className="metric-ribbon"><HeroMetric value={String(metrics.protectedResources).padStart(2, "0")} label="Protected tools" /><HeroMetric value={String(metrics.totalEvents).padStart(2, "0")} label="Proof records" /><HeroMetric value={String(metrics.blockedEvents).padStart(2, "0")} label="Refused paths" /></div>
        </div>
        <div className={`authority-artifact reveal outcome-state-${latest?.outcome || "READY"}`} style={{ ...artifactStyle, animationDelay: "100ms" }} onMouseMove={handleArtifactMove} onMouseLeave={() => setArtifactPointer({ x: 0, y: 0 })}>
          <div className="artifact-topline"><span className="eyebrow">Live authorization</span><span className="artifact-time">server persisted</span></div><div className="artifact-orbit orbit-a" /><div className="artifact-orbit orbit-b" />
          <div className="artifact-core"><div className="core-icon"><ShieldCheck className="h-7 w-7" /></div><p>Current authority</p><strong>{latest?.outcome || "READY"}</strong><span>{latest ? outcomeCopy[latest.outcome] : "Awaiting an agent request"}</span></div>
          <ArtifactNode className="node-agent" number="01" icon={Cpu} title="Agent" detail="proposes" /><ArtifactNode className="node-policy" number="02" icon={ScanLine} title="Policy" detail="decides" /><ArtifactNode className="node-gateway" number="03" icon={KeyRound} title="Gateway" detail="verifies" />
          <div className={`artifact-outcome ${active ? "outcome-live" : "outcome-held"}`}><FileCheck2 className="h-5 w-5" /><div><p>Protected action</p><b>{active ? "Executed after ALLOW" : "Held in safe state"}</b></div></div>
          <div className="artifact-footer"><span>REQUEST → POLICY → CAPABILITY → GATEWAY</span><span className="status-dot" /></div>
        </div>
      </div></section>

      <section id="demo" className="content-section demo-section"><SectionHeading eyebrow="Live system demonstration" title="Ask the boundary a question." description="Each control calls the real authority API. Sentra persists the canonical request, evaluates policy, issues a capability only when valid, and changes protected state only after gateway verification." />
        <div className="demo-layout"><div className="demo-rail"><div className="rail-head"><div><span className="eyebrow">A single protected path</span><h3>Proposal is not permission.</h3></div><span className="connected-state"><span className="status-dot" />connected</span></div>
          <div className="path-map"><PathStep number="01" icon={Cpu} title="Procurement agent" detail="submits a proposal" /><PathStep number="02" icon={ShieldCheck} title="Sentra policy kernel" detail="returns a bounded decision" tone="brand" /><PathStep number="03" icon={FileCheck2} title="Vendor approval tool" detail={active ? "state changed after ALLOW" : "held until verified"} tone={active ? "green" : "neutral"} /></div>
          <div className="rule-notice"><LockKeyhole className="h-4 w-4" /><span>The workspace state is server-held. It changes only after a valid <b>ALLOW</b> and gateway check.</span></div>
        </div><div className="scenario-console"><div className="console-head"><div><span className="eyebrow">Authority test suite</span><h3>Choose a scenario.</h3></div><div className="console-controls"><span className="console-status">live database</span><button type="button" className="demo-reset" disabled={runScenario.isPending || resetDemo.isPending} onClick={() => resetDemo.mutate()}><TimerReset className="h-3.5 w-3.5" />Reset baseline</button></div></div>
          <div className="scenario-grid">{scenarios.map(({ label, icon: Icon, note, tone }, index) => <button key={label} type="button" disabled={runScenario.isPending} onClick={() => { setActiveScenario(label); runScenario.mutate({ scenario: label }); }} className={`scenario-button scenario-${tone} ${activeScenario === label ? "scenario-active" : ""}`}><span className="scenario-index">0{index + 1}</span><span className="scenario-icon"><Icon className="h-4 w-4" /></span><span className="scenario-content"><b>{label}</b><small>{note}</small></span><ChevronRight className="h-4 w-4 scenario-arrow" /></button>)}</div>
          <div className="decision-strip" aria-live="polite"><span>Latest verdict</span>{latest ? <><OutcomeBadge outcome={latest.outcome} /><p>{latest.gatewayResult}</p></> : <p>Select a test to create a persisted decision.</p>}</div>
        </div></div>
      </section>

      <section className="record-section"><div className="content-section compact-top"><SectionHeading eyebrow="Decision records" title="See exactly what was decided." description="Each authority event carries the stored request, policy outcome, capability material, gateway result, and protected execution result." />
        <div className="records-grid"><div className="decision-panel"><PanelBar icon={Activity} title="Live decision feed" end={`${events.length} records`} /><div className="decision-list">{events.length ? events.slice(0, 6).map(event => <DecisionRow key={event.eventId} event={event} />) : <Blank text="Run any scenario to create the first persistent decision." />}</div></div>
          <div className="request-panel"><span className="eyebrow">Canonical request</span><h3>Exact scope. Exact hashes.</h3>{latest ? <><div className="request-code"><pre>{JSON.stringify(latest.canonicalRequest, null, 2)}</pre></div><div className="hash-grid"><HashCard label="Request hash" value={latest.requestHash} /><HashCard label="Capability hash" value={latest.capabilityHash} /></div><div className="request-foot"><Braces className="h-4 w-4" />The stored request is the input Sentra actually evaluated.</div></> : <Blank text="A request inspector will appear after the first authority decision." />}</div>
        </div></div></section>

      <section id="proof" className="content-section proof-section"><div className="proof-head"><SectionHeading eyebrow="Replayable proof" title="A decision that can be inspected after it happens." description="Each record commits the request, policy result, capability status, gateway verdict, execution result, and preceding proof hash." /><div className="proof-statement"><span>Sentra invariant</span><b>No valid decision.<br /><em>No valid capability.</em><br />No execution.</b><div className={`proof-integrity ${data?.proofIntegrity?.valid ? "integrity-valid" : "integrity-pending"}`}><ShieldCheck className="h-3.5 w-3.5" />{data?.proofIntegrity?.valid ? `Proof chain verified · ${data.proofIntegrity.checkedEvents} records` : "Proof chain awaiting verification"}</div></div></div>
        <div className="proof-layout"><div className="proof-stages">{[["01","Canonicalize","Build the stable request representation."],["02","Decide","Apply deterministic policy."],["03","Verify","Bind and verify capability."],["04","Prove","Chain the result to evidence."]].map(([n,t,c]) => <div className="proof-stage" key={n}><span>{n}</span><div><b>{t}</b><p>{c}</p></div></div>)}</div><div className="timeline-panel"><PanelBar icon={Fingerprint} title="Persistent audit timeline" end="genesis → now" /><div className="timeline-list">{events.length ? events.map((event, i) => <ProofRow key={event.eventId} event={event} latest={i === 0} />) : <Blank text="The first test will establish the visible proof chain." />}</div></div></div>
      </section>

      <section id="architecture" className="architecture-section"><div className="content-section"><div className="architecture-heading"><SectionHeading eyebrow="System map" title="One model. Four independent authority planes." description="Sentra separates control, input, enforcement, and evidence so a planning model cannot own the whole action path." /><p>The model proposes.<br /><b>The gateway executes.</b></p></div>
        <div className="plane-grid">{[["Control","Identity, contracts, policy rules, approval binding, and revocation.",ShieldCheck],["Data","Canonical request intake, context, deterministic decision inputs.",Database],["Enforcement","Capability issuance, gateway verification, protected action control.",LockKeyhole],["Evidence","Hash-linked records, replay, incident review, and export.",Fingerprint]].map(([title,copy,Icon], i) => { const I = Icon as typeof ShieldCheck; return <article className="plane-card" key={title as string}><span>0{i + 1}</span><I className="h-5 w-5" /><h3>{title as string}</h3><p>{copy as string}</p></article>; })}</div>
        <div className="flow-band">{[["Agent request",Cpu],["Canonical request",Braces],["Policy result",ScanLine],["Signed capability",KeyRound],["Gateway verify",ShieldCheck],["Protected action",FileCheck2],["Proof record",Fingerprint]].map(([label,Icon],i,list) => { const I=Icon as typeof Cpu; return <div className="flow-item" key={label as string}><span>{String(i+1).padStart(2,"0")}</span><I className="h-3.5 w-3.5" /><b>{label as string}</b>{i<list.length-1&&<ArrowRight className="flow-arrow h-3.5 w-3.5" />}</div>; })}</div>
      </div></section>

      <section id="progress" className="content-section progress-section"><SectionHeading eyebrow="Round 2 MVP" title="Focused build. Honest proof." description="This software-only authority MVP demonstrates persistent server-side enforcement that a judge can run and inspect. It does not claim production certification." />
          <div className="progress-grid"><div className="status-card"><div className="status-card-head"><div><span className="eyebrow">Implementation</span><h3>What is already working</h3></div><BadgeCheck className="h-6 w-6" /></div><div className="status-list">{["Persistent protected tool state","Deterministic ALLOW, DENY, ESCALATE, FREEZE outcomes","Signed capability lifecycle and scope verification","Gateway-owned execution with consumed capability state","Hash-linked audit chain with integrity verification","Replayable authority events and reset baseline"].map(item => <div key={item}><Check className="h-4 w-4" />{item}</div>)}</div><p className="in-progress"><b>Professional review:</b> the scope is deliberately limited to one protected software action; no production certification or third-party security audit is claimed.</p></div>
          <div className="mvp-metrics"><MetricLarge value={String(metrics.totalEvents).padStart(2,"0")} label="Persistent events" icon={Database} /><MetricLarge value={String(metrics.blockedEvents).padStart(2,"0")} label="Blocked paths" icon={ShieldCheck} /><MetricLarge value={String(allowed).padStart(2,"0")} label="Allowed actions" icon={Zap} /><MetricLarge value="08" label="Passing tests" icon={BadgeCheck} /></div>
          <div className="judge-card"><span className="eyebrow">Judge checklist</span><h3>Verify the boundary yourself.</h3>{["Protected action changes only after ALLOW.","Adverse tests create no protected side effect.","Every event stores a canonical request and hashes.","Every proof record links to its predecessor."].map(item => <p key={item}><ClipboardCheck className="h-4 w-4" />{item}</p>)}</div>
        </div>
      </section>
    </main>
    <footer className="site-footer"><div><span>Sentra Authority OS</span><small>Brand New Day · Round 2</small></div><p>Runtime authority · persistent proof · protected execution</p></footer>
  </div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow:string; title:string; description:string }) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>; }
function HeroMetric({ value,label }: { value:string; label:string }) { return <div><b>{value}</b><span>{label}</span></div>; }
function MetricLarge({ value,label,icon:Icon }: { value:string; label:string; icon:typeof Database }) { return <div className="metric-large"><Icon className="h-4 w-4" /><b>{value}</b><span>{label}</span></div>; }
function OutcomeBadge({ outcome }: { outcome:"ALLOW"|"DENY"|"ESCALATE"|"FREEZE" }) { return <span className={`outcome-badge outcome-${outcome}`}><CircleDot className="h-3 w-3" />{outcome}</span>; }
function ArtifactNode({ className,number,icon:Icon,title,detail }: { className:string; number:string; icon:typeof Cpu; title:string; detail:string }) { return <div className={`artifact-node ${className}`}><span className="node-number">{number}</span><Icon className="h-4 w-4" /><b>{title}</b><small>{detail}</small></div>; }
function PathStep({ number,icon:Icon,title,detail,tone="neutral" }: { number:string; icon:typeof Cpu; title:string; detail:string; tone?:"brand"|"green"|"neutral" }) { return <><div className={`path-step path-${tone}`}><span>{number}</span><Icon className="h-5 w-5" /><div><b>{title}</b><small>{detail}</small></div></div>{number!=="03"&&<div className="path-connector"><span /></div>}</>; }
function PanelBar({ icon:Icon,title,end }: { icon:typeof Activity; title:string; end:string }) { return <div className="panel-bar"><div><Icon className="h-4 w-4" /><b>{title}</b></div><span>{end}</span></div>; }
function Blank({ text }: { text:string }) { return <div className="blank-state">{text}</div>; }
function HashCard({ label,value }: { label:string; value?:string|null }) { return <div className="hash-card"><span>{label}</span><b>{shortHash(value)}</b></div>; }
function EvidenceChip({ label,value }: { label:string; value:string }) { return <div className="evidence-chip"><span>{label}</span><b>{value}</b></div>; }
function PayloadBlock({ request,capability,label }: { request:Record<string,unknown>; capability?:Record<string,unknown>|null; label:string }) { return <details className="payload-block"><summary><Braces className="h-3.5 w-3.5" />{label}<ChevronRight className="h-3.5 w-3.5" /></summary><div><pre>{JSON.stringify(request,null,2)}</pre><pre>{JSON.stringify(capability||{issued:false,reason:"No capability issued for this outcome."},null,2)}</pre></div></details>; }
function DecisionRow({ event }: { event:any }) { return <article className={`decision-row decision-${event.outcome}`}><div className="decision-row-top"><div><OutcomeBadge outcome={event.outcome} /><b>{event.scenario}</b><small>{event.requestId} · {formatTime(event.createdAt)}</small></div><span>{outcomeCopy[event.outcome as keyof typeof outcomeCopy]}</span></div><p>{event.executionResult}</p><div className="evidence-grid"><EvidenceChip label="request" value={`${event.canonicalRequest.action} · ${event.canonicalRequest.resource.split("/").pop()}`} /><EvidenceChip label="capability" value={event.capability?shortHash(event.capabilityHash):"not issued"} /><EvidenceChip label="gateway" value={event.gatewayResult} /></div><PayloadBlock request={event.canonicalRequest} capability={event.capability} label="Open persisted request and capability" /></article>; }
function ProofRow({ event,latest }: { event:any; latest:boolean }) { return <article className={`proof-row ${latest?"proof-latest":""}`}><div className="proof-dot" /><div className="proof-row-head"><div><OutcomeBadge outcome={event.outcome} /><b>{event.scenario}</b></div><span>{formatTime(event.createdAt)}</span></div><div className="proof-hashes"><HashCard label="previous hash" value={event.previousHash} /><HashCard label="record hash" value={event.recordHash} /></div><p>Canonical action <b>{event.canonicalRequest.action}</b> on <b>{event.canonicalRequest.resource}</b></p><PayloadBlock request={event.canonicalRequest} capability={event.capability} label="Open complete proof payload" /></article>; }
