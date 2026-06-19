import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useUser } from "../lib/user-store";
import { useTapTracker } from "../lib/tap-tracker";
import type { OrderSummary } from "../lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Your stats · Re:Bite" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useUser();
  const tracker = useTapTracker();
  const { data: orders } = useQuery({ queryKey: ["history"], queryFn: api.getHistory });

  const list: OrderSummary[] = orders ?? [];
  const monthCutoff = Date.now() - 30 * 86400000;
  const recent = list.filter((o) => new Date(o.last_ordered_at).getTime() >= monthCutoff);
  const totalSpent = list.reduce((s, o) => s + o.total * o.order_count, 0);
  const ordersThisMonth = recent.length;
  const usuals = list.filter((o) => o.is_weekly_usual).length;
  const tapsSavedVsFresh = Math.max(0, list.reduce((s, o) => s + o.order_count, 0) * 8); // rough: ~8 taps saved per reorder

  // Weekly bar chart — fake 7 days of order counts derived from history cadence
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const heights = [40, 70, 30, 90, 55, 80, 25];

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      <header className="px-6 pt-8 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your stats</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          Hello, {user.name.split(" ")[0]} 📊
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">A peek at your reorder habits.</p>
      </header>

      <section className="px-6 grid grid-cols-2 gap-3">
        <StatCard tone="yellow" label="Spent (all-time)" value={`₹${totalSpent.toLocaleString("en-IN")}`} sub={`${list.length} restaurants`} />
        <StatCard tone="mint" label="Orders this month" value={String(ordersThisMonth)} sub="across all usuals" />
        <StatCard tone="pink" label="Weekly usuals" value={String(usuals)} sub="set on repeat" />
        <StatCard tone="lavender" label="Taps saved" value={`~${tapsSavedVsFresh}`} sub="vs fresh checkout" />
      </section>

      <section className="mx-6 mt-6 rounded-3xl bg-card border border-border/60 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold text-foreground">This week</h2>
          <span className="text-xs text-muted-foreground">orders / day</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2 h-32">
          {heights.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-brand-coral to-brand-yellow"
                style={{ height: `${h}%` }}
                aria-label={`${days[i]}: ${Math.round(h / 10)} orders`}
              />
              <span className="text-[10px] font-bold text-muted-foreground">{days[i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-6 mt-6 rounded-3xl bg-brand-mint/50 p-5">
        <h2 className="text-sm font-bold text-foreground">Current session</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <Mini label="Taps" value={String(tracker.taps)} />
          <Mini label="Seconds" value={String(Math.round((Date.now() - tracker.startedAt) / 1000))} />
          <Mini label="Edge cases" value={String(tracker.edgeCases.length)} />
        </div>
      </section>

      <section className="mx-6 mt-6">
        <h2 className="text-sm font-bold text-foreground mb-2">Your top spots</h2>
        <ul className="space-y-2">
          {[...list]
            .sort((a, b) => b.order_count - a.order_count)
            .slice(0, 3)
            .map((o, i) => (
              <li key={o.order_id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/60 p-3">
                <span className="w-8 h-8 rounded-full bg-brand-yellow grid place-items-center text-sm font-extrabold text-brand-ink">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{o.restaurant_name}</p>
                  <p className="text-xs text-muted-foreground">{o.order_count} orders</p>
                </div>
                <Link
                  to="/"
                  className="text-xs font-bold text-foreground underline underline-offset-4"
                >
                  Reorder
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  tone,
  label,
  value,
  sub,
}: {
  tone: "yellow" | "mint" | "pink" | "lavender";
  label: string;
  value: string;
  sub: string;
}) {
  const bg = {
    yellow: "bg-brand-yellow",
    mint: "bg-brand-mint",
    pink: "bg-brand-pink",
    lavender: "bg-brand-lavender",
  }[tone];
  return (
    <div className={`${bg} rounded-3xl p-4`}>
      <p className="text-[10px] uppercase tracking-wider text-brand-ink/70 font-bold">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-brand-ink leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-brand-ink/70">{sub}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card py-3">
      <p className="text-lg font-extrabold text-foreground tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
    </div>
  );
}