import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useUser, userStore } from "../lib/user-store";

export const Route = createFileRoute("/addresses")({
  head: () => ({ meta: [{ title: "Saved addresses · Re:Bite" }] }),
  component: Addresses,
});

function Addresses() {
  const user = useUser();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");

  function save() {
    if (!label.trim() || !line.trim()) return;
    const id = userStore.addAddress({ label: label.trim(), line: line.trim(), serviceable: true });
    if (!user.defaultAddressId) userStore.setDefaultAddress(id);
    setLabel("");
    setLine("");
    setAdding(false);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-border/60">
        <Link to="/profile" aria-label="Back" className="w-10 h-10 grid place-items-center rounded-full bg-muted">
          ←
        </Link>
        <h1 className="text-lg font-extrabold text-foreground">Saved addresses</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5 pb-28 space-y-3">
        {user.addresses.map((a) => {
          const isDefault = a.id === user.defaultAddressId;
          return (
            <article key={a.id} className="rounded-2xl bg-card border border-border/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{a.label}</p>
                    {isDefault && (
                      <span className="rounded-full bg-brand-mint px-2 py-0.5 text-[10px] font-bold text-brand-ink uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{a.line}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {!isDefault && (
                  <button
                    onClick={() => userStore.setDefaultAddress(a.id)}
                    className="rounded-full bg-foreground text-primary-foreground px-3 py-1.5 text-xs font-bold"
                  >
                    Make default
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Remove "${a.label}"?`)) userStore.removeAddress(a.id);
                  }}
                  disabled={user.addresses.length === 1}
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
            <h2 className="font-bold text-foreground">Add address</h2>
            <label className="block">
              <span className="text-xs font-semibold text-foreground">Label</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Office, Gym…"
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-foreground">Full address</span>
              <textarea
                value={line}
                onChange={(e) => setLine(e.target.value)}
                rows={2}
                placeholder="House, street, area, city"
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
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
            + Add new address
          </button>
        )}
      </div>
    </div>
  );
}