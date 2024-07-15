import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderTypes } from '@/services/types';

interface OrdersState {
  orders: OrderTypes[];
}

const initialState: OrdersState = {
  orders: [],
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<OrderTypes[]>) => {
      state.orders = action.payload;
    },
    updateOrder: (state, action: PayloadAction<OrderTypes>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
  },
});

export const { addOrder, updateOrder } = orderSlice.actions;
export default orderSlice.reducer;
