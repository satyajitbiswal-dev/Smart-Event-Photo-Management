import { IconButton, Menu, MenuItem } from '@mui/material'
import React, { useState } from 'react'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DownloadDoneOutlinedIcon from '@mui/icons-material/DownloadDoneOutlined';
import type {  Photo } from '../../types/types';


const DownloadButton = ({photo}: {photo: Photo}) => {
    const [downloadStatus, setDownloadStatus] = useState<boolean>(false)
    const[anchorEl, setAnchorEl] = useState<null | HTMLElement>(null) 
    const handleDownload = (event : React.MouseEvent<HTMLButtonElement>) =>{
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () =>{
        setAnchorEl(null)
    }

    // const downloadWatermark = () =>{ 
    //     console.log(photo.);
        
    // }
  return (
    <>
    <IconButton onClick={handleDownload}>
        { downloadStatus ? <FileDownloadOutlinedIcon/> : <DownloadDoneOutlinedIcon/> }
    </IconButton>
    <Menu id='download -button' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem></MenuItem>
        <MenuItem></MenuItem>
    </Menu>
    </>
  )
}

export default DownloadButton