import type { OrderSummary, ReorderCart, Confirmation, OrderDetail, IssueCode, Resolution } from "./types";

const ADDRESSES = [
  { id: "a_home", label: "Home", line: "402, Sunshine Apts, Koramangala, Bengaluru", serviceable: true },
  { id: "a_work", label: "Work", line: "WeWork Galaxy, Residency Rd, Bengaluru", serviceable: true },
  { id: "a_mom", label: "Mom's", line: "12, Jayanagar 4th Block, Bengaluru", serviceable: true },
];

const PAYMENTS = [
  { id: "p_upi", label: "GPay UPI · arjun@oksbi", type: "UPI", expired: false },
  { id: "p_card", label: "HDFC Credit Card ··4421", type: "CARD", expired: false },
  { id: "p_cod", label: "Cash on Delivery", type: "COD", expired: false },
];

export const MOCK_HISTORY: OrderSummary[] = [
  {
    order_id: "o_1001",
    restaurant_id: "r_tiffin",
    restaurant_name: "Anjali's Home Tiffin",
    items_preview: [
      { name: "Veg Thali", emoji: "🍛" },
      { name: "Masala Chai", emoji: "🍵" },
    ],
    item_count: 3,
    total: 245,
    last_ordered_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    order_count: 24,
    is_weekly_usual: true,
    cadence_days: 7,
  },
  {
    order_id: "o_1002",
    restaurant_id: "r_southi",
    restaurant_name: "Sri Krishna Idli House",
    items_preview: [
      { name: "Masala Dosa", emoji: "🥞" },
      { name: "Filter Coffee", emoji: "☕" },
    ],
    item_count: 2,
    total: 180,
    last_ordered_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    order_count: 18,
    is_weekly_usual: true,
    cadence_days: 7,
  },
  {
    order_id: "o_1003",
    restaurant_id: "r_biryani",
    restaurant_name: "Paradise Biryani",
    items_preview: [
      { name: "Chicken Biryani", emoji: "🍗" },
      { name: "Raita", emoji: "🥣" },
    ],
    item_count: 2,
    total: 420,
    last_ordered_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    order_count: 6,
    is_weekly_usual: false,
    cadence_days: 0,
  },
  {
    order_id: "o_1004",
    restaurant_id: "r_pizza",
    restaurant_name: "Napoli Wood-Fired Pizza",
    items_preview: [
      { name: "Margherita", emoji: "🍕" },
    ],
    item_count: 1,
    total: 340,
    last_ordered_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    order_count: 2,
    is_weekly_usual: false,
    cadence_days: 0,
  },
];

// scenario forced via query string ?scenario=PRICE_CHANGED for demo
function getScenario(): IssueCode | "HAPPY" {
  if (typeof window === "undefined") return "HAPPY";
  const s = new URLSearchParams(window.location.search).get("scenario") as IssueCode | null;
  return s ?? "HAPPY";
}

function baseCart(sourceId: string): ReorderCart {
  const src = MOCK_HISTORY.find((o) => o.order_id === sourceId) ?? MOCK_HISTORY[0];
  return {
    cart_id: "c_" + Math.random().toString(36).slice(2, 8),
    source_order_id: src.order_id,
    restaurant: {
      id: src.restaurant_id,
      name: src.restaurant_name,
      is_open: true,
      next_open_slot: null,
      serviceable: true,
    },
    items: [
      {
        item_id: "i_1",
        name: src.items_preview[0]?.name ?? "Veg Thali",
        qty: 1,
        customizations: ["Less spicy", "Extra roti"],
        unit_price: 180,
        original_unit_price: 180,
        available: true,
        price_changed: false,
        emoji: src.items_preview[0]?.emoji ?? "🍛",
      },
      {
        item_id: "i_2",
        name: src.items_preview[1]?.name ?? "Masala Chai",
        qty: 2,
        customizations: ["No sugar"],
        unit_price: 30,
        original_unit_price: 30,
        available: true,
        price_changed: false,
        emoji: src.items_preview[1]?.emoji ?? "🍵",
      },
    ],
    delivery_address: ADDRESSES[0],
    payment_method: PAYMENTS[0],
    subtotal: 240,
    original_subtotal: 240,
    delivery_fee: 25,
    total: 265,
    min_order_value: 99,
    min_order_met: true,
    issues: [],
    ready_to_place: true,
    saved_addresses: ADDRESSES,
    saved_payments: PAYMENTS,
  };
}

function applyScenario(cart: ReorderCart, scenario: IssueCode | "HAPPY"): ReorderCart {
  switch (scenario) {
    case "ITEM_UNAVAILABLE":
      cart.items[0].available = false;
      cart.items[0].substitute = { item_id: "i_1b", name: "Paneer Thali", unit_price: 200 };
      cart.issues.push({
        code: "ITEM_UNAVAILABLE",
        severity: "blocker",
        message: `${cart.items[0].name} is sold out today.`,
        item_id: cart.items[0].item_id,
        suggested_action: "Swap with Paneer Thali or remove",
      });
      cart.ready_to_place = false;
      break;
    case "PARTIAL_AVAILABILITY":
      cart.items[1].available = false;
      cart.issues.push({
        code: "PARTIAL_AVAILABILITY",
        severity: "warning",
        message: `${cart.items[1].name} is unavailable. Continue with the rest?`,
        item_id: cart.items[1].item_id,
        suggested_action: "Drop unavailable item",
      });
      break;
    case "PRICE_CHANGED":
      cart.items[0].price_changed = true;
      cart.items[0].unit_price = 210;
      cart.subtotal = 270;
      cart.total = 295;
      cart.issues.push({
        code: "PRICE_CHANGED",
        severity: "warning",
        message: `Price updated: ${cart.items[0].name} ₹180 → ₹210`,
        item_id: cart.items[0].item_id,
        suggested_action: "Acknowledge new price",
      });
      break;
    case "RESTAURANT_CLOSED":
      cart.restaurant.is_open = false;
      cart.restaurant.next_open_slot = "Tomorrow, 8:00 AM";
      cart.issues.push({
        code: "RESTAURANT_CLOSED",
        severity: "blocker",
        message: `${cart.restaurant.name} is closed right now.`,
        suggested_action: "Schedule for tomorrow 8:00 AM",
      });
      cart.ready_to_place = false;
      break;
    case "RESTAURANT_OFFLINE":
      cart.restaurant.is_open = false;
      cart.restaurant.next_open_slot = null;
      cart.issues.push({
        code: "RESTAURANT_OFFLINE",
        severity: "blocker",
        message: `${cart.restaurant.name} has paused orders. Reorder isn't possible right now.`,
      });
      cart.ready_to_place = false;
      break;
    case "ADDRESS_UNSERVICEABLE":
      cart.delivery_address = { ...cart.delivery_address, serviceable: false };
      cart.issues.push({
        code: "ADDRESS_UNSERVICEABLE",
        severity: "blocker",
        message: `Restaurant doesn't deliver to ${cart.delivery_address.label}.`,
        suggested_action: "Switch saved address",
      });
      cart.ready_to_place = false;
      break;
    case "PAYMENT_EXPIRED":
      cart.payment_method = { ...cart.payment_method, expired: true };
      cart.issues.push({
        code: "PAYMENT_EXPIRED",
        severity: "blocker",
        message: `${cart.payment_method.label} has expired.`,
        suggested_action: "Pick another payment method",
      });
      cart.ready_to_place = false;
      break;
    case "MIN_ORDER_NOT_MET":
      cart.min_order_value = 350;
      cart.min_order_met = false;
      cart.issues.push({
        code: "MIN_ORDER_NOT_MET",
        severity: "blocker",
        message: `Add ₹${cart.min_order_value - cart.subtotal} more to reach the ₹${cart.min_order_value} minimum.`,
        suggested_action: "Bump quantity",
      });
      cart.ready_to_place = false;
      break;
  }
  return cart;
}

export function mockReorder(sourceId: string): ReorderCart {
  const cart = baseCart(sourceId);
  return applyScenario(cart, getScenario());
}

export function mockResolve(cart: ReorderCart, resolutions: Resolution[]): ReorderCart {
  // Apply each resolution and clear matching issues.
  const next: ReorderCart = JSON.parse(JSON.stringify(cart));
  for (const r of resolutions) {
    next.issues = next.issues.filter((i) => !(i.code === r.code && (!r.item_id || i.item_id === r.item_id)));
    switch (r.code) {
      case "ITEM_UNAVAILABLE": {
        const it = next.items.find((i) => i.item_id === r.item_id);
        if (!it) break;
        if (r.action === "remove") {
          next.items = next.items.filter((i) => i.item_id !== r.item_id);
        } else if (r.action === "substitute" && it.substitute) {
          it.item_id = it.substitute.item_id;
          it.name = it.substitute.name;
          it.unit_price = it.substitute.unit_price;
          it.original_unit_price = it.substitute.unit_price;
          it.available = true;
          it.substitute = null;
        }
        break;
      }
      case "PARTIAL_AVAILABILITY":
        next.items = next.items.filter((i) => i.available);
        break;
      case "PRICE_CHANGED": {
        const it = next.items.find((i) => i.item_id === r.item_id);
        if (it) it.price_changed = false;
        break;
      }
      case "RESTAURANT_CLOSED":
        next.restaurant.is_open = true; // scheduled
        break;
      case "ADDRESS_UNSERVICEABLE": {
        const addr = next.saved_addresses?.find((a) => a.id === r.value);
        if (addr) next.delivery_address = addr;
        break;
      }
      case "PAYMENT_EXPIRED": {
        const pay = next.saved_payments?.find((p) => p.id === r.value);
        if (pay) next.payment_method = pay;
        break;
      }
      case "MIN_ORDER_NOT_MET": {
        const first = next.items[0];
        if (first) first.qty += 1;
        break;
      }
    }
  }
  // Recompute totals
  next.subtotal = next.items.reduce((s, i) => s + i.unit_price * i.qty, 0);
  next.original_subtotal = next.items.reduce((s, i) => s + i.original_unit_price * i.qty, 0);
  next.min_order_met = next.subtotal >= next.min_order_value;
  if (!next.min_order_met && !next.issues.some((i) => i.code === "MIN_ORDER_NOT_MET")) {
    next.issues.push({
      code: "MIN_ORDER_NOT_MET",
      severity: "blocker",
      message: `Add ₹${next.min_order_value - next.subtotal} more to reach the ₹${next.min_order_value} minimum.`,
    });
  }
  next.total = next.subtotal + next.delivery_fee;
  next.ready_to_place = next.issues.every((i) => i.severity !== "blocker");
  return next;
}

export function mockHistory(): OrderSummary[] {
  return MOCK_HISTORY;
}

export function mockOrderDetail(id: string): OrderDetail {
  const o = MOCK_HISTORY.find((x) => x.order_id === id) ?? MOCK_HISTORY[0];
  return {
    ...o,
    items: baseCart(o.order_id).items,
  };
}

export function mockConfirmation(cart: ReorderCart): Confirmation {
  const scheduled = !cart.restaurant.is_open || !!cart.restaurant.next_open_slot;
  return {
    order_id: "ord_" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: scheduled ? "scheduled" : "confirmed",
    eta_minutes: scheduled ? undefined : 28,
    scheduled_for: scheduled ? cart.restaurant.next_open_slot ?? "Tomorrow, 8:00 AM" : null,
    total: cart.total,
  };
}