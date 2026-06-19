import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { cartStore } from "../lib/cart-store";
import { useTapTracker } from "../lib/tap-tracker";

export const Route = createFileRoute("/confirmation")({
  head: () => ({ meta: [{ title: "Order confirmed · Re:Bite" }] }),
  component: Confirmation,
});

function Confirmation() {
  const navigate = useNavigate();
  const conf = cartStore.getConfirmation();
  const tracker = useTapTracker();

  useEffect(() => {
    if (!conf) navigate({ to: "/" });
  }, [conf, navigate]);

  if (!conf) return null;

  return (
    <div className="flex-1 flex flex-col bg-brand-mint/30">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="w-24 h-24 rounded-full bg-brand-ink text-primary-foreground grid place-items-center shadow-xl">
          {conf.status === "scheduled" ? <Calendar className="w-10 h-10" /> : <Check className="w-10 h-10" strokeWidth={3} />}
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-foreground">
          {conf.status === "scheduled" ? "Scheduled!" : "Order confirmed!"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">
          {conf.status === "scheduled"
            ? `We'll place your order at ${conf.scheduled_for}.`
            : `Arriving in about ${conf.eta_minutes} minutes. Hang tight.`}
        </p>

        <div className="mt-8 w-full max-w-xs rounded-3xl bg-card border border-border/60 p-5 text-left">
          <Row k="Order ID" v={conf.order_id} mono />
          <Row k="Status" v={conf.status} />
          {conf.eta_minutes != null && <Row k="ETA" v={`${conf.eta_minutes} min`} />}
          {conf.scheduled_for && <Row k="Scheduled" v={conf.scheduled_for} />}
          <div className="my-2 border-t border-dashed border-border" />
          <Row k="Total" v={`₹${conf.total}`} strong />
        </div>

        <div className="mt-6 rounded-full bg-brand-yellow px-4 py-2 text-xs font-bold text-brand-ink">
          You did it in {tracker.taps} taps · {Math.round((Date.now() - tracker.startedAt) / 1000)}s
        </div>
      </div>

      <footer className="px-5 py-5 space-y-2 bg-card border-t border-border/60">
        <Link
          to="/"
          onClick={() => {
            tracker.reset();
            cartStore.clear();
          }}
          className="block text-center w-full rounded-2xl bg-brand-ink text-primary-foreground py-4 font-extrabold"
        >
          Back home
        </Link>
        <Link to="/history" className="block text-center w-full text-sm font-semibold text-foreground py-2">
          View order history
        </Link>
      </footer>
    </div>
  );
}

function Row({ k, v, mono, strong }: { k: string; v: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${strong ? "text-base font-extrabold text-foreground" : "text-foreground/80 text-sm"}`}>
      <span>{k}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{v}</span>
    </div>
  );
}