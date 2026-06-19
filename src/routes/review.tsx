import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { cartStore } from "../lib/cart-store";
import { useTapTracker } from "../lib/tap-tracker";
import type { Issue, ReorderCart, Resolution } from "../lib/types";
import { foodImage } from "../lib/food-images";

export const Route = createFileRoute("/review")({
  head: () => ({ meta: [{ title: "Review your reorder · Re:Bite" }] }),
  component: Review,
});

function Review() {
  const navigate = useNavigate();
  const tracker = useTapTracker();
  const [cart, setCart] = useState<ReorderCart | null>(cartStore.getCart());
  const [placing, setPlacing] = useState(false);
  const [pickingAddress, setPickingAddress] = useState(false);
  const [pickingPayment, setPickingPayment] = useState(false);

  useEffect(() => {
    if (!cart) navigate({ to: "/" });
  }, [cart, navigate]);

  if (!cart) return null;

  async function resolve(resolutions: Resolution[]) {
    const next = await api.resolve(cart!.cart_id, resolutions);
    next.issues.forEach((i) => tracker.noteEdgeCase(i.code));
    cartStore.setCart(next);
    setCart(next);
  }

  async function placeOrder() {
    if (!cart!.ready_to_place || placing) return;
    setPlacing(true);
    const conf = await api.placeOrder(cart!.cart_id);
    cartStore.setConfirmation(conf);
    tracker.finalize(true);
    navigate({ to: "/confirmation" });
  }

  const blockers = cart.issues.filter((i) => i.severity === "blocker");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-border/60">
        <Link to="/" aria-label="Back" className="w-10 h-10 grid place-items-center rounded-full bg-muted text-foreground">
          ←
        </Link>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Review reorder</p>
          <h1 className="text-lg font-extrabold text-foreground leading-tight">{cart.restaurant.name}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {cart.issues.length > 0 && (
          <div className="space-y-2">
            {cart.issues.map((issue) => (
              <IssueBanner
                key={issue.code + (issue.item_id ?? "")}
                issue={issue}
                cart={cart}
                onResolve={resolve}
                onPickAddress={() => setPickingAddress(true)}
                onPickPayment={() => setPickingPayment(true)}
              />
            ))}
          </div>
        )}

        <section className="rounded-3xl bg-brand-mint/40 p-4">
          <h2 className="text-sm font-bold text-foreground mb-3">Your items</h2>
          <ul className="space-y-3">
            {cart.items.map((it) => (
              <li key={it.item_id} className="flex items-start gap-3">
                <img
                  src={foodImage(it.name)}
                  alt={it.name}
                  loading="lazy"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`font-semibold text-foreground ${!it.available ? "line-through opacity-60" : ""}`}>
                      {it.qty}× {it.name}
                    </p>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      ₹{it.unit_price * it.qty}
                    </p>
                  </div>
                  {it.customizations.length > 0 && (
                    <p className="text-xs text-muted-foreground">{it.customizations.join(" · ")}</p>
                  )}
                  {it.price_changed && (
                    <p className="text-[11px] mt-0.5 text-brand-coral font-semibold">
                      ₹{it.original_unit_price} → ₹{it.unit_price}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ContextRow
          label="Deliver to"
          title={cart.delivery_address.label}
          detail={cart.delivery_address.line}
          warn={!cart.delivery_address.serviceable}
          onChange={() => setPickingAddress(true)}
        />
        <ContextRow
          label="Pay with"
          title={cart.payment_method.label}
          detail={cart.payment_method.expired ? "Expired" : cart.payment_method.type}
          warn={cart.payment_method.expired}
          onChange={() => setPickingPayment(true)}
        />

        <section className="rounded-3xl bg-card border border-border/60 p-4 text-sm">
          <Row k="Subtotal" v={`₹${cart.subtotal}`} />
          <Row k="Delivery" v={`₹${cart.delivery_fee}`} />
          <div className="my-2 border-t border-dashed border-border" />
          <Row k="Total" v={`₹${cart.total}`} strong />
        </section>
      </div>

      <footer className="px-5 py-4 border-t border-border/60 bg-card">
        <button
          onClick={placeOrder}
          disabled={!cart.ready_to_place || placing}
          className="w-full rounded-2xl bg-brand-ink text-primary-foreground py-4 text-base font-extrabold transition active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground"
        >
          {placing
            ? "Placing…"
            : blockers.length > 0
              ? "Resolve issues to continue"
              : `Place order · ₹${cart.total}`}
        </button>
        <p className="text-center text-[11px] text-muted-foreground mt-2">
          Tap counted from app open: <strong>{tracker.taps}</strong>
        </p>
      </footer>

      {pickingAddress && (
        <PickerSheet
          title="Choose address"
          options={(cart.saved_addresses ?? []).map((a) => ({
            id: a.id,
            label: a.label,
            detail: a.line,
            disabled: !a.serviceable,
          }))}
          onSelect={(id) => {
            resolve([{ code: "ADDRESS_UNSERVICEABLE", action: "change_address", value: id }]);
            setPickingAddress(false);
          }}
          onClose={() => setPickingAddress(false)}
        />
      )}
      {pickingPayment && (
        <PickerSheet
          title="Choose payment"
          options={(cart.saved_payments ?? []).map((p) => ({
            id: p.id,
            label: p.label,
            detail: p.type,
            disabled: p.expired,
          }))}
          onSelect={(id) => {
            resolve([{ code: "PAYMENT_EXPIRED", action: "change_payment", value: id }]);
            setPickingPayment(false);
          }}
          onClose={() => setPickingPayment(false)}
        />
      )}
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${strong ? "text-base font-extrabold text-foreground" : "text-foreground/80"}`}>
      <span>{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}

function ContextRow({
  label,
  title,
  detail,
  warn,
  onChange,
}: {
  label: string;
  title: string;
  detail: string;
  warn?: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-3xl p-4 border ${
        warn ? "bg-brand-pink/30 border-brand-coral/40" : "bg-card border-border/60"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{detail}</p>
      </div>
      <button onClick={onChange} className="text-xs font-bold text-foreground underline underline-offset-4">
        Change
      </button>
    </div>
  );
}

function IssueBanner({
  issue,
  cart,
  onResolve,
  onPickAddress,
  onPickPayment,
}: {
  issue: Issue;
  cart: ReorderCart;
  onResolve: (r: Resolution[]) => void;
  onPickAddress: () => void;
  onPickPayment: () => void;
}) {
  const tone =
    issue.severity === "blocker"
      ? "bg-brand-pink text-brand-ink"
      : issue.severity === "warning"
        ? "bg-brand-yellow text-brand-ink"
        : "bg-brand-mint text-brand-ink";

  let actions: { label: string; onClick: () => void; primary?: boolean }[] = [];
  switch (issue.code) {
    case "ITEM_UNAVAILABLE": {
      const it = cart.items.find((i) => i.item_id === issue.item_id);
      if (it?.substitute) {
        actions.push({
          label: `Swap with ${it.substitute.name}`,
          primary: true,
          onClick: () => onResolve([{ code: "ITEM_UNAVAILABLE", item_id: it.item_id, action: "substitute" }]),
        });
      }
      actions.push({
        label: "Remove item",
        onClick: () => onResolve([{ code: "ITEM_UNAVAILABLE", item_id: issue.item_id, action: "remove" }]),
      });
      break;
    }
    case "PARTIAL_AVAILABILITY":
      actions.push({
        label: "Continue without it",
        primary: true,
        onClick: () => onResolve([{ code: "PARTIAL_AVAILABILITY", action: "drop_unavailable" }]),
      });
      break;
    case "PRICE_CHANGED":
      actions.push({
        label: "Got it, continue",
        primary: true,
        onClick: () => onResolve([{ code: "PRICE_CHANGED", item_id: issue.item_id, action: "ack" }]),
      });
      break;
    case "RESTAURANT_CLOSED":
      actions.push({
        label: `Schedule for ${cart.restaurant.next_open_slot ?? "next slot"}`,
        primary: true,
        onClick: () => onResolve([{ code: "RESTAURANT_CLOSED", action: "schedule", value: cart.restaurant.next_open_slot ?? "" }]),
      });
      break;
    case "RESTAURANT_OFFLINE":
      // dead-end avoided: send back home
      actions.push({ label: "Pick a different restaurant", primary: true, onClick: () => history.back() });
      break;
    case "ADDRESS_UNSERVICEABLE":
      actions.push({ label: "Change address", primary: true, onClick: onPickAddress });
      break;
    case "PAYMENT_EXPIRED":
      actions.push({ label: "Change payment", primary: true, onClick: onPickPayment });
      break;
    case "MIN_ORDER_NOT_MET":
      actions.push({
        label: "Add another item",
        primary: true,
        onClick: () => onResolve([{ code: "MIN_ORDER_NOT_MET", action: "bump_qty" }]),
      });
      break;
  }

  return (
    <div className={`rounded-2xl p-3 ${tone}`}>
      <div className="flex items-start gap-2">
        <span aria-hidden className="text-base leading-none mt-0.5">
          {issue.severity === "blocker" ? "🚧" : issue.severity === "warning" ? "⚠️" : "ℹ️"}
        </span>
        <p className="text-sm font-semibold flex-1">{issue.message}</p>
      </div>
      {actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                a.primary ? "bg-brand-ink text-primary-foreground" : "bg-white/70 text-brand-ink"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PickerSheet({
  title,
  options,
  onSelect,
  onClose,
}: {
  title: string;
  options: { id: string; label: string; detail: string; disabled?: boolean }[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-[28px] p-5 max-h-[70%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
        <h3 className="text-lg font-extrabold text-foreground mb-3">{title}</h3>
        <ul className="space-y-2">
          {options.map((o) => (
            <li key={o.id}>
              <button
                disabled={o.disabled}
                onClick={() => onSelect(o.id)}
                className="w-full text-left rounded-2xl border border-border p-3 hover:bg-muted disabled:opacity-50"
              >
                <p className="font-semibold text-foreground">{o.label}</p>
                <p className="text-xs text-muted-foreground">{o.detail}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}