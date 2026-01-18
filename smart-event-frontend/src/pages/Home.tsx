import { Outlet } from "react-router-dom"
import AppInitX from "../AppInit"
import Navbar from "../components/layout/Navbar"
import { CssBaseline } from "@mui/material"
import { WebSocket } from "../services/Websocket"
import { Slide, ToastContainer } from 'react-toastify';

const Home = () => {
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
