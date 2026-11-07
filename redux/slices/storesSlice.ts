// redux/slices/storesSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Store } from '@/services/types';
import API from '@/services/api';
import {
  MarketplaceVertical,
  normalizeV1Stores,
  verticalApiPath,
} from '@/features/marketplace/lib/normalizeStores';

interface StoresState {
  data: Store[];
  loading: boolean;
  error: string | null;
  vertical: MarketplaceVertical | null;
}

const initialState: StoresState = {
  data: [],
  loading: false,
  error: null,
  vertical: null,
};

export const fetchStoresByType = createAsyncThunk<
  Store[],
  number | { storeTypeId: number; latitude?: number; longitude?: number; search?: string }
>(
  'stores/fetchByType',
  async (arg) => {
    const storeTypeId = typeof arg === 'number' ? arg : arg.storeTypeId;
    const params = new URLSearchParams({ store_type: String(storeTypeId) });
    if (typeof arg !== 'number') {
      if (arg.latitude != null) params.set('latitude', String(arg.latitude));
      if (arg.longitude != null) params.set('longitude', String(arg.longitude));
      if (arg.search) params.set('search', arg.search);
    }
    const response = await API.get(`/store/stores/?${params.toString()}`);
    const data: unknown = response.data;
    if (Array.isArray(data)) return data as Store[];
    if (data && typeof data === 'object') {
      const record = data as { stores?: Store[]; results?: Store[] };
      return record.stores ?? record.results ?? [];
    }
    return [];
  }
);

export const fetchStoresByVertical = createAsyncThunk<Store[], MarketplaceVertical>(
  'stores/fetchByVertical',
  async (vertical) => {
    const response = await API.get(verticalApiPath(vertical));
    return normalizeV1Stores(response.data);
  }
);

export const fetchAllStoresList = createAsyncThunk<Store[]>(
  'stores/fetchAllList',
  async () => {
    const response = await API.get('/store/stores/');
    return normalizeV1Stores(response.data);
  }
);

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoresByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoresByType.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchStoresByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stores';
      })
      .addCase(fetchStoresByVertical.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.vertical = action.meta.arg;
      })
      .addCase(fetchStoresByVertical.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.vertical = action.meta.arg;
      })
      .addCase(fetchStoresByVertical.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stores';
      })
      .addCase(fetchAllStoresList.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.vertical = null;
      })
      .addCase(fetchAllStoresList.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.vertical = null;
      })
      .addCase(fetchAllStoresList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stores';
      });
  },
});

export default storesSlice.reducer;
