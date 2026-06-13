"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { hydrateAuthFromStorage } from "./slices/authSlice";

let authHydrated = false;
function ensureAuthHydrated() {
  if (typeof window === "undefined" || authHydrated) return;
  store.dispatch(hydrateAuthFromStorage());
  authHydrated = true;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  ensureAuthHydrated();
  return <Provider store={store}>{children}</Provider>;
}
