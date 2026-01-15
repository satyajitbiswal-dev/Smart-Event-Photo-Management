import { Box } from '@mui/material'
import React, { useState } from 'react'
import GalleryHeader from './GalleryHeader'
import GalleryPhotos from './GalleryPhotos'
import type { Event } from '../../types/types'
import GalleryControls from './GalleryControls'

type props = {
  title: string
  subtitle: string
  mode: string
  event: Event | null
}

const Gallery = ({ title, subtitle, mode, event }: props) => {

  const [search, setSearch] = useState<string | undefined>()
  const [filter, setFilter] = useState<string | undefined>()
  const [layout, setLayout] = useState<string | undefined>()
  return (
    <>
      <GalleryHeader title={title} subtitle={subtitle} event={event} />
      <Box display="flex" gap={2} px={2}>
        {/* LEFT SIDEBAR */}
        <Box sx={{ width: 280, flexShrink: 0 , display: { xs: 'none', md: 'block' }}}>
          <GalleryControls search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} layout={layout} setLayout={setLayout}></GalleryControls>
        </Box>

        {/* RIGHT CONTENT */}
        <Box sx={{ flex: 1 }}>
          <GalleryPhotos event_id={event?.id ? event.id : null} layout={layout ? layout : 'Grid'} />
        </Box>
      </Box>



    </>
  )
}

export default Gallery