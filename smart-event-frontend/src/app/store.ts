import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice.ts";
import eventReducer from "./eventslice.ts"
import userReducer from "./userslice.ts"
import notificationReducer from './notificationslice.ts'
import photoReducer from './photoslice.ts'
import commentReducer from './commentslice.ts'
import dashboardReducer from './dashboardslice.ts'
export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        event : eventReducer,
        notification: notificationReducer,
        photo:photoReducer,
        comment:commentReducer,
        dashboard:dashboardReducer
    },
})

export type RootState = ReturnType <typeof store.getState>;  //Return Current Redux State 
export type AppDispatch = typeof store.dispatch;

