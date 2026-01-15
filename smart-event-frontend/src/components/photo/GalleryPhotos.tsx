import { ImageList, ImageListItem, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { publicapi } from '../../services/AxiosService'
import type { Photo } from '../../types/types'


type props = {
  event_id:string | null,
  layout: string
}


const GalleryPhotos = ({event_id, layout}:props) => {

  const[photos, setPhotos] = useState<Partial<Photo>[]>([])

  useEffect(() => {
    (
      async () => {
        try {
          const response = await publicapi.get(`/photos/?event_id=${event_id}`)
          setPhotos(response.data)
          console.log(response.data)
        } catch (error) {
          console.error(error)
        }

      }
    )()
    
  }, [event_id])
  
  return (
    <Stack spacing={4}>
        <ImageList cols={4}
        // sx={{width: 400, height:400}}
        // rowHeight={164}
        gap={8}
        variant={'quilted'}
        >{
          photos && photos.map((item) => (
            <ImageListItem key={item.photo_id}>
              
              <img src={`${item.thumbnail}?h=248&fit=crop&auto=format&dpr=2`} alt={item.description} loading='lazy'/>
            </ImageListItem>
          ))
        }
        </ImageList>
    </Stack>

  )
}

export default GalleryPhotos

