import { Box, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import GalleryHeader from './GalleryHeader'
import GalleryControls from './GalleryControls'
import type { Gallery } from '../../types/types'
import { Suspense, lazy } from 'react'
import { TuneRounded } from '@mui/icons-material'

const GalleryPhotos = lazy(() => import('./GalleryPhotos'));


const Gallery = ({ title, subtitle, viewMode, mode, event }: Gallery) => {
  const [layout, setLayout] = useState<'standard' | 'masonry'>('standard')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [openControls, setOpenControls] = useState(false)
  


  if (mode === 'event') {
    return (
      <>
        <GalleryHeader title={title} subtitle={subtitle} event={event} viewMode={viewMode}
          extraAction={
            isMobile && (
              <IconButton onClick={() => setOpenControls(true)}>
                <TuneRounded fontSize={'small'} />
              </IconButton>
            )
          }
        />
        <Box display="flex" gap={2} px={2}>
          {/* DESKTOP SIDEBAR */}
          {!isMobile && (
            <Box sx={{ width: 300, flexShrink: 0 }}>
              <GalleryControls
                event_id={event.id}
                context={mode} layout={layout} setLayout={setLayout}
                variant='sidebar'
              />
            </Box>
          )}

          {/* MOBILE DRAWER */}
          <Drawer
            anchor="left"
            open={openControls}
            onClose={() => setOpenControls(false)}
            slotProps={{paper:{ sx: {
                width: 300,
                p: 2,
              }},
            }}
          >
            <GalleryControls event_id={event.id}
              context={mode} layout={layout} setLayout={setLayout}
              onClose={() => setOpenControls(false)} 
              variant="drawer"                      
            />
          </Drawer>

          {/* RIGHT CONTENT */}
          <Box sx={{ flex: 1 }}>
            <Suspense fallback={<p>loading ....</p>}>
              <GalleryPhotos event_id={event.id} layout={layout} mode={mode} viewMode={viewMode ? viewMode : 'view'} />
            </Suspense>
          </Box>
        </Box>
      </>
    )
  }
  return (
    <>
      <GalleryHeader title={title} subtitle={subtitle} event={null} viewMode={viewMode} />
        {/* LEFT SIDEBAR */}
       <Box display="flex" gap={2} px={2}>
          {/* DESKTOP SIDEBAR */}
          {!isMobile && (
            <Box sx={{ width: 300, flexShrink: 0 }}>
              <GalleryControls context={mode} layout={layout} setLayout={setLayout}
                variant='sidebar'
              />
            </Box>
          )}

          {/* MOBILE DRAWER */}
          <Drawer
            anchor="left"
            open={openControls}
            onClose={() => setOpenControls(false)}
            slotProps={{paper:{ sx: {
                width: 300,
                p: 2,
              }},
            }}
          >
            <GalleryControls context={mode} layout={layout} setLayout={setLayout}
              onClose={() => setOpenControls(false)} 
              variant="drawer"                      
            />
          </Drawer>


        {/* RIGHT CONTENT */}
        <Box sx={{ flex: 1 }}>
          <Suspense fallback={<p>loading ....</p>}>
            <GalleryPhotos event_id={null} layout={layout} mode={mode} viewMode={viewMode ? viewMode : 'view'} />
          </Suspense>
        </Box>
        </Box>
    </>
  )


}

export default Gallery
