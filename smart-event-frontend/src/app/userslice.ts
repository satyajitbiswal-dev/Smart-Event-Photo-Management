import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "../types/types";
import privateapi, { publicapi } from "../services/AxiosService";
import axios from "axios";

type UserState = {
    userlist: User[];
    isLoading: boolean;
    error: unknown | null;
}

const initialState: UserState = {
    userlist: [],
    isLoading: false,
    error: null
}

export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async () => {
        const response = await publicapi.get('users/')
        return response.data?.results
    }
)

export const createUser = createAsyncThunk(
    'users/createEvent',
    async (data: Partial<User>, { rejectWithValue }) => {
        try {
            const response = await privateapi.post('admininterface/add_user/', data)
            console.log(response.data.user);
            return response.data.user
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data);
            }
            return rejectWithValue("Unknown error occurred");
        }
    }
)

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (username: string) => {
        const response = await privateapi.delete(`admininterface/remove-user/${username}/`)
        return username
    }
)

export const updateUser = createAsyncThunk<
    User,
    { username: string; data: Partial<User> }
>(
    "events/updateEvent",
    async ({ username, data }) => {
        const res = await privateapi.patch(`admininterface/update_user_role/${username}/`, data);
        return res.data.user;
    }
);


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.error = action.payload
        })
        builder.addCase(fetchUsers.pending, (state, action) => {
            state.isLoading = true;
        })
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.userlist = action.payload
            state.isLoading = false;
            state.error = null;
        })

        builder.addCase(createUser.fulfilled, (state, action) => {
            state.userlist.push(action.payload)
        })

        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.userlist = state.userlist.filter((user) => (user.username !== action.payload))
        })

        builder.addCase(updateUser.fulfilled, (state, action) => {
            const index = state.userlist.findIndex((e) => e.username === action.payload.username)
            if (index !== -1) {
                state.userlist[index] = action.payload;
            }
        });

    }
})

export default userSlice.reducer

