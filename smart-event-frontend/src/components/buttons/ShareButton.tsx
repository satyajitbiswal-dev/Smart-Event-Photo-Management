import { Button } from '@mui/material'
import React from 'react'
import type { Event } from '../../types/types'


const ShareButton = ({event} : {event: Event}) => {
    const handleShare = async() =>{
        console.log(event.id);
    }
  return (
    <Button variant="outlined"
    onClick={handleShare}
    >Share</Button>
  )
}

export default ShareButton