import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser, userStore } from "../lib/user-store";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Preferences · Re:Bite" }] }),
  component: Settings,
});

function Settings() {
  const user = useUser();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);

  function saveProfile() {
    userStore.setProfile({ name: name.trim() || user.name, phone, email });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-border/60">
        <Link to="/profile" aria-label="Back" className="w-10 h-10 grid place-items-center rounded-full bg-muted">
          ←
        </Link>
        <h1 className="text-lg font-extrabold text-foreground">Preferences</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5 pb-28 space-y-6">
        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Account
          </h2>
          <div className="rounded-2xl bg-card border border-border/60 p-4 space-y-3">
            <Field label="Full name" value={name} onChange={setName} />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <button
              onClick={saveProfile}
              className="w-full rounded-full bg-brand-ink text-primary-foreground py-2.5 text-sm font-bold"
            >
              Save changes
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Notifications
          </h2>
          <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border">
            <Toggle
              label="Order updates"
              sub="Confirmed, out for delivery, arrived"
              checked={user.preferences.notifications}
              onChange={(v) => userStore.setPreferences({ notifications: v })}
            />
            <Toggle
              label="Weekly digest"
              sub="A Sunday summary of your usuals"
              checked={user.preferences.weeklyDigest}
              onChange={(v) => userStore.setPreferences({ weeklyDigest: v })}
            />
            <Toggle
              label="Auto-schedule when closed"
              sub="Schedule for next open slot instead of failing"
              checked={user.preferences.autoSchedule}
              onChange={(v) => userStore.setPreferences({ autoSchedule: v })}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Dietary
          </h2>
          <div className="rounded-2xl bg-card border border-border/60">
            <Toggle
              label="Pure veg only"
              sub="Hide non-veg restaurants and items"
              checked={user.preferences.veg}
              onChange={(v) => userStore.setPreferences({ veg: v })}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            Language
          </h2>
          <div className="rounded-2xl bg-card border border-border/60 p-3 flex gap-2">
            {(["en", "hi"] as const).map((l) => (
              <button
                key={l}
                onClick={() => userStore.setPreferences({ language: l })}
                className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                  user.preferences.language === l
                    ? "bg-brand-ink text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {l === "en" ? "English" : "हिन्दी"}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
            About
          </h2>
          <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border text-sm">
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Support" value="hello@rebite.app" />
            <InfoRow label="Terms" value="rebite.app/terms" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full p-0.5 transition ${
          checked ? "bg-brand-ink" : "bg-muted"
        }`}
      >
        <span
          className={`block w-6 h-6 rounded-full bg-card transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}