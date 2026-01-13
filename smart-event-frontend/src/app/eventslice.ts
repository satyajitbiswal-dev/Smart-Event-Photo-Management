import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Event } from "../types/types";
import privateapi, { publicapi } from "../services/AxiosService";
import axios from "axios";

type EventInitialState = {
    events: Event []
    isLoading: boolean;
    error: unknown | null;
}

const initialState: EventInitialState = {
    events: [],
    isLoading: false,
    error: null
}

export const fetchEvents = createAsyncThunk(
    "events/fetchEvents",
    async () => {
        const response = await publicapi.get('event/')
        return response.data?.results
    }
)

export const createEvent = createAsyncThunk(
    'events/createEvent',
    async (data: Partial<Event>) => {
        try {
            const response = await privateapi.post('event/create/', data)
            console.log(response.data);
            return response.data
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(err.response?.data);
            }
            throw err;
        }
    }
)

export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (id: string) => {
        const response = await privateapi.delete(`event/${id}/delete/`)
        return id
    }
)

export const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchEvents.rejected, (state, action) => {
            state.error = action.payload;
        })
        builder.addCase(fetchEvents.pending, (state, action) => {
            state.isLoading = true;
        })
        builder.addCase(fetchEvents.fulfilled, (state, action) => {
            state.events = action.payload
            state.isLoading = false;
            state.error = null;
        })

        builder.addCase(createEvent.fulfilled, (state, action) => {
            state.events.push(action.payload)
        })

        builder.addCase(deleteEvent.fulfilled, (state, action) => {
            state.events = state.events.filter((event) => (event.id !== action.payload))
        })
    }
})

export default eventSlice.reducer

function rejectWithValue(data: any): any {
    throw new Error("Function not implemented.");
}
