// redux/slices/allProductsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseAPI, Product } from "@/services/types";
import { assertOkJson, unwrapListPayload } from "@/utils/unwrapListPayload";

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
    const data: unknown = await res.json();
    assertOkJson(res, data, "Failed to fetch products");
    return unwrapListPayload<Product>(data);
  },
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
        state.data = [];
        state.error = action.error.message || "Failed to fetch products";
      });
  },
});

export default allProductsSlice.reducer;
