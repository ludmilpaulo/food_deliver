"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { hydrateAuthFromStorage } from "./slices/authSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Restore auth after mount so the first client render matches SSR (user=null).
  useEffect(() => {
    store.dispatch(hydrateAuthFromStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
