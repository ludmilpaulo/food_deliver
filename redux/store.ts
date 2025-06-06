import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import storeTypeReducer from "./slices/storeTypeSlice";
import basketReducer from "./slices/basketSlice";
import { aboutApi } from "./slices/aboutApi";
import storesReducer from "./slices/storesSlice";
import productsReducer from "./slices/productsSlice";
import authReducer from "./slices/authSlice";
import allStoresReducer from "./slices/allStoresSlice";
import allProductsReducer from "./slices/allProductsSlice";
import relatedProductsReducer from "./slices/relatedProductsSlice";


export const store = configureStore({
  reducer: {
    storeTypes: storeTypeReducer,
    basket: basketReducer,
    stores: storesReducer,
    allStores: allStoresReducer,
    products: productsReducer,
    auth: authReducer,
    allProducts: allProductsReducer,
    relatedProducts: relatedProductsReducer,
    [aboutApi.reducerPath]: aboutApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(aboutApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 👇 Use your store's type!
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
