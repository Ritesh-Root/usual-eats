import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Smartphone, CreditCard, Wallet, Banknote, type LucideIcon } from "lucide-react";
import { useUser, userStore, type PaymentMethod } from "../lib/user-store";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payment methods · Re:Bite" }] }),
  component: Payments,
});

const TYPES: { value: PaymentMethod["type"]; label: string; Icon: LucideIcon }[] = [
  { value: "UPI", label: "UPI", Icon: Smartphone },
  { value: "CARD", label: "Card", Icon: CreditCard },
  { value: "WALLET", label: "Wallet", Icon: Wallet },
  { value: "COD", label: "Cash", Icon: Banknote },
];

function Payments() {
  const user = useUser();
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<PaymentMethod["type"]>("UPI");
  const [label, setLabel] = useState("");

  function save() {
    if (!label.trim()) return;
    const id = userStore.addPayment({ type, label: label.trim(), expired: false });
    if (!user.defaultPaymentId) userStore.setDefaultPayment(id);
    setLabel("");
    setAdding(false);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-border/60">
        <Link to="/profile" aria-label="Back" className="w-10 h-10 grid place-items-center rounded-full bg-muted">
          ←
        </Link>
        <h1 className="text-lg font-extrabold text-foreground">Payment methods</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5 pb-28 space-y-3">
        {user.payments.map((p) => {
          const isDefault = p.id === user.defaultPaymentId;
          const Icon = TYPES.find((t) => t.value === p.type)?.Icon ?? CreditCard;
          return (
            <article
              key={p.id}
              className={`rounded-2xl p-4 border ${
                p.expired ? "bg-brand-pink/30 border-brand-coral/50" : "bg-card border-border/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-mint/60 grid place-items-center text-brand-ink shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{p.label}</p>
                    {isDefault && (
                      <span className="rounded-full bg-brand-mint px-2 py-0.5 text-[10px] font-bold text-brand-ink uppercase">
                        Default
                      </span>
                    )}
                    {p.expired && (
                      <span className="rounded-full bg-brand-coral text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.type}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {!isDefault && !p.expired && (
                  <button
                    onClick={() => userStore.setDefaultPayment(p.id)}
                    className="rounded-full bg-foreground text-primary-foreground px-3 py-1.5 text-xs font-bold"
                  >
                    Make default
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Remove "${p.label}"?`)) userStore.removePayment(p.id);
                  }}
                  disabled={user.payments.length === 1}
                  className="rounded-full bg-muted text-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}

        {adding ? (
          <div className="rounded-2xl bg-brand-yellow/40 p-4 space-y-3 border border-brand-yellow">
            <h2 className="font-bold text-foreground">Add payment method</h2>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-xl py-2 text-xs font-bold border ${
                    type === t.value
                      ? "bg-brand-ink text-primary-foreground border-brand-ink"
                      : "bg-card border-border"
                  }`}
                >
                  <span className="block text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-foreground">Display label</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={
                  type === "UPI" ? "name@bank" : type === "CARD" ? "Visa ··1234" : "Paytm wallet"
                }
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
            <p className="text-[11px] text-muted-foreground">
              Demo only — no real card data is collected. In production this would go through your PCI-compliant provider.
            </p>
            <div className="flex gap-2">
              <button
                onClick={save}
                className="flex-1 rounded-full bg-brand-ink text-primary-foreground py-2 text-sm font-bold"
              >
                Save
              </button>
              <button
                onClick={() => setAdding(false)}
                className="rounded-full bg-card border border-border px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-2xl border-2 border-dashed border-border bg-muted/40 py-4 text-sm font-bold text-foreground"
          >
            + Add payment method
          </button>
        )}
      </div>
    </div>
  );
}