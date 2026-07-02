"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { hydrateAuthFromStorage } from "./slices/authSlice";
import { adminDriversOperationsApi } from "./slices/adminDriversOperationsApi";
import { adminVehicleApi } from "./slices/adminVehicleApi";

// Restore auth synchronously on the client before children mount so RTK Query
// requests include the JWT (avoid SSR / first-paint 401s cached as errors).
if (typeof window !== "undefined") {
  store.dispatch(hydrateAuthFromStorage());
  store.dispatch(adminDriversOperationsApi.util.resetApiState());
  store.dispatch(adminVehicleApi.util.resetApiState());
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
