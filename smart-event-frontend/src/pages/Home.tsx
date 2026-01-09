import { Outlet } from "react-router-dom"
import AppInitX from "../AppInit"

const Home = () => {
    
  return (
    <div>
        <AppInitX />
        <Outlet />
    </div>
  )
}

export default Home
