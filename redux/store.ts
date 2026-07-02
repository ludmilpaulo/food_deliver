import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import locationReducer from "./slices/locationSlice";
import driverLocationReducer from "./slices/driverLocationSlice";
import storeTypeReducer from "./slices/storeTypeSlice";
import basketReducer, { saveBasketState } from "./slices/basketSlice";
import { aboutApi } from "./slices/aboutApi";
import storesReducer from "./slices/storesSlice";
import productsReducer from "./slices/productsSlice";
import authReducer from "./slices/authSlice";
import allStoresReducer from "./slices/allStoresSlice";
import allProductsReducer from "./slices/allProductsSlice";
import relatedProductsReducer from "./slices/relatedProductsSlice";
import servicesReducer from "./slices/servicesSlice";
import { doctorApi, appointmentsApi, adminDoctorApi } from "./slices/doctorApi";
import { adminDriverApi } from "./slices/driverAdminApi";
import { healthcareApi } from "./slices/healthcareApi";
import { notificationApi } from "./slices/notificationApi";
import { languageApi } from "./slices/languageApi";
import { adminDriversOperationsApi } from "./slices/adminDriversOperationsApi";
import { adminVehicleApi } from "./slices/adminVehicleApi";
import { marketplaceApi } from "./slices/marketplaceApi";


export const store = configureStore({
  reducer: {
    storeTypes: storeTypeReducer,
    location: locationReducer,
    driverLocation: driverLocationReducer,
    basket: basketReducer,
    stores: storesReducer,
    allStores: allStoresReducer,
    products: productsReducer,
    auth: authReducer,
    allProducts: allProductsReducer,
    relatedProducts: relatedProductsReducer,
    services: servicesReducer,
    [aboutApi.reducerPath]: aboutApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [healthcareApi.reducerPath]: healthcareApi.reducer,
    [appointmentsApi.reducerPath]: appointmentsApi.reducer,
    [adminDoctorApi.reducerPath]: adminDoctorApi.reducer,
    [adminDriverApi.reducerPath]: adminDriverApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [languageApi.reducerPath]: languageApi.reducer,
    [adminVehicleApi.reducerPath]: adminVehicleApi.reducer,
    [adminDriversOperationsApi.reducerPath]: adminDriversOperationsApi.reducer,
    [marketplaceApi.reducerPath]: marketplaceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(aboutApi.middleware)
      .concat(doctorApi.middleware)
      .concat(healthcareApi.middleware)
      .concat(appointmentsApi.middleware)
      .concat(adminDoctorApi.middleware)
      .concat(adminDriverApi.middleware)
      .concat(notificationApi.middleware)
      .concat(languageApi.middleware)
      .concat(adminVehicleApi.middleware)
      .concat(adminDriversOperationsApi.middleware)
      .concat(marketplaceApi.middleware),
});

// Keep the cart in localStorage so it survives reloads and login redirects.
// (Hydration from localStorage happens after mount in ClientRoot to avoid
// SSR hydration mismatches.)
store.subscribe(() => {
  saveBasketState(store.getState().basket);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 👇 Use your store's type!
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
