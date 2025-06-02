// redux/slices/allStoresSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Store } from "@/services/types";
import { baseAPI } from "@/services/types";

interface AllStoresState {
  data: Store[];
  loading: boolean;
  error: string | null;
}
const initialState: AllStoresState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchAllStores = createAsyncThunk<Store[]>(
  "allStores/fetchAll",
  async () => {
    const response = await fetch(`${baseAPI}/customer/customer/stores/`);
    const data = await response.json();
    // Only approved stores
    return data.stores.filter((s: Store) => s.is_approved);
  }
);

const allStoresSlice = createSlice({
  name: "allStores",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStores.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load stores";
      });
  },
});
export default allStoresSlice.reducer;
