import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api } from "./api";

interface TapState {
  taps: number;
  startedAt: number;
  sessionId: string;
  edgeCases: string[];
  visible: boolean;
}

interface TapAPI extends TapState {
  tap: (label?: string) => void;
  noteEdgeCase: (code: string) => void;
  reset: () => void;
  toggleVisible: () => void;
  finalize: (completed: boolean) => void;
}

const Ctx = createContext<TapAPI | null>(null);

function newSession(): TapState {
  return {
    taps: 0,
    startedAt: Date.now(),
    sessionId: "s_" + Math.random().toString(36).slice(2, 10),
    edgeCases: [],
    visible: true,
  };
}

export function TapTrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TapState>(() => newSession());
  const finalized = useRef(false);

  const tap = useCallback(() => {
    setState((s) => ({ ...s, taps: s.taps + 1 }));
  }, []);

  const noteEdgeCase = useCallback((code: string) => {
    setState((s) => (s.edgeCases.includes(code) ? s : { ...s, edgeCases: [...s.edgeCases, code] }));
  }, []);

  const reset = useCallback(() => {
    finalized.current = false;
    setState(newSession());
  }, []);

  const toggleVisible = useCallback(() => {
    setState((s) => ({ ...s, visible: !s.visible }));
  }, []);

  const finalize = useCallback(
    (completed: boolean) => {
      if (finalized.current) return;
      finalized.current = true;
      void api.postMetrics({
        session_id: state.sessionId,
        taps: state.taps,
        duration_ms: Date.now() - state.startedAt,
        completed,
        edge_cases: state.edgeCases,
      });
    },
    [state],
  );

  // Global click counter — every click on an interactive element counts.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const interactive = t.closest("button, a, [role='button'], input, select, [data-tap]");
      if (!interactive) return;
      if (interactive.closest("[data-no-tap]")) return;
      setState((s) => ({ ...s, taps: s.taps + 1 }));
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const value = useMemo<TapAPI>(
    () => ({ ...state, tap, noteEdgeCase, reset, toggleVisible, finalize }),
    [state, tap, noteEdgeCase, reset, toggleVisible, finalize],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTapTracker(): TapAPI {
  const v = useContext(Ctx);
  if (!v) throw new Error("TapTrackerProvider missing");
  return v;
}