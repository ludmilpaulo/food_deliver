// slices/basketSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Meal = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type BasketState = {
  items: Meal[];
};

const initialState: BasketState = {
  items: [],
};

const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Meal>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
        } else {
          state.items.splice(index, 1);
        }
      }
    },
  },
});

export const { addItem, removeItem } = basketSlice.actions;
export default basketSlice.reducer;