import { Outlet } from "react-router-dom"
import AppInitX from "../AppInit"
import Navbar from "../components/layout/Navbar"
import { CssBaseline } from "@mui/material"

const Home = () => {
    
  return (
    <div>
        <CssBaseline />
        <AppInitX />
        <Navbar/>
        <Outlet />
    </div>
  )
}

export default Home
