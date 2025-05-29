import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { StoreType } from "@/services/types";

interface StoreTypeState {
  data: StoreType[];
  loading: boolean;
  error: string | null;
}

const initialState: StoreTypeState = {
  data: [],
  loading: false,
  error: null,
};

// No extra generics, let TS infer defaults
export const fetchStoreTypes = createAsyncThunk<StoreType[]>(
  "storeTypes/fetch",
  async () => {
    const response = await api.get<StoreType[]>("/store/store-types/");
    return response.data;
  }
);

const storeTypeSlice = createSlice({
  name: "storeTypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreTypes.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchStoreTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch store types";
      });
  },
});

export default storeTypeSlice.reducer;
