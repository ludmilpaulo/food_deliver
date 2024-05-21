// basketSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of a single meal item
interface Meals {
  id: number;
  price: number;
  quantity: number;
  resName: string;
  resImage: string;
  resId: number;
  // other properties ...
}

// Define the structure of the basket state
interface BasketState {
  items: Meals[];
}

// Define the initial state for the basket
const initialState: BasketState = {
  items: [],
};

// Create the basket slice
const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    updateBasket: (state, action: PayloadAction<Meals>) => {
      const foodItem = action.payload;
      const index = state.items.findIndex((item) => item.id === foodItem.id);

      if (index >= 0) {
        if (foodItem.quantity === 0) {
          state.items.splice(index, 1);
        } else {
          state.items[index] = foodItem;
        }
      } else if (foodItem.quantity > 0) {
        state.items.push(foodItem);
      }
    },
    // New reducer for clearing the cart
    clearCart: (state) => {
      state.items = [];
    },
  },
});

// Export action creators and selectors
export const { updateBasket, clearCart } = basketSlice.actions;
export const selectCartItems = (state: { basket: BasketState }) =>
  state.basket.items;
export const selectTotalPrice = (state: { basket: BasketState }) =>
  state.basket.items
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2);
export const selectTotalItems = (state: { basket: BasketState }) =>
  state.basket.items.reduce((total, item) => total + item.quantity, 0);

//export const selectTotalItems = (state: { basket: BasketState }) => state.basket.items

// Export the reducer
export default basketSlice.reducer;