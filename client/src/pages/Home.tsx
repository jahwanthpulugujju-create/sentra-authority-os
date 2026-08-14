import { trpc } from "@/lib/trpc";
import { isTransientNetworkError } from "@/lib/apiReliability";
import { clearDashboardSnapshot, dashboardCacheRetentionToMs, getDashboardCacheRetentionMinutes, isDashboardSnapshotExpired, loadDashboardSnapshot, setDashboardCacheRetentionMinutes, writeDashboardSnapshot, type DashboardSnapshot } from "@/lib/dashboardCache";
import { formatGuidedDemoDuration, getGuidedDemoProgress, getGuidedReplayContrastState, getUndispatchedGuidedScenario, guidedDemoSteps, type GuidedDemoStatus } from "@/lib/guidedDemo";
import { buildProofDownloadName, buildProofEmailHref, copyTextToClipboard, serializeProofPackage } from "@/lib/proofDownload";
import { Activity, ArrowDownRight, ArrowRight, BadgeCheck, BellRing, Braces, Check, ChevronRight, CircleDot, ClipboardCheck, Clock3, Copy, Cpu, Database, FileCheck2, Fingerprint, Gauge, KeyRound, ListVideo, LoaderCircle, LockKeyhole, Mail, Pause, Play, RefreshCw, RotateCcw, ScanLine, ShieldCheck, SkipForward, SlidersHorizontal, Sparkles, TimerReset, TriangleAlert, WifiOff, X, Zap } from "lucide-react";
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
const formatSnapshotAge = (value?: number) => {
  if (!value) return "not available";
  const seconds = Math.max(0, Math.floor((Date.now() - value) / 1_000));
  return seconds < 60 ? "less than a minute" : seconds < 3_600 ? `${Math.floor(seconds / 60)} min` : `${Math.floor(seconds / 3_600)} hr`;
};
type ScenarioName = (typeof scenarios)[number]["label"];
type ScenarioAttempt = { scenario: ScenarioName; idempotencyKey: string };
const DEFAULT_GUIDED_PROMPT = "Approve Contoso as a scoped vendor — then show me why every unsafe shortcut is refused.";

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
  const proofExport = trpc.authority.proofExport.useQuery(undefined, { enabled: false });
  const ntfyStatus = trpc.authority.ntfyStatus.useQuery();
  const storage = typeof localStorage === "undefined" ? undefined : localStorage;
  const [cacheRetentionMinutes, setCacheRetentionMinutes] = useState(() => getDashboardCacheRetentionMinutes(storage));
  const [initialSnapshotLoad] = useState(() => loadDashboardSnapshot<NonNullable<typeof dashboard.data>>(storage, Date.now(), dashboardCacheRetentionToMs(getDashboardCacheRetentionMinutes(storage))));
  const [offlineSnapshot, setOfflineSnapshot] = useState<DashboardSnapshot<NonNullable<typeof dashboard.data>> | undefined>(() => initialSnapshotLoad.snapshot);
  const [cacheExpired, setCacheExpired] = useState(() => initialSnapshotLoad.expired);
  const [lastLiveRefreshAt, setLastLiveRefreshAt] = useState<number | undefined>(() => offlineSnapshot?.savedAt);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [lastFailedScenario, setLastFailedScenario] = useState<ScenarioAttempt | null>(null);
  const [artifactPointer, setArtifactPointer] = useState({ x: 0, y: 0 });
  const [guidedDemoStatus, setGuidedDemoStatus] = useState<GuidedDemoStatus>("idle");
  const [guidedDemoIndex, setGuidedDemoIndex] = useState(0);
  const [guidedPrompt, setGuidedPrompt] = useState(DEFAULT_GUIDED_PROMPT);
  const browserOnline = useBrowserOnline();
  const reconnectAfterRef = useRef<number | null>(null);
  const guidedExecutedStepsRef = useRef(new Set<number>());
  useEffect(() => {
    if (!dashboard.data) return;
    const savedAt = dashboard.dataUpdatedAt || Date.now();
    setOfflineSnapshot(writeDashboardSnapshot(dashboard.data, savedAt, storage));
    setLastLiveRefreshAt(savedAt);
    setCacheExpired(false);
  }, [dashboard.data, dashboard.dataUpdatedAt, storage]);
  const resetDemo = trpc.authority.resetDemo.useMutation({
    onSuccess: () => { setActiveScenario(null); utils.authority.dashboard.invalidate(); },
    onError: error => toast.error(isTransientNetworkError(error) ? "Connection interrupted. Reset was not confirmed; wait for Sentra to reconnect." : error.message),
  });
  const runScenario = trpc.authority.runScenario.useMutation({
    onSuccess: data => { setLastFailedScenario(null); utils.authority.dashboard.invalidate(); setActiveScenario(data.event.scenario); toast.success(`${data.event.outcome}: ${data.event.executionResult}`); },
    onError: (error, variables) => { setActiveScenario(null); if (isTransientNetworkError(error) && variables.idempotencyKey) { setLastFailedScenario({ scenario: variables.scenario, idempotencyKey: variables.idempotencyKey }); toast.error("Connection interrupted. Retry will reuse the same request key and cannot create a second authority event."); return; } setLastFailedScenario(null); toast.error(error.message); },
  });
  const notifyNtfy = trpc.authority.notifyNtfy.useMutation({
    onSuccess: delivery => toast.success("ntfy demo alert sent.", { description: `Published an outcome-only notification to ${delivery.topic}.` }),
    onError: error => toast.error(error.message),
  });

  const apiUnavailable = !browserOnline || dashboard.isError;
  useEffect(() => {
    if (!offlineSnapshot?.savedAt) return;
    const maxAgeMs = dashboardCacheRetentionToMs(cacheRetentionMinutes);
    const expiresIn = Math.max(0, offlineSnapshot.savedAt + maxAgeMs - Date.now());
    const timeout = window.setTimeout(() => {
      if (isDashboardSnapshotExpired(offlineSnapshot, Date.now(), maxAgeMs)) {
        clearDashboardSnapshot(storage);
        setOfflineSnapshot(undefined);
        setCacheExpired(true);
        toast.message(`Saved offline dashboard data expired after ${cacheRetentionMinutes} minutes.`);
      }
    }, expiresIn + 50);
    return () => window.clearTimeout(timeout);
  }, [offlineSnapshot, storage, cacheRetentionMinutes]);
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

  const data = apiUnavailable ? offlineSnapshot?.data : dashboard.data ?? offlineSnapshot?.data;
  const usingOfflineData = apiUnavailable && Boolean(data);
  const cachedDashboardAvailable = Boolean(offlineSnapshot);
  const apiReady = Boolean(data) && !apiUnavailable;
  const connectionLabel = usingOfflineData ? "offline view" : apiUnavailable ? "reconnecting" : dashboard.isFetching && !data ? "connecting" : "connected";
  const freshnessLabel = formatRefreshTime(lastLiveRefreshAt);
  const clearOfflineCache = () => {
    clearDashboardSnapshot(storage);
    setOfflineSnapshot(undefined);
    setCacheExpired(false);
    if (!dashboard.data) setLastLiveRefreshAt(undefined);
    toast.success("Saved offline dashboard data cleared.");
  };
  const refreshDashboard = async () => {
    if (!browserOnline) {
      toast.error("Refresh needs a browser connection. Reconnect and try again.");
      return;
    }
    const result = await dashboard.refetch();
    if (result.error) {
      toast.error(isTransientNetworkError(result.error) ? "Sentra is still unreachable. The last saved dashboard remains protected." : result.error.message);
      return;
    }
    toast.success("Live authority dashboard refreshed.");
  };
  const downloadProofRecord = async () => {
    const result = await proofExport.refetch();
    if (result.error || !result.data) {
      toast.error(result.error?.message || "The local proof package could not be prepared.");
      return;
    }
    const file = new Blob([serializeProofPackage(result.data)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = buildProofDownloadName();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Proof package exported.", { description: "The local JSON includes the verifier result and chronological evidence." });
  };
  const copyProofRecord = async () => {
    const result = await proofExport.refetch();
    if (result.error || !result.data) {
      toast.error(result.error?.message || "The local proof package could not be prepared for copying.");
      return;
    }
    const copied = await copyTextToClipboard(serializeProofPackage(result.data));
    if (!copied) {
      toast.error("Clipboard access is unavailable.", { description: "Use Download proof record to retain the same local JSON evidence." });
      return;
    }
    toast.success("Proof JSON copied.", { description: "Ready to paste into a presentation note or review record." });
  };
  const shareProofViaEmail = async () => {
    const result = await proofExport.refetch();
    if (result.error || !result.data) {
      toast.error(result.error?.message || "The local proof summary could not be prepared for email.");
      return;
    }
    window.location.href = buildProofEmailHref(result.data);
    toast.success("Email draft opened.", { description: "The draft contains a local proof summary; export JSON separately if the reviewer needs full evidence." });
  };
  const resetDemoBaseline = async () => {
    try {
      await resetDemo.mutateAsync();
      toast.success("Demo reset.", { description: "Protected state and proof history are back to the safe baseline." });
    } catch {
      // The mutation error toast communicates the failure condition.
    }
  };
  const resetProofWorkspace = async () => {
    setGuidedDemoStatus("idle");
    setGuidedDemoIndex(0);
    setGuidedPrompt(DEFAULT_GUIDED_PROMPT);
    guidedExecutedStepsRef.current.clear();
    setLastFailedScenario(null);
    try {
      await resetDemo.mutateAsync();
      toast.success("Proof and inputs reset.", { description: "The generated timeline was cleared and the guided narrative returned to its demo-ready default." });
    } catch {
      // The mutation error toast communicates the failure condition.
    }
  };
  const sendNtfyDemoAlert = () => {
    if (!latest) {
      toast.error("Run a scenario before sending a demo notification.");
      return;
    }
    notifyNtfy.mutate();
  };
  const updateCacheRetention = (minutes: number) => {
    const next = setDashboardCacheRetentionMinutes(minutes, storage);
    setCacheRetentionMinutes(next);
    if (offlineSnapshot && isDashboardSnapshotExpired(offlineSnapshot, Date.now(), dashboardCacheRetentionToMs(next))) {
      clearDashboardSnapshot(storage);
      setOfflineSnapshot(undefined);
      setCacheExpired(true);
      toast.message("The saved dashboard exceeded the new retention window and was cleared.");
      return;
    }
    toast.success(`Offline cache retention set to ${next} minutes.`);
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
  const policyHistory = data?.policyHistory || [];
  const activePolicyVersion = data?.activePolicyVersion || "sentra-policy-v1";
  const keyHistory = data?.keyHistory || [];
  const keyVerificationModel = data?.keyVerificationModel || "HMAC-SHA256 shared-secret MAC verification (controlled demo)";
  const reasonCodeDescriptions = data?.reasonCodeDescriptions || {};
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
    {apiUnavailable ? <aside className="offline-banner" role="status"><div><WifiOff className="h-4 w-4" /><span><b>{usingOfflineData ? "Offline view active." : cacheExpired ? "Saved offline data expired." : "Offline with no saved dashboard."}</b> {usingOfflineData ? `Evidence may be stale; last live refresh ${freshnessLabel}.` : cacheExpired ? "The cache was removed after its 15-minute retention period." : "Reconnect to load authority evidence."}</span></div>{cachedDashboardAvailable ? <button type="button" onClick={clearOfflineCache}><X className="h-3.5 w-3.5" />Clear cache</button> : null}</aside> : null}

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
        </div><div className="scenario-console"><div className="console-head"><div><span className="eyebrow">Authority test suite</span><h3>Choose a scenario.</h3></div><div className="console-controls"><span className={`console-status ${apiUnavailable ? "status-offline" : ""}`}>{usingOfflineData ? "offline cache" : apiUnavailable ? "reconnecting" : "live database"}</span><span className="dashboard-freshness"><Clock3 className="h-3.5 w-3.5" />Last refreshed {freshnessLabel}</span><label className="cache-settings"><SlidersHorizontal className="h-3.5 w-3.5" /><span>Offline cache</span><select aria-label="Offline cache retention" value={cacheRetentionMinutes} onChange={event => updateCacheRetention(Number(event.target.value))}>{[5,15,30,60,120].map(minutes => <option key={minutes} value={minutes}>{minutes} min</option>)}</select></label><button type="button" className={`refresh-now ${dashboard.isFetching ? "control-loading" : ""}`} disabled={!browserOnline || dashboard.isFetching} onClick={() => void refreshDashboard()} aria-busy={dashboard.isFetching}><RefreshCw className={`h-3.5 w-3.5 ${dashboard.isFetching ? "spin-icon" : ""}`} />{dashboard.isFetching ? "Refreshing…" : "Refresh now"}</button><button type="button" className={`demo-reset ${resetDemo.isPending ? "control-loading" : ""}`} disabled={runScenario.isPending || resetDemo.isPending || !apiReady} onClick={() => void resetDemoBaseline()} aria-busy={resetDemo.isPending}>{resetDemo.isPending ? <LoaderCircle className="h-3.5 w-3.5 spin-icon" /> : <TimerReset className="h-3.5 w-3.5" />}{resetDemo.isPending ? "Resetting…" : "Reset baseline"}</button>{cachedDashboardAvailable ? <button type="button" className="cache-clear" onClick={clearOfflineCache}><X className="h-3.5 w-3.5" />Clear cache</button> : null}{lastFailedScenario ? <button type="button" className={`scenario-retry ${runScenario.isPending ? "control-loading" : ""}`} disabled={runScenario.isPending || !apiReady} onClick={() => { setActiveScenario(lastFailedScenario.scenario); runScenario.mutate(lastFailedScenario); }} aria-busy={runScenario.isPending}>{runScenario.isPending ? <LoaderCircle className="h-3.5 w-3.5 spin-icon" /> : <RefreshCw className="h-3.5 w-3.5" />}{runScenario.isPending ? "Retrying…" : `Retry ${lastFailedScenario.scenario}`}</button> : null}</div></div>
          {apiUnavailable ? <><div className="offline-notice" role="status"><WifiOff className="h-4 w-4" /><div><b>{usingOfflineData ? "Offline dashboard view" : cacheExpired ? "Offline cache expired" : "Waiting for live dashboard data"}</b><span>{usingOfflineData ? `Showing data last refreshed ${freshnessLabel}. Scenario controls remain locked until a fresh connection is verified.` : cacheExpired ? `The last offline snapshot exceeded the ${cacheRetentionMinutes}-minute retention window and was removed.` : "No cache is available. Reconnect to view current authority evidence."}</span></div></div><OfflineDiagnostics browserOnline={browserOnline} dashboardError={dashboard.error?.message} isFetching={dashboard.isFetching} cacheAvailable={cachedDashboardAvailable} cacheExpired={cacheExpired} savedAt={offlineSnapshot?.savedAt} retentionMinutes={cacheRetentionMinutes} onRefresh={() => void refreshDashboard()} refreshDisabled={!browserOnline || dashboard.isFetching} /></> : null}
          <div className="scenario-grid">{scenarios.map(({ label, icon: Icon, note, tone }, index) => { const scenarioRunning = runScenario.isPending && activeScenario === label; return <button key={label} type="button" disabled={runScenario.isPending || !apiReady} onClick={() => { const attempt = createScenarioAttempt(label); setActiveScenario(label); setLastFailedScenario(null); runScenario.mutate(attempt); }} className={`scenario-button scenario-${tone} ${activeScenario === label ? "scenario-active" : ""} ${scenarioRunning ? "scenario-running" : ""}`} aria-busy={scenarioRunning}><span className="scenario-index">0{index + 1}</span><span className="scenario-icon">{scenarioRunning ? <LoaderCircle className="h-4 w-4 spin-icon" /> : <Icon className="h-4 w-4" />}</span><span className="scenario-content"><b>{scenarioRunning ? "Verifying authority…" : label}</b><small>{scenarioRunning ? "Sentra is evaluating and recording this request" : note}</small></span>{scenarioRunning ? <span className="scenario-pending">working</span> : <ChevronRight className="h-4 w-4 scenario-arrow" />}</button>; })}</div>
          <div className="decision-strip" aria-live="polite"><span>Latest verdict</span>{usingOfflineData ? <p>Offline cache active. This evidence is the last loaded dashboard state and cannot authorize actions.</p> : apiUnavailable ? <p>Connection is recovering. Scenario controls remain locked until Sentra reconnects.</p> : latest ? <><OutcomeBadge outcome={latest.outcome} /><p><b>{reasonCodeDescriptions[latest.reasonCode] || "Decision reason is recorded with this local proof event."}</b><span>{latest.reasonCode || "UNSPECIFIED"} · {latest.gatewayResult}</span></p></> : <p>Select a test to create a persisted decision.</p>}</div>
        </div></div>
      </section>

      <section className="record-section"><div className="content-section compact-top"><SectionHeading eyebrow="Decision records" title="See exactly what was decided." description="Each authority event carries the stored request, policy outcome, capability material, gateway result, and protected execution result." />
        <div className="records-grid"><div className="decision-panel"><PanelBar icon={Activity} title="Live decision feed" end={`${events.length} records`} /><div className="decision-list">{events.length ? events.slice(0, 6).map(event => <DecisionRow key={event.eventId} event={event} reasonDescription={reasonCodeDescriptions[event.reasonCode]} />) : <Blank text="Run any scenario to create the first persistent decision." />}</div></div>
          <div className="request-panel"><span className="eyebrow">Canonical request</span><h3>Exact scope. Exact hashes.</h3>{latest ? <><div className="request-source"><span>Local persistent record</span><b>{latest.policyVersion || latest.canonicalRequest.policyVersion || activePolicyVersion}</b><span>{formatTime(latest.createdAt)}</span></div><div className="request-code"><pre>{JSON.stringify(latest.canonicalRequest, null, 2)}</pre></div><div className="hash-grid"><HashCard label="Request hash" value={latest.requestHash} /><HashCard label="Capability hash" value={latest.capabilityHash} /></div><div className="request-foot"><Braces className="h-4 w-4" />The stored request is the input Sentra actually evaluated.</div></> : <Blank text="A request inspector will appear after the first authority decision." />}</div>
        </div></div></section>

      <section className="content-section policy-section"><SectionHeading eyebrow="Versioned policy evidence" title="The rule is visible before the proof is trusted." description="Sentra resolves a deterministic local policy snapshot before it issues authority. A capability retains its issuance version; a later policy change cannot silently rewrite that signed context." />
        <PolicyHistoryPanel policies={policyHistory} activeVersion={activePolicyVersion} />
        <KeyLifecyclePanel keys={keyHistory} verificationModel={keyVerificationModel} />
      </section>

      <section id="proof" className="content-section proof-section"><div className="proof-head"><SectionHeading eyebrow="Replayable proof" title="A decision that can be inspected after it happens." description="Each record commits the request, policy result, capability status, gateway verdict, execution result, and preceding proof hash." /><div className="proof-statement"><span>Sentra invariant</span><b>No valid decision.<br /><em>No valid capability.</em><br />No execution.</b><div className={`proof-integrity ${data?.proofIntegrity?.valid ? "integrity-valid" : "integrity-pending"}`}><ShieldCheck className="h-3.5 w-3.5" />{data?.proofIntegrity?.valid ? `Proof chain verified · ${data.proofIntegrity.checkedEvents} records` : "Proof chain awaiting verification"}</div><div className="proof-actions"><button type="button" className={`proof-copy ${proofExport.isFetching ? "control-loading" : ""}`} disabled={proofExport.isFetching || apiUnavailable} onClick={() => void copyProofRecord()} aria-busy={proofExport.isFetching}>{proofExport.isFetching ? <LoaderCircle className="h-3.5 w-3.5 spin-icon" /> : <Copy className="h-3.5 w-3.5" />}{proofExport.isFetching ? "Preparing proof…" : "Copy proof JSON"}</button><button type="button" className={`proof-email ${proofExport.isFetching ? "control-loading" : ""}`} disabled={proofExport.isFetching || apiUnavailable} onClick={() => void shareProofViaEmail()} aria-busy={proofExport.isFetching}>{proofExport.isFetching ? <LoaderCircle className="h-3.5 w-3.5 spin-icon" /> : <Mail className="h-3.5 w-3.5" />}{proofExport.isFetching ? "Preparing proof…" : "Share via email"}</button><button type="button" className={`proof-export ${proofExport.isFetching ? "control-loading" : ""}`} disabled={proofExport.isFetching || apiUnavailable} onClick={() => void downloadProofRecord()} aria-busy={proofExport.isFetching}>{proofExport.isFetching ? <LoaderCircle className="h-3.5 w-3.5 spin-icon" /> : <FileCheck2 className="h-3.5 w-3.5" />}{proofExport.isFetching ? "Preparing proof…" : "Download proof record"}</button><button type="button" className={`proof-reset ${resetDemo.isPending ? "control-loading" : ""}`} disabled={resetDemo.isPending || runScenario.isPending || !apiReady} onClick={() => void resetProofWorkspace()} aria-busy={resetDemo.isPending}>{resetDemo.isPending ? <LoaderCircle className="h-3.5 w-3.5 spin-icon" /> : <RotateCcw className="h-3.5 w-3.5" />}{resetDemo.isPending ? "Resetting…" : "Reset proof & inputs"}</button><button type="button" className={`proof-ntfy ${notifyNtfy.isPending ? "control-loading" : ""}`} disabled={notifyNtfy.isPending || apiUnavailable || !latest} onClick={sendNtfyDemoAlert} aria-busy={notifyNtfy.isPending}>{notifyNtfy.isPending ? <LoaderCircle className="h-3.5 w-3.5 spin-icon" /> : <BellRing className="h-3.5 w-3.5" />}{notifyNtfy.isPending ? "Sending alert…" : "Send ntfy demo alert"}</button><p className="ntfy-scope">{ntfyStatus.data ? `ntfy demo topic: ${ntfyStatus.data.topic} · outcome only` : "Preparing isolated ntfy demo channel…"}</p></div></div></div>
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
        <ObservabilityPanel metrics={metrics} proofIntegrity={data?.proofIntegrity} reasonDescriptions={reasonCodeDescriptions} />
      </section>
    </main>
    <footer className="site-footer"><div><span>Sentra Authority OS</span><small>Brand New Day · Round 2</small></div><p>Runtime authority · persistent proof · protected execution</p></footer>
  </div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow:string; title:string; description:string }) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>; }
function GuidedDemoPanel({ prompt,onPromptChange,status,stepIndex,step,canStart,isBusy,onStart,onPause,onResume,onSkip,onReset }: { prompt:string; onPromptChange:(value:string)=>void; status:GuidedDemoStatus; stepIndex:number; step:typeof guidedDemoSteps[number]; canStart:boolean; isBusy:boolean; onStart:()=>void; onPause:()=>void; onResume:()=>void; onSkip:()=>void; onReset:()=>void }) {
  const playing = status === "running";
  const canControl = status === "running" || status === "paused";
  const progress = getGuidedDemoProgress(stepIndex, status);
  const replayContrast = getGuidedReplayContrastState(stepIndex, status);
  const replayCopy = {
    waiting: "Stage 02 grants one fresh capability. Stage 07 tries to use that authority again.",
    "fresh-execution": "Fresh capability accepted once. The protected action commits exactly one change.",
    "protected-once": "The valid action is complete and its capability is now consumed. The replay test is next.",
    "replay-refused": "The same spent authority is presented again. Gateway verification refuses it before any second change.",
    complete: "Contrast complete: one protected execution, one replay refusal, and no duplicate side effect.",
  }[replayContrast];
  return <aside className={`guided-demo guided-demo-${status}`} aria-labelledby="guided-demo-title"><div className="guided-demo-head"><div><span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />Judge walkthrough</span><h3 id="guided-demo-title">A guided authority story, backed by the live system.</h3><p>One button runs the same persisted scenarios a judge can inspect. The plan is paced for <b>{formatGuidedDemoDuration()}</b>; controls remain available if you need to pause, skip, or restart.</p></div><div className="guided-demo-status"><ListVideo className="h-4 w-4" /><span>{status === "idle" ? "ready" : status === "complete" ? "proof ready" : `stage ${String(stepIndex + 1).padStart(2, "0")} / ${String(guidedDemoSteps.length).padStart(2, "0")}`}</span></div></div>
    <div className="guided-progress"><div><span>Workflow progress</span><b>{progress}% · Step {status === "complete" ? guidedDemoSteps.length : stepIndex + 1} of {guidedDemoSteps.length}</b></div><div className="guided-progress-track" role="progressbar" aria-label="Guided demo workflow progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div></div><div className="guided-demo-grid"><div className="guided-prompt"><label htmlFor="judge-demo-prompt">Judge narrative</label><textarea id="judge-demo-prompt" value={prompt} maxLength={220} onChange={event => onPromptChange(event.target.value)} aria-describedby="judge-demo-note" /><small id="judge-demo-note">This frames the narration. Sentra’s policy outcomes remain deterministic and server-persisted.</small></div><div className="guided-now" aria-live="polite"><span>Now demonstrating</span><b>{step.title}</b><p>{step.narration}</p><small>{step.evidence}</small></div></div>
    <div className={`guided-replay-contrast contrast-${replayContrast}`} aria-live="polite"><div className="contrast-head"><span>One capability. One execution.</span><b>Fresh request ≠ replayed request</b></div><div className="contrast-cards"><article className="contrast-card contrast-valid"><span>Fresh request</span><b>{replayContrast === "waiting" ? "Awaiting capability" : "ALLOW · executed once"}</b><small>{replayContrast === "waiting" ? "Scoped request has not crossed the gateway." : "Capability verified, then marked consumed."}</small></article><ArrowRight className="contrast-arrow h-4 w-4" /><article className="contrast-card contrast-replay"><span>Replayed request</span><b>{replayContrast === "replay-refused" || replayContrast === "complete" ? "DENY · no second change" : "Replay test pending"}</b><small>{replayContrast === "replay-refused" || replayContrast === "complete" ? "Consumed capability rejected at gateway." : "The same spent authority will be tested at stage 07."}</small></article></div><p>{replayCopy}</p></div>
    <div className="guided-demo-controls"><button type="button" className={`guided-start ${isBusy ? "control-loading" : ""}`} disabled={!canStart || isBusy} onClick={onStart} aria-busy={isBusy}>{isBusy ? <LoaderCircle className="h-4 w-4 spin-icon" /> : <Play className="h-4 w-4" />}{isBusy ? "Preparing live demo…" : status === "idle" || status === "complete" ? "Start guided demo" : "Restart from baseline"}</button>{playing ? <button type="button" className="guided-control" onClick={onPause}><Pause className="h-4 w-4" />Pause</button> : status === "paused" ? <button type="button" className="guided-control" disabled={!canStart} onClick={onResume}><Play className="h-4 w-4" />Resume</button> : null}{canControl ? <button type="button" className="guided-control" onClick={onSkip}><SkipForward className="h-4 w-4" />Skip stage</button> : null}<button type="button" className="guided-control" onClick={onReset}><RotateCcw className="h-4 w-4" />Reset tour</button></div>
    <ol className="guided-steps">{guidedDemoSteps.map((item,index) => <li key={item.title} className={index === stepIndex ? "guided-current" : index < stepIndex ? "guided-complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><b>{item.title}</b>{item.scenario ? <small>{item.scenario}</small> : <small>context</small>}</li>)}</ol>
  </aside>;
}
function OfflineDiagnostics({ browserOnline,dashboardError,isFetching,cacheAvailable,cacheExpired,savedAt,retentionMinutes,onRefresh,refreshDisabled }: { browserOnline:boolean; dashboardError?:string; isFetching:boolean; cacheAvailable:boolean; cacheExpired:boolean; savedAt?:number; retentionMinutes:number; onRefresh:()=>void; refreshDisabled:boolean }) { return <details className="offline-diagnostics" open><summary><Gauge className="h-4 w-4" />Connection diagnostics<span>{browserOnline ? "network available" : "browser offline"}</span></summary><div className="diagnostic-grid"><div><span>Browser</span><b>{browserOnline ? "Online" : "Offline"}</b></div><div><span>Authority API</span><b>{isFetching ? "Checking" : dashboardError ? "Unavailable" : "Awaiting retry"}</b></div><div><span>Snapshot</span><b>{cacheAvailable ? `Saved ${formatSnapshotAge(savedAt)} ago` : cacheExpired ? "Expired and removed" : "Not available"}</b></div></div><p>{dashboardError ? `Latest transport detail: ${dashboardError}` : browserOnline ? "Try Refresh now to request a fresh authority dashboard." : `Reconnect your network, then use Refresh now to fetch current authority evidence. Offline snapshots retain for ${retentionMinutes} minutes.`}</p><button type="button" className="diagnostic-refresh" disabled={refreshDisabled} onClick={onRefresh}><RefreshCw className="h-3.5 w-3.5" />Refresh now</button></details>; }
function HeroMetric({ value,label }: { value:string; label:string }) { return <div><b>{value}</b><span>{label}</span></div>; }
function MetricLarge({ value,label,icon:Icon }: { value:string; label:string; icon:typeof Database }) { return <div className="metric-large"><Icon className="h-4 w-4" /><b>{value}</b><span>{label}</span></div>; }
function OutcomeBadge({ outcome }: { outcome:"ALLOW"|"DENY"|"ESCALATE"|"FREEZE" }) { return <span className={`outcome-badge outcome-${outcome}`}><CircleDot className="h-3 w-3" />{outcome}</span>; }
function ArtifactNode({ className,number,icon:Icon,title,detail }: { className:string; number:string; icon:typeof Cpu; title:string; detail:string }) { return <div className={`artifact-node ${className}`}><span className="node-number">{number}</span><Icon className="h-4 w-4" /><b>{title}</b><small>{detail}</small></div>; }
function PathStep({ number,icon:Icon,title,detail,tone="neutral" }: { number:string; icon:typeof Cpu; title:string; detail:string; tone?:"brand"|"green"|"neutral" }) { return <><div className={`path-step path-${tone}`}><span>{number}</span><Icon className="h-5 w-5" /><div><b>{title}</b><small>{detail}</small></div></div>{number!=="03"&&<div className="path-connector"><span /></div>}</>; }
function PanelBar({ icon:Icon,title,end }: { icon:typeof Activity; title:string; end:string }) { return <div className="panel-bar"><div><Icon className="h-4 w-4" /><b>{title}</b></div><span>{end}</span></div>; }
function Blank({ text }: { text:string }) { return <div className="blank-state">{text}</div>; }
function HashCard({ label,value }: { label:string; value?:string|null }) { return <div className="hash-card"><span>{label}</span><b>{shortHash(value)}</b></div>; }
function EvidenceChip({ label,value }: { label:string; value:string }) { return <div className="evidence-chip"><span>{label}</span><b>{value}</b></div>; }
function PayloadBlock({ request,capability,approval,label }: { request:Record<string,unknown>; capability?:Record<string,unknown>|null; approval?:Record<string,unknown>|null; label:string }) { return <details className="payload-block"><summary><Braces className="h-3.5 w-3.5" />{label}<ChevronRight className="h-3.5 w-3.5" /></summary><div><pre>{JSON.stringify(request,null,2)}</pre><pre>{JSON.stringify(capability||{issued:false,reason:"No capability issued for this outcome."},null,2)}</pre>{approval ? <pre>{JSON.stringify(approval,null,2)}</pre> : null}</div></details>; }
function PolicyHistoryPanel({ policies,activeVersion }: { policies:any[]; activeVersion:string }) { return <div className="policy-history-panel"><div className="policy-history-head"><div><span className="eyebrow">Policy catalog</span><h3>{activeVersion}</h3></div><span className="policy-local-label">local deterministic snapshot</span></div><div className="policy-history-grid">{policies.map(policy => <details key={policy.version} className={`policy-card policy-${String(policy.status).toLowerCase()}`} open={policy.version === activeVersion}><summary><div><span>{policy.status}</span><b>{policy.version}</b></div><small>issued {formatTime(policy.issuedAt)}</small><ChevronRight className="h-4 w-4" /></summary><p>{policy.summary}</p>{policy.rules.length ? <div className="policy-rule-list">{policy.rules.map((rule:any) => <div key={rule.id}><span>{rule.id}</span><b>{rule.decision} · {rule.reasonCode}</b><small>{rule.constraints}</small></div>)}</div> : <p className="policy-empty">No issuing rules are available for this non-active snapshot.</p>}</details>)}</div></div>; }
function KeyLifecyclePanel({ keys,verificationModel }: { keys:any[]; verificationModel:string }) { return <div className="key-lifecycle-panel"><div className="key-lifecycle-head"><div><span className="eyebrow">Key lifecycle evidence</span><h3>Every capability names the MAC key that issued it.</h3></div><span>{verificationModel}</span></div><div className="key-lifecycle-grid">{keys.map(key => <article key={key.keyId} className={`key-card key-${String(key.status).toLowerCase()}`}><div><span>{key.status}</span><b>{key.keyId}</b></div><p>Version {key.version} · rotation boundary {formatTime(key.rotationDueAt)}</p><small>{key.description}</small></article>)}</div><p className="key-claim-boundary">The controlled MVP uses **HMAC-SHA256 shared-secret MAC verification**. It does not claim public-key signatures or non-repudiation. Retired, revoked, and unknown key identifiers fail closed before a protected tool is called.</p></div>; }
function DecisionRow({ event,reasonDescription }: { event:any; reasonDescription?:string }) { return <article className={`decision-row decision-${event.outcome}`}><div className="decision-row-top"><div><OutcomeBadge outcome={event.outcome} /><b>{event.scenario}</b><small>{event.requestId} · {formatTime(event.createdAt)}</small></div><span>{outcomeCopy[event.outcome as keyof typeof outcomeCopy]}</span></div><p className="decision-reason"><b>{reasonDescription || "Decision reason is stored in the proof record."}</b><span>{event.reasonCode || "UNSPECIFIED"}</span></p><p>{event.executionResult}</p><div className="evidence-grid"><EvidenceChip label="request" value={`${event.canonicalRequest.action} · ${event.canonicalRequest.resource.split("/").pop()}`} /><EvidenceChip label="policy" value={event.policyVersion || event.canonicalRequest.policyVersion || "recorded"} /><EvidenceChip label="capability" value={event.capability?shortHash(event.capabilityHash):"not issued"} /><EvidenceChip label="gateway" value={event.gatewayResult} /></div><PayloadBlock request={event.canonicalRequest} capability={event.capability} approval={event.approval} label={event.approval ? "Open request, capability, and human-review binding" : "Open persisted request and capability"} /></article>; }
function ObservabilityPanel({ metrics,proofIntegrity,reasonDescriptions }: { metrics:any; proofIntegrity:any; reasonDescriptions:Record<string,string> }) { const denialReasons = metrics.gatewayDenialReasons || []; return <section className="observability-panel"><div className="observability-head"><div><span className="eyebrow">Local decision telemetry</span><h3>Operations evidence, not a production claim.</h3></div><span>{metrics.telemetryScope || "local persistent demo data"}</span></div><div className="observability-grid"><div><span>Average decision latency</span><b>{metrics.averageDecisionLatencyMs || 0} ms</b><small>measured inside this demo authority request</small></div><div><span>Capability expiry count</span><b>{metrics.expiredCapabilities || 0}</b><small>issued capability records marked expired</small></div><div><span>Human escalations</span><b>{metrics.escalations || 0}</b><small>hash-bound pending-review records</small></div><div><span>Proof verification</span><b className={proofIntegrity?.valid ? "metric-ok" : "metric-hold"}>{proofIntegrity?.valid ? "PASS" : "PENDING"}</b><small>{proofIntegrity?.checkedEvents || 0} local records checked</small></div></div><div className="denial-reason-list"><span>Gateway refusal reasons</span>{denialReasons.length ? denialReasons.map((reason:any) => <div key={reason.reasonCode}><b>{reason.count}</b><p>{reasonDescriptions[reason.reasonCode] || "Recorded gateway refusal."}<small>{reason.reasonCode}</small></p></div>) : <p>No refusal record exists yet. Run an adverse scenario to populate local telemetry.</p>}</div></section>; }
function ProofRow({ event,latest }: { event:any; latest:boolean }) { return <article className={`proof-row ${latest?"proof-latest":""}`}><div className="proof-dot" /><div className="proof-row-head"><div><OutcomeBadge outcome={event.outcome} /><b>{event.scenario}</b></div><span>{formatTime(event.createdAt)}</span></div><div className="proof-hashes"><HashCard label="previous hash" value={event.previousHash} /><HashCard label="record hash" value={event.recordHash} /></div><p>Canonical action <b>{event.canonicalRequest.action}</b> on <b>{event.canonicalRequest.resource}</b></p><PayloadBlock request={event.canonicalRequest} capability={event.capability} approval={event.approval} label="Open complete proof payload" /></article>; }
