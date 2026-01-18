import { createSlice } from "@reduxjs/toolkit";
import type { Notification } from "../types/types";

type AppNotification = {
    notifications : Notification[]
    unread_message : number
}


//fetch existing notifications for UI and unread message count




// delete a notification



// clear all




// notification mark as read 




export const notificationSlice = createSlice({
    name:'notification',
    initialState : {
        notifications: [],
        unread_message : 0
    },
    reducers:{
        addNotification : (state, action) =>{
            state.notifications.unshift(action.payload.value['message'])
        }
    }

}) 

export default notificationSlice.reducer