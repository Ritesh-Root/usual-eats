import type { Confirmation, OrderDetail, OrderSummary, ReorderCart, Resolution } from "./types";
import { mockConfirmation, mockHistory, mockOrderDetail, mockReorder, mockResolve } from "./mock";

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000/api";
const USER_ID = "u_demo";

async function call<T>(path: string, init: RequestInit, fallback: () => T): Promise<T> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(BASE + path, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": USER_ID,
        ...(init.headers || {}),
      },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  } catch {
    return fallback();
  }
}

// In-memory cart store keyed by cart_id so resolve/place can find it without a real backend
const cartStore = new Map<string, ReorderCart>();

export const api = {
  async getHistory(): Promise<OrderSummary[]> {
    const data = await call<{ orders: OrderSummary[] }>(
      "/orders/history",
      { method: "GET" },
      () => ({ orders: mockHistory() }),
    );
    return data.orders;
  },
  async getOrder(id: string): Promise<OrderDetail> {
    return call<OrderDetail>(`/orders/${id}`, { method: "GET" }, () => mockOrderDetail(id));
  },
  async reorder(sourceOrderId: string): Promise<ReorderCart> {
    const cart = await call<ReorderCart>(
      "/reorder",
      { method: "POST", body: JSON.stringify({ source_order_id: sourceOrderId }) },
      () => mockReorder(sourceOrderId),
    );
    cartStore.set(cart.cart_id, cart);
    return cart;
  },
  async resolve(cartId: string, resolutions: Resolution[]): Promise<ReorderCart> {
    const local = cartStore.get(cartId);
    const cart = await call<ReorderCart>(
      "/reorder/resolve",
      { method: "POST", body: JSON.stringify({ cart_id: cartId, resolutions }) },
      () => mockResolve(local!, resolutions),
    );
    cartStore.set(cart.cart_id, cart);
    return cart;
  },
  async placeOrder(cartId: string): Promise<Confirmation> {
    const local = cartStore.get(cartId);
    return call<Confirmation>(
      "/orders/place",
      { method: "POST", body: JSON.stringify({ cart_id: cartId }) },
      () => mockConfirmation(local!),
    );
  },
  async postMetrics(payload: {
    session_id: string;
    taps: number;
    duration_ms: number;
    completed: boolean;
    edge_cases: string[];
  }): Promise<void> {
    await call<unknown>(
      "/metrics/session",
      { method: "POST", body: JSON.stringify(payload) },
      () => ({}),
    );
  },
  _peekCart(cartId: string): ReorderCart | undefined {
    return cartStore.get(cartId);
  },
  _setCart(cart: ReorderCart) {
    cartStore.set(cart.cart_id, cart);
  },
};