// redux/slices/allProductsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseAPI, Product } from "@/services/types";
import API from "@/services/api";

interface AllProductsState {
  data: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: AllProductsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchAllProducts = createAsyncThunk<Product[]>(
  "allProducts/fetchAll",
  async () => {
    const res = await fetch(`${baseAPI}/customer/products/all/`);
     const data = await res.json();
    return data;
  }
);

const allProductsSlice = createSlice({
  name: "allProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      });
  },
});

export default allProductsSlice.reducer;
