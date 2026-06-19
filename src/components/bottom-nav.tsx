import { Link, useRouterState } from "@tanstack/react-router";

const TABS = [
  { to: "/" as const, label: "Home", icon: HomeIcon },
  { to: "/dashboard" as const, label: "Stats", icon: ChartIcon },
  { to: "/history" as const, label: "Orders", icon: ListIcon },
  { to: "/profile" as const, label: "Profile", icon: UserIcon },
];

const HIDDEN_ROUTES = new Set(["/review", "/confirmation"]);

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (HIDDEN_ROUTES.has(path)) return null;

  return (
    <nav
      aria-label="Primary"
      className="absolute left-3 right-3 z-30 rounded-full bg-brand-ink/95 backdrop-blur shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] px-2 py-2 flex items-center justify-around"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      {TABS.map((t) => {
        const active =
          t.to === "/" ? path === "/" : path === t.to || path.startsWith(t.to + "/");
        const Icon = t.icon;
        return (
          <Link
            key={t.to}
            to={t.to}
            className={`flex flex-col items-center gap-0.5 rounded-full py-2 px-4 text-[10px] font-bold transition ${
              active ? "bg-primary-foreground text-brand-ink" : "text-primary-foreground/70"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="w-5 h-5" />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}
function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="4" rx="1.5" />
      <rect x="3" y="11" width="18" height="4" rx="1.5" />
      <rect x="3" y="17" width="18" height="4" rx="1.5" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
