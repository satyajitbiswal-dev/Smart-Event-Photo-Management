import React from 'react'
import { Button } from '@mui/material'
import { useDispatch } from 'react-redux'
import { logout, setPersist } from '../../app/authslice'
import LogoutIcon from '@mui/icons-material/Logout';
import privateapi from '../../services/AxiosService';

const Logout = () => {
    const dispatch = useDispatch()
    const handleLogout = async () =>{
      try {
        await privateapi.post('logout/')
        dispatch(logout())
        dispatch(setPersist(false))
      } catch (error) {
        console.log(error);
      }
    }
  return (
    <>
    <Button 
     onClick={handleLogout}
     endIcon={<LogoutIcon/>}>
      Logout
    </Button>
    </>
  )
}

export default Logout