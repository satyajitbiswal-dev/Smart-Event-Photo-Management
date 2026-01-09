import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store.ts";

export type AppUser = {
  username: string;
  email?: string;
  role: "P" | "M" | "A";
};

type AuthState = {
  user: AppUser | null;
  access_token : string | null ;
  loading: boolean;
  persist: boolean;

};

const guestUser: AppUser = {
  username: "GuestUser",
  role: "P"
};


// Access token and user data in Redux state (in-memory)
// Refresh token is in HTTP-only cookie 
const getInitialState = (): AuthState => {
  const persist = JSON.parse(localStorage.getItem("persist") || "false");
  return {
    user: null, 
    access_token: null,
    loading: true,
    persist: persist,
  };
};

const initialState: AuthState = getInitialState();


export const selectIsAuthenticated = (state: RootState) =>
  !!state.auth.user && state.auth.user.role !== "P";

export const selectIsGuest = (state: RootState) =>
  !!state.auth.user && state.auth.user.role === "P";


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // logout
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.loading = false;
      localStorage.removeItem("guest_user");
      // Refresh token cookie will be cleared by backend on logout
    },

    // guest
    guest: (state) => {
      state.user = guestUser;
      state.access_token = null;
      state.loading = false;
      localStorage.setItem("guest_user","true");
     
    },

    //setauthtoken
    login: (state, action) => {
      const user = {
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
      };
      
      state.user = user;
      state.access_token = action.payload.access_token;
      state.loading = false;
      localStorage.removeItem("guest_user"); 
    } , 

    setAccessToken: (state, action) => {
      state.access_token = action.payload;
    },
    setUser: (state, action: PayloadAction<AppUser>) => {
      state.user = action.payload;
    },
    AppInit: (state)=>{
      state.loading = false;
    },
    setPersist: (state, action: PayloadAction<boolean>) => {
      state.persist = action.payload;
      localStorage.setItem("persist", JSON.stringify(action.payload));
    },
  },

});



export const {setPersist,AppInit, login,logout, guest, setAccessToken, setUser } = authSlice.actions;
export default authSlice.reducer;
