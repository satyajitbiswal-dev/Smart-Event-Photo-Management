import { Box, Button, ButtonGroup, Checkbox, FormControlLabel, FormGroup, ImageList, ImageListItem, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import useBreakPointValue from '../../hooks/useMediaQuery'
import useInfinityPhoto from '../../hooks/useInfinityPhoto'
import useInfinityScroll from '../../hooks/useInfinityScroll'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store'
import { fetchPhotoDetails } from '../../app/photoslice'
import { useEffect, useState } from 'react'
import UpdatePhoto from '../RBAC/Photographer/UpdatePhoto'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


type props = {
  event_id: string | null,
  layout: 'standard' | 'masonry',
  mode: string
  viewMode: 'bulk' | 'view'
}


const GalleryPhotos = ({ event_id, layout, mode, viewMode }: props) => {

  let url: string | null = null;

  if (mode === 'event' && event_id) {
    url = `/photos/?event_id=${event_id}`;
  } else if (mode === 'favourites') {
    url = `/photos/?favorites=true`;
  } else if (mode === 'tagged') {
    url = `/photos/?tagged=true`;
  }

  const { loading, loadmore, hasmore } =
  useInfinityPhoto(url, event_id)

const ref = useInfinityScroll({ loading, loadmore, hasmore })

/* 🔥 UI READS FROM REDUX */
const photos = useSelector(state =>
  event_id
    ? (state.photo.photoIdsByContext.event[event_id] ?? [])
        .map(id => state.photo.photosById[id])
    : []
)


  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()
  const handlePhotoDetails = (photo_id: string) => {
    try {
      dispatch(fetchPhotoDetails(photo_id))
      navigate(`/photos/${photo_id}/`)
    } catch (error) {
      toast.error(String(error))
    }
  }

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleDialogOpen = () => {
    handleClose()
    setDialogOpen(!dialogOpen)
  }


  //Check box control 
  const [selectValue, setSelectValue] = useState<string[]>([])
  const isSelectAll = photos.length > 0 && selectValue.length === photos.length

  const toggleSelectAll = () => {
    const photoIds = photos.map((item) => item.photo_id)
    console.log('Select All Fired');
    setSelectValue(
      (selectValue && selectValue.length) === (photos && photos.length) //If Already selected
       ? [] 
      : photoIds
    )
  }

  const toggleSelect= (photo_id: string) => {
    //If selected remove while maintaining prev
    if(selectValue.includes(photo_id)){
      setSelectValue((prev) => prev.filter((id) => id !==photo_id))
    }else{
       setSelectValue(prev => [...prev, photo_id])
    }    
    //If not selected select while maintaining prev
  }

  useEffect(() => {
   console.log('selectValue', selectValue); 
  }, [selectValue])
  
  const handlePhotoOnClick = (photo_id: string) => {
    if(viewMode === 'view') {
      navigate(`/photos/${photo_id}/`)
    }else{
      toggleSelect(photo_id)
    }
  }

  const cols = useBreakPointValue({
        xs: 4,
        sm: 5,
        md: 6
    })

  if (loading && photos.length === 0) {
    return <Typography>loading ...</Typography>
  }

  if (!loading && photos.length === 0) {
    return <Typography>No Photos ...</Typography>
  }

  return (
    <Stack spacing={4} mb={3} mt={1} >
      {
        viewMode === 'bulk' &&
        <>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0
          }}>
            {/* Menu items */}
            <Tooltip title="Update or Delete Photos">
              <Button variant='contained' onClick={handleMenuOpen} disabled = {selectValue.length > 0 ? false : true} >
                Actions
              </Button>
            </Tooltip>

            {/* Select All Check box */}
            <FormGroup>
              <FormControlLabel control={<Checkbox 
              checked={isSelectAll} 
              onChange={toggleSelectAll}
              />} label="Select All" />
            </FormGroup>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)}
            onClose={handleClose} id="menu-operation"
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleDialogOpen}> Update </MenuItem>
            <MenuItem > Delete </MenuItem>
          </Menu>
          <UpdatePhoto
            isDialogOpened={dialogOpen}
            onCloseDialog={() => setDialogOpen(false)}
            photo_ids={selectValue}
            onClearSelection={() => setSelectValue([])}
            event_id={event_id}
          />
        </>
      }
      <ImageList
        cols={cols}
        gap={20}
        sx={{ p: 2 }}
        variant={layout}
      >
        {photos.length > 0 && photos.map((item, index) => {
          const isLastPhoto = index === photos.length - 1;
          return (
              <ImageListItem
                key={item.photo_id}
                ref={isLastPhoto ? ref : null}
                sx={{
                  position:'relative',
                  overflow: 'hidden',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: viewMode === 'view' ? "translateY(-6px)" : 'none',
                    boxShadow: viewMode === "view" ? 6 : 2,
                  },
                }}
                onClick={() => handlePhotoOnClick(item.photo_id)}
              >
                 {
              viewMode === 'bulk' &&
              (<Checkbox
                checked={selectValue.includes(item.photo_id)}
                onClick={(e) => e.stopPropagation()} 
                onChange={() => toggleSelect(item.photo_id)}
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 2,
                  bgcolor: "rgba(0,0,0,0.4)",
                  borderRadius: "50%",
                  color: "white",
                  "&.Mui-checked": {
                    color: "primary.main",
                  },
                }}
              />)
            }
                <img
                  src={item.thumbnail}
                  alt={item.photo_id}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </ImageListItem>
          )
        })}
      </ImageList>
    </Stack>

  )
}

export default GalleryPhotos

