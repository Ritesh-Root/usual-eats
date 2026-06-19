import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { cartStore } from "../lib/cart-store";
import { useTapTracker } from "../lib/tap-tracker";
import { useState } from "react";
import type { OrderSummary } from "../lib/types";
import { foodImage } from "../lib/food-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Re:Bite — your usuals" },
      { name: "description", content: "Your weekly meal usuals, ready to reorder in one tap." },
    ],
  }),
  component: Home,
});

const USUAL_PALETTE = [
  { bg: "var(--brand-yellow)", chip: "var(--brand-coral)" },
  { bg: "var(--brand-mint)", chip: "var(--brand-lavender)" },
  { bg: "var(--brand-pink)", chip: "var(--brand-yellow)" },
];

function Home() {
  const navigate = useNavigate();
  const tracker = useTapTracker();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => api.getHistory(),
  });

  const usuals = (orders ?? []).filter((o) => o.is_weekly_usual);
  const others = (orders ?? []).filter((o) => !o.is_weekly_usual);

  async function handleReorder(o: OrderSummary) {
    setPendingId(o.order_id);
    const cart = await api.reorder(o.order_id);
    cart.issues.forEach((i) => tracker.noteEdgeCase(i.code));
    cartStore.setCart(cart);
    navigate({ to: "/review" });
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <header className="px-6 pt-8 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wed · 19 Jun</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          Hi Arjun <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Your usuals are ready. Tap to reorder.</p>
      </header>

      <section className="px-6 mt-2">
        <SectionHeader title="Your usuals" subtitle="Recurring weekly orders" />
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="mt-3 space-y-4">
            {usuals.map((o, idx) => (
              <UsualCard
                key={o.order_id}
                order={o}
                palette={USUAL_PALETTE[idx % USUAL_PALETTE.length]}
                onReorder={() => handleReorder(o)}
                loading={pendingId === o.order_id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="px-6 mt-8">
        <SectionHeader title="Order again" subtitle="From your recent history" />
        <div className="mt-3 space-y-2">
          {others.map((o) => (
            <MiniOrderRow
              key={o.order_id}
              order={o}
              onReorder={() => handleReorder(o)}
              loading={pendingId === o.order_id}
            />
          ))}
        </div>
        <Link
          to="/history"
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-border bg-muted/40 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          See all orders →
        </Link>
      </section>

      <ScenarioPicker />
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function UsualCard({
  order,
  palette,
  onReorder,
  loading,
}: {
  order: OrderSummary;
  palette: { bg: string; chip: string };
  onReorder: () => void;
  loading: boolean;
}) {
  const daysAgo = Math.max(1, Math.round((Date.now() - new Date(order.last_ordered_at).getTime()) / 86400000));
  return (
    <article
      className="relative rounded-[28px] p-5 overflow-hidden"
      style={{ backgroundColor: palette.bg }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-ink"
            style={{ backgroundColor: palette.chip }}
          >
            ⭐ Weekly usual
          </span>
          <h3 className="mt-3 text-xl font-extrabold text-brand-ink leading-tight">{order.restaurant_name}</h3>
          <p className="mt-1 text-sm text-brand-ink/70">
            Ordered <strong>{order.order_count}×</strong> · every {order.cadence_days} days
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex -space-x-2">
            {order.items_preview.slice(0, 3).map((it, i) => (
              <img
                key={i}
                src={foodImage(it.name)}
                alt={it.name}
                loading="lazy"
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-white bg-white"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-brand-ink/60">Last ordered</p>
          <p className="text-sm font-semibold text-brand-ink">{daysAgo}d ago · ₹{order.total}</p>
        </div>
        <button
          onClick={onReorder}
          disabled={loading}
          className="rounded-full bg-brand-ink text-primary-foreground px-6 py-3 text-sm font-bold shadow-lg shadow-black/10 transition active:scale-95 disabled:opacity-60"
        >
          {loading ? "…" : "Reorder →"}
        </button>
      </div>
    </article>
  );
}

function MiniOrderRow({
  order,
  onReorder,
  loading,
}: {
  order: OrderSummary;
  onReorder: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card border border-border/60 p-3">
      <img
        src={foodImage(order.items_preview[0]?.name ?? "")}
        alt={order.items_preview[0]?.name ?? "Item"}
        loading="lazy"
        width={48}
        height={48}
        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-muted"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-foreground">{order.restaurant_name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {order.items_preview.map((i) => i.name).join(" · ")} · ₹{order.total}
        </p>
      </div>
      <button
        onClick={onReorder}
        disabled={loading}
        className="rounded-full bg-foreground text-primary-foreground px-4 py-2 text-xs font-bold shrink-0 active:scale-95 disabled:opacity-60"
      >
        Reorder
      </button>
    </div>
  );
}

function SkeletonCard() {
  return <div className="mt-3 h-44 rounded-[28px] bg-muted animate-pulse" />;
}

const SCENARIOS = [
  "HAPPY",
  "ITEM_UNAVAILABLE",
  "PARTIAL_AVAILABILITY",
  "PRICE_CHANGED",
  "RESTAURANT_CLOSED",
  "RESTAURANT_OFFLINE",
  "ADDRESS_UNSERVICEABLE",
  "PAYMENT_EXPIRED",
  "MIN_ORDER_NOT_MET",
] as const;

function ScenarioPicker() {
  const current =
    typeof window === "undefined"
      ? "HAPPY"
      : new URLSearchParams(window.location.search).get("scenario") ?? "HAPPY";
  return (
    <details data-no-tap className="mx-6 mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
      <summary className="cursor-pointer font-semibold text-foreground">🧪 Demo: simulate edge case</summary>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SCENARIOS.map((s) => (
          <a
            key={s}
            href={s === "HAPPY" ? "/" : `/?scenario=${s}`}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold border ${
              current === s ? "bg-foreground text-primary-foreground border-foreground" : "bg-card border-border"
            }`}
          >
            {s}
          </a>
        ))}
      </div>
    </details>
  );
}
