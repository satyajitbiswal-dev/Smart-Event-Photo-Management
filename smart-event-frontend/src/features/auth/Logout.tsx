import React from 'react'
import { Button } from '@mui/material'
import { useDispatch } from 'react-redux'
import { logout, setPersist } from '../../app/authslice'

const Logout = () => {
    const dispatch = useDispatch()
    const handleLogout = async () =>{
        dispatch(logout())
        dispatch(setPersist(false))
    }
  return (
    <>
    <Button variant='contained' onClick={handleLogout}>Logout</Button>
    </>
  )
}

export default Logout