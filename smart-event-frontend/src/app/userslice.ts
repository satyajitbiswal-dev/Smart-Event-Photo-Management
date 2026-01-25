import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/types";
import privateapi, { publicapi } from "../services/AxiosService";
import axios from "axios";

type UserState = {
    userlist: User[];
    isLoading: boolean;
    error: unknown | null;
    userbyEmails: Record<string, User>
}

const initialState: UserState = {
    userlist: [],
    isLoading: false,
    error: null,
    userbyEmails:{}
}

export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async () => {
        const response = await publicapi.get('users/')
        return response.data
    }
)

export const createUser = createAsyncThunk(
    'users/createEvent',
    async (data: Partial<User>, { rejectWithValue }) => {
        try {
            const response = await privateapi.post('admininterface/add_user/', data)
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
    async (email: string) => {
        const response = await privateapi.delete(`admininterface/remove-user/${email}/`)
        return email
    }
)

export const updateUser = createAsyncThunk<
    User,
    { email: string; data: Partial<User> }
>(
    "events/updateEvent",
    async ({ email, data }) => {
        const res = await privateapi.patch(`admininterface/update_user_role/${email}/`, data);
        return res.data.user;
    }
);


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
         upsertUsers: (state, action: PayloadAction<User[]>) => {
            action.payload.forEach(user => {
                state.userbyEmails[user.email] = user;

                const index = state.userlist.findIndex(
                u => u.email === user.email
                );

                if (index === -1) {
                state.userlist.push(user);
                } else {
                state.userlist[index] = user;
                }
            });
         },
         
},
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.error = action.payload
        })
        builder.addCase(fetchUsers.pending, (state) => {
            state.isLoading = true;
        })
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            const users = action.payload
            state.userlist = users
            state.userbyEmails = {};
            state.isLoading = false;
            state.error = null;
            users.forEach((user:User) => {
                state.userbyEmails[user.email] = user
            });
        })

        builder.addCase(createUser.fulfilled, (state, action) => {
            const user = action.payload
            state.userlist.push(user)
            state.userbyEmails[user.email] = user
        })

        builder.addCase(deleteUser.fulfilled, (state, action) => {
            const email = action.payload
            state.userlist = state.userlist.filter((user) => (user.email !== email))
            delete state.userbyEmails[email]
        })

        builder.addCase(updateUser.fulfilled, (state, action) => {
            const email = action.payload.email
            const index = state.userlist.findIndex((e) => e.email === email)
            if (index !== -1) {
                state.userlist[index] = action.payload;
                state.userbyEmails[email] =action.payload
            }
        });

    }
})

export default userSlice.reducer
export const {upsertUsers} = userSlice.actions

// delete user by email