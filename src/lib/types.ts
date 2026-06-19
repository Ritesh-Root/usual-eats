export type Severity = "blocker" | "warning" | "info";

export type IssueCode =
  | "ITEM_UNAVAILABLE"
  | "PARTIAL_AVAILABILITY"
  | "PRICE_CHANGED"
  | "RESTAURANT_CLOSED"
  | "RESTAURANT_OFFLINE"
  | "ADDRESS_UNSERVICEABLE"
  | "PAYMENT_EXPIRED"
  | "MIN_ORDER_NOT_MET";

export interface Issue {
  code: IssueCode;
  severity: Severity;
  message: string;
  item_id?: string;
  suggested_action?: string;
}

export interface ItemPreview {
  name: string;
  emoji?: string;
}

export interface OrderSummary {
  order_id: string;
  restaurant_id: string;
  restaurant_name: string;
  items_preview: ItemPreview[];
  item_count: number;
  total: number;
  last_ordered_at: string;
  order_count: number;
  is_weekly_usual: boolean;
  cadence_days: number;
}

export interface CartItem {
  item_id: string;
  name: string;
  qty: number;
  customizations: string[];
  unit_price: number;
  original_unit_price: number;
  available: boolean;
  price_changed: boolean;
  substitute?: { item_id: string; name: string; unit_price: number } | null;
  emoji?: string;
}

export interface ReorderCart {
  cart_id: string;
  source_order_id: string;
  restaurant: {
    id: string;
    name: string;
    is_open: boolean;
    next_open_slot?: string | null;
    serviceable: boolean;
  };
  items: CartItem[];
  delivery_address: { id: string; label: string; line: string; serviceable: boolean };
  payment_method: { id: string; label: string; type: string; expired: boolean };
  subtotal: number;
  original_subtotal: number;
  delivery_fee: number;
  total: number;
  min_order_value: number;
  min_order_met: boolean;
  issues: Issue[];
  ready_to_place: boolean;
  saved_addresses?: { id: string; label: string; line: string; serviceable: boolean }[];
  saved_payments?: { id: string; label: string; type: string; expired: boolean }[];
}

export interface Resolution {
  code: IssueCode;
  item_id?: string;
  action: string;
  value?: string;
}

export interface Confirmation {
  order_id: string;
  status: "confirmed" | "scheduled";
  eta_minutes?: number;
  scheduled_for?: string | null;
  total: number;
}

export interface OrderDetail extends OrderSummary {
  items: CartItem[];
}