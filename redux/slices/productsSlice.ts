// redux/slices/productsSlice.ts

import { Product } from '@/services/types';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api'; // Adjust the import path as necessary

interface ProductsState {
  data: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchProductsByStore = createAsyncThunk<Product[], number>(
  'products/fetchByStore',
  async (storeId: number) => {
    const resp = await API.get(`/store/products/by_store/?store=${storeId}`);
    return resp.data;
  }
);


const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByStore.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export default productsSlice.reducer;
