import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { cartStore } from "../lib/cart-store";
import { useTapTracker } from "../lib/tap-tracker";
import type { OrderSummary } from "../lib/types";
import { foodImage } from "../lib/food-images";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Order history · Re:Bite" }] }),
  component: History,
});

function History() {
  const navigate = useNavigate();
  const tracker = useTapTracker();
  const [pending, setPending] = useState<string | null>(null);
  const { data: orders, isLoading } = useQuery({ queryKey: ["history"], queryFn: api.getHistory });

  async function handleReorder(o: OrderSummary) {
    setPending(o.order_id);
    const cart = await api.reorder(o.order_id, o);
    cart.issues.forEach((i) => tracker.noteEdgeCase(i.code));
    cartStore.setCart(cart);
    navigate({ to: "/review" });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-border/60">
        <Link to="/" aria-label="Back" className="w-10 h-10 grid place-items-center rounded-full bg-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-foreground">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-extrabold text-foreground">Order history</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5 pb-28 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {orders?.map((o) => (
          <article key={o.order_id} className="rounded-2xl bg-card border border-border/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <img
                src={foodImage(o.items_preview[0]?.name ?? "")}
                alt={o.items_preview[0]?.name ?? "Item"}
                loading="lazy"
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-muted"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground truncate">{o.restaurant_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {o.items_preview.map((i) => i.name).join(" · ")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(o.last_ordered_at).toLocaleDateString()} · ₹{o.total} · ordered {o.order_count}×
                </p>
              </div>
              <button
                onClick={() => handleReorder(o)}
                disabled={pending === o.order_id}
                className="rounded-full bg-brand-ink text-primary-foreground px-4 py-2 text-xs font-bold shrink-0 active:scale-95 disabled:opacity-60"
              >
                {pending === o.order_id ? "…" : "Reorder"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}