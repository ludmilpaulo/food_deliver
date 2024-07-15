import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import basketReducer from './slices/basketSlice';
import orderReducer from './slices/orderSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  basket: basketReducer,
  orders: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
