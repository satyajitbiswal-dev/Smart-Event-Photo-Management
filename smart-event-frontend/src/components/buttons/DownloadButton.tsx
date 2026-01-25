import { Button, Menu, MenuItem } from '@mui/material'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import privateapi from '../../services/AxiosService'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// photo_name === event_Photo_name

const DownloadButton = ({ photo_id, photo_name, event_name }: { photo_id?: string, photo_name?: string, event_name?: string }) => {
    const [downloadStatus, setDownloadStatus] = useState<string[]>([])
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    
    const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }
    const handleSelectDownload = async (type: string) => {
        console.log(photo_name, event_name);
        
        if(downloadStatus.find((e)=> e === type)){
            toast.info(`You have already downloaded ${type} image.`)
            return
        }
        try {
            const response = await privateapi.get(`photos/${photo_id}/download/?image_type=${type}`,{
                responseType:'blob'
            })
            const blob = await response.data;
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a');
            link.href = url;
            const photofilename = new URL(photo_name).pathname.split('/').pop();
            const downloadFileName = type === 'original' ?  `IMG_${event_name ?? ''}_${photofilename}` : `IMG_${event_name ?? ''}_watermark_${photofilename}`
            link.setAttribute('download', downloadFileName);
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
            console.log(response.data);

            toast.success("Download started!");
            setDownloadStatus((prev) => [...prev, type])
        } catch (error) {
            console.log(error);
            toast.error('Something Went Wrong')
        }
        
    }
    return (
        <>
            <Button color='inherit' variant='contained'
                onClick={handleDownload} sx={{fontWeight:600}} endIcon={<KeyboardArrowDownIcon/>}>
                Download</Button>
            <Menu id='download -button' anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={() => handleSelectDownload('watermarked')}> Watermarked Image </MenuItem>
                <MenuItem onClick={() => handleSelectDownload('original')}> Original Image </MenuItem>
            </Menu>
        </>
    )
}

export default DownloadButton