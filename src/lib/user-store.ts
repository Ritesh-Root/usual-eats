import { useSyncExternalStore } from "react";

export interface Address {
  id: string;
  label: string;
  line: string;
  serviceable: boolean;
}

export interface PaymentMethod {
  id: string;
  label: string;
  type: "UPI" | "CARD" | "COD" | "WALLET";
  expired: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedAt: string;
  defaultAddressId: string;
  defaultPaymentId: string;
  addresses: Address[];
  payments: PaymentMethod[];
  preferences: {
    notifications: boolean;
    weeklyDigest: boolean;
    autoSchedule: boolean;
    veg: boolean;
    language: "en" | "hi";
  };
}

const KEY = "rebite.user.v1";

const DEFAULT_PROFILE: UserProfile = {
  id: "u_demo",
  name: "Arjun Mehta",
  phone: "+91 98765 43210",
  email: "arjun@rebite.app",
  joinedAt: new Date(Date.now() - 86400000 * 120).toISOString(),
  defaultAddressId: "a_home",
  defaultPaymentId: "p_upi",
  addresses: [
    { id: "a_home", label: "Home", line: "402, Sunshine Apts, Koramangala, Bengaluru", serviceable: true },
    { id: "a_work", label: "Work", line: "WeWork Galaxy, Residency Rd, Bengaluru", serviceable: true },
    { id: "a_mom", label: "Mom's", line: "12, Jayanagar 4th Block, Bengaluru", serviceable: true },
  ],
  payments: [
    { id: "p_upi", label: "GPay UPI · arjun@oksbi", type: "UPI", expired: false },
    { id: "p_card", label: "HDFC Credit Card ··4421", type: "CARD", expired: false },
    { id: "p_cod", label: "Cash on Delivery", type: "COD", expired: false },
  ],
  preferences: {
    notifications: true,
    weeklyDigest: true,
    autoSchedule: false,
    veg: false,
    language: "en",
  },
};

let state: UserProfile = load();
const listeners = new Set<() => void>();

function load(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export const userStore = {
  get(): UserProfile {
    return state;
  },
  setProfile(partial: Partial<UserProfile>) {
    state = { ...state, ...partial };
    emit();
  },
  setPreferences(partial: Partial<UserProfile["preferences"]>) {
    state = { ...state, preferences: { ...state.preferences, ...partial } };
    emit();
  },
  addAddress(a: Omit<Address, "id">) {
    const id = "a_" + Math.random().toString(36).slice(2, 8);
    state = { ...state, addresses: [...state.addresses, { ...a, id }] };
    emit();
    return id;
  },
  updateAddress(id: string, patch: Partial<Address>) {
    state = {
      ...state,
      addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    };
    emit();
  },
  removeAddress(id: string) {
    const next = state.addresses.filter((a) => a.id !== id);
    state = {
      ...state,
      addresses: next,
      defaultAddressId:
        state.defaultAddressId === id ? next[0]?.id ?? "" : state.defaultAddressId,
    };
    emit();
  },
  setDefaultAddress(id: string) {
    state = { ...state, defaultAddressId: id };
    emit();
  },
  addPayment(p: Omit<PaymentMethod, "id">) {
    const id = "p_" + Math.random().toString(36).slice(2, 8);
    state = { ...state, payments: [...state.payments, { ...p, id }] };
    emit();
    return id;
  },
  removePayment(id: string) {
    const next = state.payments.filter((p) => p.id !== id);
    state = {
      ...state,
      payments: next,
      defaultPaymentId:
        state.defaultPaymentId === id ? next[0]?.id ?? "" : state.defaultPaymentId,
    };
    emit();
  },
  setDefaultPayment(id: string) {
    state = { ...state, defaultPaymentId: id };
    emit();
  },
  reset() {
    state = DEFAULT_PROFILE;
    emit();
  },
  subscribe,
};

export function useUser(): UserProfile {
  return useSyncExternalStore(
    userStore.subscribe,
    () => state,
    () => DEFAULT_PROFILE,
  );
}