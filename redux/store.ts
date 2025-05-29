import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import storeTypeReducer from "./slices/storeTypeSlice";
import basketReducer from "./slices/basketSlice";

// No combineReducers needed unless you have complex reducers.
// This reducer shape is best for TS type inference!
export const store = configureStore({
  reducer: {
    storeTypes: storeTypeReducer,
    basket: basketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// THE MOST IMPORTANT LINE!
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
