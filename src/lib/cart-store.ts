// Tiny in-memory store of the latest cart so /review and /confirmation
// can render without round-tripping through router state.
import type { Confirmation, ReorderCart } from "./types";

let currentCart: ReorderCart | null = null;
let lastConfirmation: Confirmation | null = null;

export const cartStore = {
  setCart(c: ReorderCart) {
    currentCart = c;
  },
  getCart(): ReorderCart | null {
    return currentCart;
  },
  setConfirmation(c: Confirmation) {
    lastConfirmation = c;
  },
  getConfirmation(): Confirmation | null {
    return lastConfirmation;
  },
  clear() {
    currentCart = null;
  },
};