import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import API from "../../services/api";
// TODO: Ensure 'Review' is exported from '../../services/types' or import the correct type
// import { Review } from "../../services/types";
type Review = {
  // Define the Review type here as a temporary fix
  id: number;
  productId: number;
  rating: number;
  comment: string;
  // Add other fields as needed
};

interface ReviewsState {
  data: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchReviewsByProduct = createAsyncThunk(
  "reviews/fetchReviewsByProduct",
  async (productId: number): Promise<Review[]> => {
    const res = await API.get(`/store/reviews/?product=${productId}`);
    return res.data;
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchReviewsByProduct.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchReviewsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reviews";
      });
  },
});

export default reviewsSlice.reducer;
