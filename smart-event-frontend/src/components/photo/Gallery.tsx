import { Box } from '@mui/material'
import  { useState } from 'react'
import GalleryHeader from './GalleryHeader'
import GalleryControls from './GalleryControls'
import type { Event } from '../../types/types'
import { Suspense, lazy } from 'react'

const GalleryPhotos = lazy(() => import('./GalleryPhotos'));

type props = {
  title: string
  subtitle: string
  mode: string
  event: Event | null
  viewMode: 'view' | 'bulk'
}

const Gallery = ({ title, subtitle, mode, event, viewMode }: props) => {

  const [search, setSearch] = useState<string | undefined>()
  const [filter, setFilter] = useState<string | undefined>()
  const [layout, setLayout] = useState<'standard' | 'masonry'>('standard')
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
          <Suspense fallback = {<p>loading ....</p>}>
              <GalleryPhotos event_id={event?.id ? event.id : null} layout={layout} mode={mode} viewMode={viewMode ? viewMode : 'view'} />
          </Suspense>
        </Box>
      </Box>



    </>
  )
}

export default Gallery