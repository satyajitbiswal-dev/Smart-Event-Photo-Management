import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice.ts";
import eventReducer from "./eventslice.ts"
import userReducer from "./userslice.ts"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        event : eventReducer,
    },
})

export type RootState = ReturnType <typeof store.getState>;  //Return Current Redux State 
export type AppDispatch = typeof store.dispatch;

