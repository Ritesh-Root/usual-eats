import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { TapTrackerProvider, useTapTracker } from "../lib/tap-tracker";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Re:Bite — your usuals, one tap away" },
      { name: "description", content: "Frictionless weekly meal reorders. Two taps from craving to confirmed." },
      { property: "og:title", content: "Re:Bite — your usuals, one tap away" },
      { property: "og:description", content: "Frictionless weekly meal reorders. Two taps from craving to confirmed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <TapTrackerProvider>
        <AppFrame>
          <Outlet />
        </AppFrame>
      </TapTrackerProvider>
    </QueryClientProvider>
  );
}

function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_var(--brand-yellow)_0%,_var(--background)_55%)] p-3 sm:p-6">
      <div className="relative w-full max-w-[440px] min-h-[860px] rounded-[40px] bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] overflow-hidden border border-border/60">
        <TapBadge />
        <div className="h-full flex flex-col">{children}</div>
      </div>
    </div>
  );
}

function TapBadge() {
  const t = useTapTracker();
  if (!t.visible) {
    return (
      <button
        data-no-tap
        onClick={t.toggleVisible}
        className="absolute top-3 right-3 z-50 rounded-full bg-brand-ink/80 text-primary-foreground text-[10px] px-2 py-1 font-semibold tracking-wide"
        aria-label="Show tap counter"
      >
        SHOW TAPS
      </button>
    );
  }
  return (
    <div
      data-no-tap
      className="absolute top-3 right-3 z-50 flex items-center gap-2 rounded-full bg-brand-ink text-primary-foreground px-3 py-1.5 text-[11px] font-semibold shadow-lg"
    >
      <span className="opacity-70">TAPS</span>
      <span className="text-base font-bold tabular-nums">{t.taps}</span>
      <button onClick={t.reset} className="opacity-70 hover:opacity-100" aria-label="Reset tap counter">↻</button>
      <button onClick={t.toggleVisible} className="opacity-70 hover:opacity-100" aria-label="Hide tap counter">×</button>
    </div>
  );
}
