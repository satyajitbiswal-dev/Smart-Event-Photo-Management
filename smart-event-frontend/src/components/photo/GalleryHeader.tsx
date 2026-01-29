import { Box, IconButton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import ShareButton from '../buttons/ShareButton'
import type { Event } from '../../types/types'
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { selectIsAuthenticated } from '../../app/authslice';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import type { ReactNode } from 'react';

// event/017c4e91-f89e-4c27-8d40-522ca8a1f1e7/photos/

type headerProps = {
  title: string,
  subtitle: string,
  event: Event | null,
  viewMode: 'view' | 'bulk',
  extraAction?:ReactNode
}

const GalleryHeader = ({ title, subtitle, event, viewMode, extraAction }: headerProps) => {
  const authuser = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const theme =useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  return (
    <Box sx={{
      position: 'sticky', top: 56, // below main navbar
      zIndex: 10,
      bgcolor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider',
      px: 3,
      py: 1,
    }}
    >
      {/* Title + Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Box  >
          <Typography variant={isMobile ? 'subtitle1' : 'h5'} fontWeight={600}>
            {title}
          </Typography>
          {<Typography variant="body2" color="text.secondary" fontSize={isMobile ? 12 : 16} >
            {subtitle}
          </Typography>}
            {extraAction && <Box>{extraAction}</Box>}
        </Box>
        {
          viewMode === 'view' &&
          <Stack direction="row" spacing={1} >
            {event && <ShareButton event={event} />}
            {(isAuthenticated || authuser?.role !== "P") &&
              <Tooltip title="ZIP Download">
                <span>
                  <IconButton>
                    <FolderZipIcon />
                  </IconButton>
                </span>
              </Tooltip>

            }
          </Stack>
        }
      </Stack>
    </Box>

  )
}

export default GalleryHeader