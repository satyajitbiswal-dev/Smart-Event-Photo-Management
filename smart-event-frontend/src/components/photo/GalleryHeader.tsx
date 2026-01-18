import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ShareButton from '../buttons/ShareButton'
import type { Event } from '../../types/types'
import useScrollTrigger from '@mui/material/useScrollTrigger';

// event/017c4e91-f89e-4c27-8d40-522ca8a1f1e7/photos/

type headerProps = {
  title: string,
  subtitle:string,
  event: Event | null
}

const GalleryHeader = ({title, subtitle, event}:headerProps) => {
  const navigate = useNavigate()

const trigger = useScrollTrigger({
  disableHysteresis: true,
  threshold: 64, 
});


  return (
    <Box sx={{ position: 'sticky',  top: 64, // below main navbar
    zIndex: 10,
    bgcolor: 'background.paper',
    borderBottom: '1px solid',
    borderColor: 'divider',
    px: 3,
    py: 1,
    // py: trigger ? 0.5 : 2,
    // transition: 'all 0.25s ease',
  }}
>
  {/* Back */}

  {/* Title + Actions */}
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    spacing={2}
  >
    <Box  >
      <Typography variant='h5' fontWeight={600}>
        {title}
      </Typography>
      {  <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>}
    </Box>

    <Stack direction="row" spacing={1} >
     { event && <ShareButton event={event}/> }
      <Button variant="outlined">Download All</Button>
      {/* <Button variant="contained">Upload Photos</Button> */}
    </Stack>
  </Stack>
</Box>

  )
}

export default GalleryHeader