import { ImageList, ImageListItem, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { publicapi } from '../../services/AxiosService'
import type { Photo } from '../../types/types'
import useBreakPointValue from '../../hooks/useMediaQuery'
import useInfinityPhoto from '../../hooks/useInfinityPhoto'
import useInfinityScroll from '../../hooks/useInfinityScroll'


type props = {
  event_id: string | null,
  layout: string,
  mode: string
}


const GalleryPhotos = ({ event_id, layout, mode }: props) => {

  let url: string | null = null;

  if (mode === 'event' && event_id) {
    url = `/photos/?event_id=${event_id}`;
  } else if (mode === 'favourites') {
    url = `/photos/?favorites=true`;
  } else if (mode === 'tagged') {
    url = `/photos/?tagged=true`;
  }


  const { photos, loading, loadmore, hasmore } = useInfinityPhoto(url)
  const ref = useInfinityScroll({ loading, loadmore, hasmore })


  return (
    <Stack spacing={4} my={2}>
      <ImageList
        cols={useBreakPointValue({ xs: 4, sm: 5, md: 6 })}
        gap={12}
        variant={layout ?? 'standard'}
      >
        {photos.length > 0 ? photos.map((item, index) => {
          const isLastPhoto = index === photos.length - 1;
          return (
            <ImageListItem
              key={item.photo_id}
              ref={isLastPhoto ? ref : null}
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              <img
                src={item.thumbnail}
                alt={item.description}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // 🔥 important
                  display: 'block',
                }}
              />
            </ImageListItem>
          )
        }) : <Typography variant='h5' color='primary'>No Photos</Typography>}
      </ImageList>
    </Stack>


  )
}

export default GalleryPhotos

