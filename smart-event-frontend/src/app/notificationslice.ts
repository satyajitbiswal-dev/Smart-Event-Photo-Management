import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Notification } from "../types/types";
import privateapi from "../services/AxiosService";
import type { RootState } from "./store";

type NotificationState = {
    notifications: Notification[]
}

const initialState: NotificationState = {
    notifications: [],
}

//fetch existing notifications for UI and unread message count

export const fetchNotifications = createAsyncThunk(
    'notification/fetch',
    async () => {
        try {
            const response = await privateapi.get('/notification/list/')
            return response.data
        } catch (error) {
            console.error(error);
        }
    }
)

export const selectTopUnreadNotifications = (state: RootState) =>
    state.notification.notifications
        .filter(n => !n.is_seen)
        .slice(0, 10);


// notification mark as read 
export const markSeenAPI = (id: number) =>
    privateapi.patch(`/notification/${id}/seen/`);

export const markAllSeenAPI = () =>
    privateapi.patch("/notification/mark-all-seen/");

export const deleteNotificationAPI = (id: number) =>
  privateapi.delete(`/notification/${id}/delete/`);

export const clearAllNotificationsAPI = () =>
  privateapi.delete("/notification/clear-all/");


export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload)
        },
        markAsRead: (state, action: PayloadAction<number>) => {
            const notif = state.notifications.find(
                n => n.id === action.payload
            );
            if (notif) notif.is_seen = true;
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => {
                n.is_seen = true;
            });
        },
        deleteNotification: (state, action: PayloadAction<number>) => {
            state.notifications = state.notifications.filter(
                n => n.id !== action.payload
            );
        },

        clearAll: (state) => {
            state.notifications = [];
        },
    },
    extraReducers: (builder) => {
        // builder.addCase(fetchNotifications.rejected, (state,action) => {

        // })
        // builder.addCase(fetchNotifications.pending, (state,action) => {

        // })
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.notifications = action.payload
        })
    }

})

export default notificationSlice.reducer

export const { addNotification, markAsRead, markAllAsRead, deleteNotification, clearAll } = notificationSlice.actions