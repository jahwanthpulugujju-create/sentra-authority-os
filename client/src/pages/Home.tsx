import { trpc } from "@/lib/trpc";
import { isTransientNetworkError } from "@/lib/apiReliability";
import { clearDashboardSnapshot, readDashboardSnapshot, writeDashboardSnapshot, type DashboardSnapshot } from "@/lib/dashboardCache";
import { formatGuidedDemoDuration, getUndispatchedGuidedScenario, guidedDemoSteps } from "@/lib/guidedDemo";
import { Activity, ArrowDownRight, ArrowRight, BadgeCheck, Braces, Check, ChevronRight, CircleDot, ClipboardCheck, Clock3, Cpu, Database, FileCheck2, Fingerprint, KeyRound, ListVideo, LockKeyhole, Pause, Play, RefreshCw, RotateCcw, ScanLine, ShieldCheck, SkipForward, Sparkles, TimerReset, TriangleAlert, WifiOff, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
const formatRefreshTime = (value?: number) => value ? new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "No live dashboard saved";
type ScenarioName = (typeof scenarios)[number]["label"];
type ScenarioAttempt = { scenario: ScenarioName; idempotencyKey: string };
type GuidedDemoStatus = "idle" | "running" | "paused" | "complete";

function createScenarioAttempt(scenario: ScenarioName): ScenarioAttempt {
  const idempotencyKey = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  return { scenario, idempotencyKey };
}

function useBrowserOnline() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  useEffect(() => {
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);
  return online;
}

export default function Home() {
  const utils = trpc.useUtils();
  const dashboard = trpc.authority.dashboard.useQuery(undefined, { refetchInterval: 3500, placeholderData: previousData => previousData });
  const storage = typeof localStorage === "undefined" ? undefined : localStorage;
  const [offlineSnapshot, setOfflineSnapshot] = useState<DashboardSnapshot<NonNullable<typeof dashboard.data>> | undefined>(() => readDashboardSnapshot<NonNullable<typeof dashboard.data>>(storage));
  const [lastLiveRefreshAt, setLastLiveRefreshAt] = useState<number | undefined>(() => offlineSnapshot?.savedAt);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [lastFailedScenario, setLastFailedScenario] = useState<ScenarioAttempt | null>(null);
  const [artifactPointer, setArtifactPointer] = useState({ x: 0, y: 0 });
  const [guidedDemoStatus, setGuidedDemoStatus] = useState<GuidedDemoStatus>("idle");
  const [guidedDemoIndex, setGuidedDemoIndex] = useState(0);
  const [guidedPrompt, setGuidedPrompt] = useState("Approve Contoso as a scoped vendor — then show me why every unsafe shortcut is refused.");
  const browserOnline = useBrowserOnline();
  const reconnectAfterRef = useRef<number | null>(null);
  const guidedExecutedStepsRef = useRef(new Set<number>());
  useEffect(() => {
    if (!dashboard.data) return;
    const savedAt = dashboard.dataUpdatedAt || Date.now();
    setOfflineSnapshot(writeDashboardSnapshot(dashboard.data, savedAt, storage));
    setLastLiveRefreshAt(savedAt);
  }, [dashboard.data, dashboard.dataUpdatedAt, storage]);
  const resetDemo = trpc.authority.resetDemo.useMutation({
    onSuccess: () => { setActiveScenario(null); utils.authority.dashboard.invalidate(); toast.success("Demo reset: protected state and proof history are back to baseline."); },
    onError: error => toast.error(isTransientNetworkError(error) ? "Connection interrupted. Reset was not confirmed; wait for Sentra to reconnect." : error.message),
  });
  const runScenario = trpc.authority.runScenario.useMutation({
    onSuccess: data => { setLastFailedScenario(null); utils.authority.dashboard.invalidate(); setActiveScenario(data.event.scenario); toast.success(`${data.event.outcome}: ${data.event.executionResult}`); },
    onError: (error, variables) => { setActiveScenario(null); if (isTransientNetworkError(error) && variables.idempotencyKey) { setLastFailedScenario({ scenario: variables.scenario, idempotencyKey: variables.idempotencyKey }); toast.error("Connection interrupted. Retry will reuse the same request key and cannot create a second authority event."); return; } setLastFailedScenario(null); toast.error(error.message); },
  });

  const apiUnavailable = !browserOnline || dashboard.isError;
  useEffect(() => {
    if (apiUnavailable) {
      reconnectAfterRef.current ??= dashboard.dataUpdatedAt || Date.now();
      return;
    }
    if (reconnectAfterRef.current !== null && dashboard.isSuccess && dashboard.dataUpdatedAt > reconnectAfterRef.current) {
      toast.success("Sentra reconnected. Live authority data is current again.");
      reconnectAfterRef.current = null;
    }
  }, [apiUnavailable, dashboard.dataUpdatedAt, dashboard.isSuccess]);

  const data = dashboard.data ?? offlineSnapshot?.data;
  const usingOfflineData = apiUnavailable && Boolean(data);
  const cachedDashboardAvailable = Boolean(offlineSnapshot);
  const apiReady = Boolean(data) && !apiUnavailable;
  const connectionLabel = usingOfflineData ? "offline view" : apiUnavailable ? "reconnecting" : dashboard.isFetching && !data ? "connecting" : "connected";
  const freshnessLabel = formatRefreshTime(lastLiveRefreshAt);
  const clearOfflineCache = () => {
    clearDashboardSnapshot(storage);
    setOfflineSnapshot(undefined);
    if (!dashboard.data) setLastLiveRefreshAt(undefined);
    toast.success("Saved offline dashboard data cleared.");
  };
  const guidedStep = guidedDemoSteps[guidedDemoIndex];
  const beginGuidedDemo = async () => {
    if (!apiReady || resetDemo.isPending || runScenario.isPending) {
      toast.error("The guided walkthrough needs a live authority connection before it can begin.");
      return;
    }
    setGuidedDemoStatus("paused");
    setGuidedDemoIndex(0);
    guidedExecutedStepsRef.current.clear();
    setLastFailedScenario(null);
    await resetDemo.mutateAsync();
    setGuidedDemoStatus("running");
    toast.success("Judge walkthrough started. Sentra will progress through its real scenario suite.");
  };
  const skipGuidedStep = () => {
    if (guidedDemoStatus === "idle" || guidedDemoStatus === "complete") return;
    if (guidedDemoIndex >= guidedDemoSteps.length - 1) { setGuidedDemoStatus("complete"); return; }
    setGuidedDemoIndex(index => index + 1);
  };
  const resetGuidedDemo = () => {
    setGuidedDemoStatus("idle");
    setGuidedDemoIndex(0);
  };
  useEffect(() => {
    if (guidedDemoStatus !== "running") return;
    const step = guidedDemoSteps[guidedDemoIndex];
    const undispatchedScenario = getUndispatchedGuidedScenario(guidedDemoIndex, guidedExecutedStepsRef.current);
    if (undispatchedScenario) {
      guidedExecutedStepsRef.current.add(guidedDemoIndex);
      setActiveScenario(undispatchedScenario);
      void runScenario.mutateAsync(createScenarioAttempt(undispatchedScenario)).catch(() => {
        guidedExecutedStepsRef.current.delete(guidedDemoIndex);
        setGuidedDemoStatus("paused");
      });
    }
    const timer = window.setTimeout(() => {
      if (guidedDemoIndex >= guidedDemoSteps.length - 1) setGuidedDemoStatus("complete");
      else setGuidedDemoIndex(index => index + 1);
    }, step.durationMs);
    return () => window.clearTimeout(timer);
  }, [guidedDemoStatus, guidedDemoIndex]);
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
      <div className={`system-online ${apiUnavailable ? "system-recovering" : ""}`}><span className="status-dot pulse" />{usingOfflineData ? "Offline view" : apiUnavailable ? "Reconnecting" : "Live authority"}</div>
    </div></header>
    {apiUnavailable ? <aside className="offline-banner" role="status"><div><WifiOff className="h-4 w-4" /><span><b>{usingOfflineData ? "Offline view active." : "Offline with no saved dashboard."}</b> {usingOfflineData ? `Evidence may be stale; last live refresh ${freshnessLabel}.` : "Reconnect to load authority evidence."}</span></div>{cachedDashboardAvailable ? <button type="button" onClick={clearOfflineCache}><X className="h-3.5 w-3.5" />Clear cache</button> : null}</aside> : null}

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
        <GuidedDemoPanel prompt={guidedPrompt} onPromptChange={setGuidedPrompt} status={guidedDemoStatus} stepIndex={guidedDemoIndex} step={guidedStep} canStart={apiReady && !resetDemo.isPending && !runScenario.isPending} isBusy={resetDemo.isPending || runScenario.isPending} onStart={() => void beginGuidedDemo()} onPause={() => setGuidedDemoStatus("paused")} onResume={() => setGuidedDemoStatus("running")} onSkip={skipGuidedStep} onReset={resetGuidedDemo} />
        <div className="demo-layout"><div className="demo-rail"><div className="rail-head"><div><span className="eyebrow">A single protected path</span><h3>Proposal is not permission.</h3></div><span className={`connected-state ${apiUnavailable ? "connection-offline" : ""}`}><span className="status-dot" />{connectionLabel}</span></div>
          <div className="path-map"><PathStep number="01" icon={Cpu} title="Procurement agent" detail="submits a proposal" /><PathStep number="02" icon={ShieldCheck} title="Sentra policy kernel" detail="returns a bounded decision" tone="brand" /><PathStep number="03" icon={FileCheck2} title="Vendor approval tool" detail={active ? "state changed after ALLOW" : "held until verified"} tone={active ? "green" : "neutral"} /></div>
          <div className="rule-notice"><LockKeyhole className="h-4 w-4" /><span>The workspace state is server-held. It changes only after a valid <b>ALLOW</b> and gateway check.</span></div>
        </div><div className="scenario-console"><div className="console-head"><div><span className="eyebrow">Authority test suite</span><h3>Choose a scenario.</h3></div><div className="console-controls"><span className={`console-status ${apiUnavailable ? "status-offline" : ""}`}>{usingOfflineData ? "offline cache" : apiUnavailable ? "reconnecting" : "live database"}</span><span className="dashboard-freshness"><Clock3 className="h-3.5 w-3.5" />Last refreshed {freshnessLabel}</span><button type="button" className="demo-reset" disabled={runScenario.isPending || resetDemo.isPending || !apiReady} onClick={() => resetDemo.mutate()}><TimerReset className="h-3.5 w-3.5" />Reset baseline</button>{cachedDashboardAvailable ? <button type="button" className="cache-clear" onClick={clearOfflineCache}><X className="h-3.5 w-3.5" />Clear cache</button> : null}{lastFailedScenario ? <button type="button" className="scenario-retry" disabled={runScenario.isPending || !apiReady} onClick={() => { setActiveScenario(lastFailedScenario.scenario); runScenario.mutate(lastFailedScenario); }}><RefreshCw className="h-3.5 w-3.5" />Retry {lastFailedScenario.scenario}</button> : null}</div></div>
          {apiUnavailable ? <div className="offline-notice" role="status"><WifiOff className="h-4 w-4" /><div><b>{usingOfflineData ? "Offline dashboard view" : "Waiting for live dashboard data"}</b><span>{usingOfflineData ? `Showing data last refreshed ${freshnessLabel}. Scenario controls remain locked until a fresh connection is verified.` : "No cache is available. Reconnect to view current authority evidence."}</span></div></div> : null}
          <div className="scenario-grid">{scenarios.map(({ label, icon: Icon, note, tone }, index) => <button key={label} type="button" disabled={runScenario.isPending || !apiReady} onClick={() => { const attempt = createScenarioAttempt(label); setActiveScenario(label); setLastFailedScenario(null); runScenario.mutate(attempt); }} className={`scenario-button scenario-${tone} ${activeScenario === label ? "scenario-active" : ""}`}><span className="scenario-index">0{index + 1}</span><span className="scenario-icon"><Icon className="h-4 w-4" /></span><span className="scenario-content"><b>{label}</b><small>{note}</small></span><ChevronRight className="h-4 w-4 scenario-arrow" /></button>)}</div>
          <div className="decision-strip" aria-live="polite"><span>Latest verdict</span>{usingOfflineData ? <p>Offline cache active. This evidence is the last loaded dashboard state and cannot authorize actions.</p> : apiUnavailable ? <p>Connection is recovering. Scenario controls remain locked until Sentra reconnects.</p> : latest ? <><OutcomeBadge outcome={latest.outcome} /><p>{latest.gatewayResult}</p></> : <p>Select a test to create a persisted decision.</p>}</div>
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
function GuidedDemoPanel({ prompt,onPromptChange,status,stepIndex,step,canStart,isBusy,onStart,onPause,onResume,onSkip,onReset }: { prompt:string; onPromptChange:(value:string)=>void; status:GuidedDemoStatus; stepIndex:number; step:typeof guidedDemoSteps[number]; canStart:boolean; isBusy:boolean; onStart:()=>void; onPause:()=>void; onResume:()=>void; onSkip:()=>void; onReset:()=>void }) {
  const playing = status === "running";
  const canControl = status === "running" || status === "paused";
  return <aside className={`guided-demo guided-demo-${status}`} aria-labelledby="guided-demo-title"><div className="guided-demo-head"><div><span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />Judge walkthrough</span><h3 id="guided-demo-title">A guided authority story, backed by the live system.</h3><p>One button runs the same persisted scenarios a judge can inspect. The plan is paced for <b>{formatGuidedDemoDuration()}</b>; controls remain available if you need to pause, skip, or restart.</p></div><div className="guided-demo-status"><ListVideo className="h-4 w-4" /><span>{status === "idle" ? "ready" : status === "complete" ? "proof ready" : `stage ${String(stepIndex + 1).padStart(2, "0")} / ${String(guidedDemoSteps.length).padStart(2, "0")}`}</span></div></div>
    <div className="guided-demo-grid"><div className="guided-prompt"><label htmlFor="judge-demo-prompt">Judge narrative</label><textarea id="judge-demo-prompt" value={prompt} maxLength={220} onChange={event => onPromptChange(event.target.value)} aria-describedby="judge-demo-note" /><small id="judge-demo-note">This frames the narration. Sentra’s policy outcomes remain deterministic and server-persisted.</small></div><div className="guided-now" aria-live="polite"><span>Now demonstrating</span><b>{step.title}</b><p>{step.narration}</p><small>{step.evidence}</small></div></div>
    <div className="guided-demo-controls"><button type="button" className="guided-start" disabled={!canStart || isBusy} onClick={onStart}><Play className="h-4 w-4" />{status === "idle" || status === "complete" ? "Start guided demo" : "Restart from baseline"}</button>{playing ? <button type="button" className="guided-control" onClick={onPause}><Pause className="h-4 w-4" />Pause</button> : status === "paused" ? <button type="button" className="guided-control" disabled={!canStart} onClick={onResume}><Play className="h-4 w-4" />Resume</button> : null}{canControl ? <button type="button" className="guided-control" onClick={onSkip}><SkipForward className="h-4 w-4" />Skip stage</button> : null}<button type="button" className="guided-control" onClick={onReset}><RotateCcw className="h-4 w-4" />Reset tour</button></div>
    <ol className="guided-steps">{guidedDemoSteps.map((item,index) => <li key={item.title} className={index === stepIndex ? "guided-current" : index < stepIndex ? "guided-complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.title}</b>{item.scenario ? <small>{item.scenario}</small> : <small>context</small>}</li>)}</ol>
  </aside>;
}
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
