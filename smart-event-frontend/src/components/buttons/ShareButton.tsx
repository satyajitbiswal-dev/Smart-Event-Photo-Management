import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import React, { useState } from 'react'
import type { Event } from '../../types/types'
import ShareIcon from '@mui/icons-material/Share';
import InsertLinkSharpIcon from '@mui/icons-material/InsertLinkSharp';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import { useNavigate } from 'react-router-dom';


const ShareButton = ({event} : {event: Event}) => {
  const [anchorEl, setanchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const handleonClose = () =>{
    setanchorEl(null)
  }
    const handleShare = (event: React.MouseEvent<HTMLButtonElement>) =>{
       setanchorEl(event.currentTarget)
    }

    const handleCopyURL = () =>{
      handleonClose()
      const url =  window.location.href
      navigator.clipboard.writeText(url)
    }

    const handleQRCode = () => {
      handleonClose()
      window.open(event.qr_code, "_blanck")
    }
  return (
    <>
    <Box>
    <IconButton onClick={handleShare} >
      <ShareIcon/>
    </IconButton>
      </Box>
      <Menu id='share-options' anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleonClose}
      >
        <MenuItem key={'copy-url'} onClick={handleCopyURL}> 
        <InsertLinkSharpIcon color='info' />
        <Typography ml={1} variant='subtitle1'>
         Copy Link
        </Typography>
         </MenuItem>
        <MenuItem key={'qr-code'} onClick={handleQRCode} color='info'> <QrCodeScannerRoundedIcon/> <Typography ml={1} variant='subtitle1'>
         Scan QR
        </Typography></MenuItem>
      </Menu>
    </>
  )
}

export default ShareButton