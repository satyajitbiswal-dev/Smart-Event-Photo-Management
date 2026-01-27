import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import privateapi from "../services/AxiosService";


export const fetchPhotographerDashboard = createAsyncThunk(
  "photographer/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await privateapi.get("photos/photographer/dashboard/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || "Failed to fetch dashboard"
      );
    }
  }
);

type DashboardState = {
  summary: any | null;
  events: any[];
  loading: boolean;
};

const initialState: DashboardState = {
  summary: null,
  events: [],
  loading: false,
};

const photographerDashboardSlice = createSlice({
  name: "photographerDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotographerDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPhotographerDashboard.fulfilled, (state, action) => {
        state.summary = action.payload.summary;
        state.events = action.payload.events;
        state.loading = false;
      })
      .addCase(fetchPhotographerDashboard.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default photographerDashboardSlice.reducer;
