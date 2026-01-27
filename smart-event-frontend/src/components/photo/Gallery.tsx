import { Box } from '@mui/material'
import  { useState } from 'react'
import GalleryHeader from './GalleryHeader'
import GalleryControls from './GalleryControls'
import type { Gallery} from '../../types/types'
import { Suspense, lazy } from 'react'

const GalleryPhotos = lazy(() => import('./GalleryPhotos'));


const Gallery = ({ title, subtitle, viewMode, mode, event }: Gallery) => {
  const [layout, setLayout] = useState<'standard' | 'masonry'>('standard')

if(mode === 'event'){
  return (
    <>
      <GalleryHeader title={title} subtitle={subtitle} event={event} viewMode={viewMode}/>
      <Box display="flex" gap={2} px={2}>
        {/* LEFT SIDEBAR */}
        <Box sx={{ width: 280, flexShrink: 0 , display: { xs: 'none', md: 'block' }}}>
          <GalleryControls event_id={event.id} context={mode} layout={layout} setLayout={setLayout}></GalleryControls>
        </Box>

        {/* RIGHT CONTENT */}
        <Box sx={{ flex: 1 }}>
          <Suspense fallback = {<p>loading ....</p>}>
              <GalleryPhotos event_id={event.id} layout={layout} mode={mode} viewMode={viewMode ? viewMode : 'view'} />
          </Suspense>
        </Box>
      </Box>
    </>
  )
  }
  return (
    <>
      <GalleryHeader title={title} subtitle={subtitle} event={null} viewMode={viewMode}/>
      <Box display="flex" gap={2} px={2}>
        {/* LEFT SIDEBAR */}
        <Box sx={{ width: 280, flexShrink: 0 , display: { xs: 'none', md: 'block' }}}>
          <GalleryControls context={mode} layout={layout} setLayout={setLayout}></GalleryControls>
        </Box>

        {/* RIGHT CONTENT */}
        <Box sx={{ flex: 1 }}>
          <Suspense fallback = {<p>loading ....</p>}>
              <GalleryPhotos event_id={null} layout={layout} mode={mode} viewMode={viewMode ? viewMode : 'view'} />
          </Suspense>
        </Box>
      </Box>
    </>
  )


}

export default Gallery