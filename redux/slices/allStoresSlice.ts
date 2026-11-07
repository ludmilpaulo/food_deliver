import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Store } from "@/services/types";
import { fetchStoreCatalog, type StoreCatalogParams } from "@/services/storeCatalog";

interface AllStoresState {
  data: Store[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: AllStoresState = {
  data: [],
  count: 0,
  loading: false,
  error: null,
};

export const fetchAllStores = createAsyncThunk<
  { stores: Store[]; count: number },
  StoreCatalogParams | undefined
>("allStores/fetchAll", async (params) => {
  const result = await fetchStoreCatalog(params ?? {});
  return { stores: result.stores, count: result.count };
});

const allStoresSlice = createSlice({
  name: "allStores",
  initialState,
  reducers: {
    clearStores: (state) => {
      state.data = [];
      state.count = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStores.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.stores;
        state.count = action.payload.count;
      })
      .addCase(fetchAllStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load stores";
      });
  },
});

export const { clearStores } = allStoresSlice.actions;
export default allStoresSlice.reducer;
