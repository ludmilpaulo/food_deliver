import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { CartItem } from "../../services/types";

type BasketState = {
  items: CartItem[];
};

const initialState: BasketState = {
  items: [],
};

type AddItemPayload = Omit<CartItem, "quantity"> & { quantity?: number };

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<AddItemPayload>) => {
      const { id, size, color } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.id === id &&
          (item.size || "") === (size || "") &&
          (item.color || "") === (color || "")
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({
          ...action.payload,
          size: size || "",
          color: color || "",
          quantity: action.payload.quantity || 1,
        });
      }
    },
    removeItem: (
      state,
      action: PayloadAction<{ id: number; size?: string; color?: string }>
    ) => {
      const { id, size = "", color = "" } = action.payload;
      const index = state.items.findIndex(
        (item) =>
          item.id === id &&
          (item.size || "") === size &&
          (item.color || "") === color
      );
      if (index !== -1) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
        } else {
          state.items.splice(index, 1);
        }
      }
    },
    // NEW: Remove entire item (all quantities)
    removeLine: (
      state,
      action: PayloadAction<{ id: number; size?: string; color?: string }>
    ) => {
      const { id, size = "", color = "" } = action.payload;
      state.items = state.items.filter(
        (item) =>
          !(
            item.id === id &&
            (item.size || "") === size &&
            (item.color || "") === color
          )
      );
    },
    clearCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.store !== action.payload);
    },
    clearAllCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItem,
  removeItem,
  removeLine, // <--- export new reducer
  clearCart,
  clearAllCart,
} = basketSlice.actions;
export const selectCartItems = (state: RootState) => state.basket.items;

export default basketSlice.reducer;
