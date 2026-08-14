import { trpc } from "@/lib/trpc";
import { Check, LoaderCircle, ShieldAlert, X } from "lucide-react";
import { useMemo, useState } from "react";

type ReviewDecision = "APPROVED" | "DENIED";

export default function MobileReview() {
  const utils = trpc.useUtils();
  const { eventId, token } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return { eventId: params.get("eventId") || "", token: params.get("token") || "" };
  }, []);
  const [resolvedMessage, setResolvedMessage] = useState<string | null>(null);
  const [reviewerCode, setReviewerCode] = useState("");
  const review = trpc.authority.mobileReview.useQuery({ eventId, token }, { enabled: Boolean(eventId && token), retry: false });
  const resolve = trpc.authority.resolveMobileReview.useMutation({
    onSuccess: data => {
      setResolvedMessage(data.message);
      void utils.authority.mobileReview.invalidate({ eventId, token });
      void utils.authority.dashboard.invalidate();
    },
  });
  const decide = (decision: ReviewDecision) => resolve.mutate({ eventId, token, reviewerCode, decision });

  return <main className="min-h-screen bg-[#f7f8fa] px-5 py-8 text-[#112039] sm:px-8">
    <section className="mx-auto max-w-lg">
      <div className="mb-10 flex items-center gap-3"><img src="/manus-storage/sentra-logo_24a70887.png" alt="Sentra logo" className="h-9 w-9" /><div><p className="m-0 text-lg font-semibold tracking-tight">Sentra</p><p className="m-0 text-[11px] uppercase tracking-[0.18em] text-[#9b1747]">Mobile review</p></div></div>
      <div className="border border-[#e2e8f0] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 flex h-12 w-12 items-center justify-center border border-[#9b1747] bg-[#fff5f7] text-[#9b1747]"><ShieldAlert className="h-6 w-6" /></div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#9b1747]">Human review required</p>
        <h1 className="m-0 text-3xl font-semibold tracking-tight">Resolve this escalation.</h1>
        {!eventId || !token ? <p className="mt-6 text-base leading-7 text-[#5a6678]">This review link is incomplete. Return to the Sentra escalation notification and open its review link again.</p> : review.isLoading ? <div className="mt-8 flex items-center gap-3 text-[#5a6678]"><LoaderCircle className="h-5 w-5 animate-spin" />Loading the evidence-bound review…</div> : review.error ? <p className="mt-6 border-l-2 border-[#9b1747] pl-4 text-base leading-7 text-[#9b1747]">{review.error.message}</p> : <>
          <div className="mt-7 space-y-4 border-y border-[#e2e8f0] py-5 text-sm">
            <div className="flex justify-between gap-6"><span className="text-[#5a6678]">Scenario</span><b className="text-right">{review.data?.scenario}</b></div>
            <div className="flex justify-between gap-6"><span className="text-[#5a6678]">Reason</span><b className="text-right">{review.data?.reasonCode}</b></div>
            <div className="flex justify-between gap-6"><span className="text-[#5a6678]">Review role</span><b className="text-right">{review.data?.approverRole}</b></div>
            <div className="flex justify-between gap-6"><span className="text-[#5a6678]">Expires</span><b className="text-right">{review.data ? new Date(review.data.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</b></div>
          </div>
          <p className="mt-6 text-sm leading-6 text-[#5a6678]">{resolvedMessage || review.data?.originalAction}</p>
          {review.data?.canResolve && !resolvedMessage ? <><label className="mt-7 block text-sm font-semibold text-[#112039]">Reviewer code <span className="font-normal text-[#5a6678]">— shown only in the Sentra dashboard</span><input value={reviewerCode} onChange={event => setReviewerCode(event.target.value.toUpperCase())} inputMode="text" autoComplete="one-time-code" placeholder="Enter 8-character code" className="mt-3 block min-h-12 w-full border border-[#cfd8e3] bg-white px-4 font-mono tracking-[0.18em] outline-none focus:border-[#265ec7]" /></label><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" disabled={resolve.isPending || reviewerCode.length !== 8} onClick={() => decide("APPROVED")} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#19704a] px-5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"><Check className="h-4 w-4" />{resolve.isPending ? "Recording…" : "Approve review"}</button><button type="button" disabled={resolve.isPending || reviewerCode.length !== 8} onClick={() => decide("DENIED")} className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#9b1747] bg-white px-5 text-sm font-semibold text-[#9b1747] transition active:scale-[0.98] disabled:opacity-60"><X className="h-4 w-4" />Deny review</button></div></> : null}
        </>}
      </div>
      <p className="mx-auto mt-7 max-w-md text-center text-xs leading-5 text-[#5a6678]">This one-time phone decision closes only this review. It cannot execute the original untrusted request or create a protected tool action.</p>
    </section>
  </main>;
}
