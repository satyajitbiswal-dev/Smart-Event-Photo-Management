import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice.ts";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
})

export type RootState = ReturnType <typeof store.getState>;  //Return Current Redux State 
export type AppDispatch = typeof store.dispatch;

