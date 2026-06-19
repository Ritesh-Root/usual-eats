import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, CreditCard, Settings, Receipt, type LucideIcon } from "lucide-react";
import { useUser, userStore } from "../lib/user-store";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · Re:Bite" }] }),
  component: Profile,
});

function Profile() {
  const user = useUser();
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <header className="px-6 pt-8 pb-4 bg-brand-yellow rounded-b-[32px]">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-ink/70 font-bold">Profile</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-ink text-primary-foreground grid place-items-center text-xl font-extrabold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-ink">{user.name}</h1>
            <p className="text-sm text-brand-ink/70">{user.phone}</p>
            <p className="text-xs text-brand-ink/60">{user.email}</p>
          </div>
        </div>
      </header>

      <section className="px-6 mt-6 grid grid-cols-3 gap-3 text-center">
        <Stat value={String(user.addresses.length)} label="Addresses" />
        <Stat value={String(user.payments.length)} label="Payments" />
        <Stat
          value={`${Math.round((Date.now() - new Date(user.joinedAt).getTime()) / 86400000)}d`}
          label="With us"
        />
      </section>

      <nav className="px-6 mt-6 space-y-2" aria-label="Profile sections">
        <Row to="/addresses" label="Saved addresses" sub={`${user.addresses.length} saved · default ${user.addresses.find((a) => a.id === user.defaultAddressId)?.label ?? "—"}`} Icon={MapPin} />
        <Row to="/payments" label="Payment methods" sub={`${user.payments.length} saved · default ${user.payments.find((p) => p.id === user.defaultPaymentId)?.label.split(" ")[0] ?? "—"}`} Icon={CreditCard} />
        <Row to="/settings" label="Preferences" sub="Notifications, language, dietary" Icon={Settings} />
        <Row to="/history" label="Order history" sub="All past orders" Icon={Receipt} />
      </nav>

      <div className="px-6 mt-6 space-y-2">
        <button
          onClick={() => userStore.reset()}
          className="w-full rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground"
        >
          Reset demo data
        </button>
        <button
          className="w-full rounded-2xl bg-brand-pink/40 py-3 text-sm font-bold text-brand-ink"
        >
          Sign out
        </button>
        <p className="text-center text-[11px] text-muted-foreground mt-4">Re:Bite · v1.0.0</p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 py-3">
      <p className="text-lg font-extrabold text-foreground tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
    </div>
  );
}

function Row({ to, label, sub, Icon }: { to: "/addresses" | "/payments" | "/settings" | "/history"; label: string; sub: string; Icon: LucideIcon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl bg-card border border-border/60 p-3 hover:bg-muted"
    >
      <span className="w-10 h-10 rounded-xl bg-brand-mint/60 grid place-items-center text-brand-ink">
        <Icon className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <span aria-hidden className="text-muted-foreground">›</span>
    </Link>
  );
}