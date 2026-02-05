import { createSlice } from "@reduxjs/toolkit";

type mode = 'light' | 'dark';

const getTheme = () : mode => {
    const value = localStorage.getItem("theme")
    if(value === 'light' || value === 'dark'){
        return value;
    }
    return 'light';
}

const initialState = {
    mode : getTheme()
}

const themeSlice = createSlice({
    name:'theme',
    initialState,
    reducers: {
        toggleTheme : (state) => {
            if(state.mode == 'light'){
                state.mode = 'dark';
                localStorage.setItem("theme","dark");
            }else{
                state.mode = 'light';
                localStorage.setItem("theme","light")
            }
        },
    }
})

export default themeSlice.reducer
export const { toggleTheme } = themeSlice.actions