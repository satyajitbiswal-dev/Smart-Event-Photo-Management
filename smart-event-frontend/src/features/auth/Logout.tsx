import React from 'react'
import { Button } from '@mui/material'
import { useDispatch } from 'react-redux'
import { logout, setPersist } from '../../app/authslice'
import LogoutIcon from '@mui/icons-material/Logout';

const Logout = () => {
    const dispatch = useDispatch()
    const handleLogout = async () =>{
        dispatch(logout())
        dispatch(setPersist(false))
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