import { Outlet } from "react-router-dom"
import AppInitX from "../AppInit"
import Navbar from "../components/layout/Navbar"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { WebSocket } from "../services/Websocket"
import { Slide, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../app/store"
import { useEffect } from "react"
import { fetchNotifications } from "../app/notificationslice"
import { selectIsAuthenticated, selectIsGuest } from "../app/authslice"
import darkTheme from "../theme/darkTheme"
import lightTheme from "../theme/lightTheme"

const Home = () => {
    const dispatch = useDispatch<AppDispatch>()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const isGuest = useSelector(selectIsGuest)
    useEffect(()=>{
      if(isAuthenticated){
        dispatch(fetchNotifications())
      }
    },[dispatch,isAuthenticated])
    const theme = useSelector((state:RootState) => state.theme.mode)
  return (
    <ThemeProvider theme={theme==="dark" ? darkTheme : lightTheme}>
    {/* <> */}
      <CssBaseline />
      <WebSocket />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        />
      <AppInitX />
       {(isGuest || isAuthenticated) &&  <Navbar /> }
      <Outlet />
    </ThemeProvider>
        
  )
}

export default Home
