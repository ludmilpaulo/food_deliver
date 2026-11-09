import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { CartItem } from "../../services/types";
import { cartLineKey } from "../../features/food/lib/cartLines";

type BasketState = {
  items: CartItem[];
  hydrated: boolean;
};

const initialState: BasketState = {
  items: [],
  hydrated: false,
};

const BASKET_STORAGE_KEY = "kudya_basket";

export function loadBasketState(): BasketState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(BASKET_STORAGE_KEY);
    if (!raw) return { items: [], hydrated: false };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      return { items: parsed.items, hydrated: false };
    }
  } catch {}
  return { items: [], hydrated: false };
}

// Start with the initial reference so the empty pre-hydration state is never
// written to localStorage (which would wipe a previously saved cart).
let lastSavedItems: CartItem[] = initialState.items;
export function saveBasketState(state: BasketState): void {
  if (typeof window === "undefined") return;
  if (state.items === lastSavedItems) return;
  lastSavedItems = state.items;
  try {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify({ items: state.items }));
  } catch {}
}

type AddItemPayload = Omit<CartItem, "quantity"> & { quantity?: number };
type LinePayload = Pick<CartItem, "id"> &
  Partial<Pick<CartItem, "size" | "color" | "addon_ids" | "special_instructions">>;

function findLine(items: CartItem[], line: LinePayload): CartItem | undefined {
  const key = cartLineKey(line);
  return items.find((item) => cartLineKey(item) === key);
}

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    hydrateBasket: (state, action: PayloadAction<Pick<BasketState, "items">>) => {
      state.items = action.payload.items;
      state.hydrated = true;
    },
    addItem: (state, action: PayloadAction<AddItemPayload>) => {
      const { size, color } = action.payload;
      const existingItem = findLine(state.items, action.payload);
      if (existingItem) {
        existingItem.quantity = Number((existingItem.quantity + (action.payload.quantity || 1)).toFixed(3));
      } else {
        state.items.push({
          ...action.payload,
          size: size || "",
          color: color || "",
          quantity: action.payload.quantity || 1,
        });
      }
    },
    setItemQuantity: (state, action: PayloadAction<LinePayload & { quantity: number }>) => {
      const { quantity } = action.payload;
      const existingItem = findLine(state.items, action.payload);
      if (!existingItem) return;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item !== existingItem);
        return;
      }
      existingItem.quantity = Number(quantity.toFixed(3));
    },
    removeItem: (state, action: PayloadAction<LinePayload>) => {
      const existingItem = findLine(state.items, action.payload);
      const index = existingItem ? state.items.indexOf(existingItem) : -1;
      if (index !== -1) {
        if (state.items[index].quantity > 0.5) {
          state.items[index].quantity = Number((state.items[index].quantity - (state.items[index].selling_unit === "kg" || state.items[index].selling_unit === "litre" ? 0.5 : 1)).toFixed(3));
          if (state.items[index].quantity <= 0) {
            state.items.splice(index, 1);
          }
        } else {
          state.items.splice(index, 1);
        }
      }
    },
    // Remove an entire line (all quantities)
    removeLine: (state, action: PayloadAction<LinePayload>) => {
      const key = cartLineKey(action.payload);
      state.items = state.items.filter((item) => cartLineKey(item) !== key);
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
  hydrateBasket,
  addItem,
  removeItem,
  setItemQuantity,
  removeLine,
  clearCart,
  clearAllCart,
} = basketSlice.actions;
export const selectCartItems = (state: RootState) => state.basket.items;
export const selectBasketHydrated = (state: RootState) => state.basket.hydrated;

export default basketSlice.reducer;
