import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Event, User } from "../types/types";
import privateapi, { publicapi } from "../services/AxiosService";
import axios from "axios";
import { authSlice } from "./authslice";

type EventInitialState = {
    events: Event []
    isLoading: boolean;
    error: unknown | null;
    selectedEvent: Event | null;
    selectedEventloading: boolean;
    selectedEventError: string | null;
}

const initialState: EventInitialState = {
    events: [],
    isLoading: false,
    error: null,
    selectedEvent: null,
    selectedEventloading: false,
    selectedEventError : null
}

export const fetchEvents = createAsyncThunk(
    "events/fetchEvents",
    async () => {
        const response = await publicapi.get('event/')
        return response.data
    }
)

export const createEvent = createAsyncThunk(
    'events/createEvent',
    async (data: Partial<Event> , {rejectWithValue}) => {
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

export const selectEvent = createAsyncThunk(
    'event/selectedEvent',
    async(id : string,{rejectWithValue}) => {
        try {
            const response = await publicapi.get(`event/${id}/`)
        return response.data
        } catch (err:any) {
            return rejectWithValue(
            err.response?.data?.detail || 'Event not found'
      );
        }
    }
)


export const updateEvent = createAsyncThunk(
    'event/updateEvent',
    async ({id, data}: {id: string , data: Partial<Event>} , {rejectWithValue}) =>{
        try {
            const updatedEvent = await privateapi.patch(`event/${id}/update/`, data)
            return updatedEvent.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Update failed');
        }
    }
)

export const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {
        cleardispatchEvent:(state)=>{
            state.selectedEvent=null
        }
    },
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
        
        // event details
        builder.addCase(selectEvent.rejected, (state, action) => {
            state.selectedEventError = action.payload as string
        })
        builder.addCase(selectEvent.pending, (state, action) => {
            state.selectedEventloading = true;
        })
        builder.addCase(selectEvent.fulfilled, (state, action) => {
            state.selectedEvent = action.payload ;
            state.selectedEventloading = false;
            state.selectedEventError = null;
        })

        builder.addCase(updateEvent.fulfilled,(state, action) => {
            const index = state.events.findIndex((e) => e.id === action.payload.id)
            if(index !== -1) {
                state.events[index] = action.payload
            }
        })


    }
})

export default eventSlice.reducer
export const {cleardispatchEvent}  = eventSlice.actions
