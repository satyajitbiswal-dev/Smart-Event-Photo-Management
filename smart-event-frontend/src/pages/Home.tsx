import { Outlet } from "react-router-dom"
import AppInitX from "../AppInit"
import Navbar from "../components/layout/Navbar"
import { CssBaseline } from "@mui/material"
import { WebSocket } from "../services/Websocket"
import { Slide, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch } from "../app/store"
import { useEffect } from "react"
import { fetchNotifications } from "../app/notificationslice"
import { selectIsAuthenticated } from "../app/authslice"

const Home = () => {
    const dispatch = useDispatch<AppDispatch>()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    useEffect(()=>{
      if(isAuthenticated){
        dispatch(fetchNotifications())
      }
    },[dispatch,isAuthenticated])

  return (
    <>
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
      <Navbar />
      <Outlet />
    </>
  )
}

export default Home
