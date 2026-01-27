import { Box, Button, Checkbox, FormControlLabel, FormGroup, ImageList, ImageListItem, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import useBreakPointValue from '../../hooks/useMediaQuery'
import useInfinityGallery from '../../hooks/useInfinityPhoto'
import useInfinityScroll from '../../hooks/useInfinityScroll'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import UpdatePhoto from '../RBAC/Photographer/UpdatePhoto'
import DeletePhoto from '../RBAC/Photographer/DeletePhoto'
import { useMemo } from "react";
import { makeSelectEventPhotos, makeSelectContextPhotos, } from "../../app/selectors/photoSelector";
import { resetGalleryPagination } from '../../app/photoslice'
import type { AppDispatch } from '../../app/store'

type props = {
  event_id: string | null,
  layout: 'standard' | 'masonry',
  mode: string
  viewMode: 'bulk' | 'view'
}


const GalleryPhotos = ({ event_id, layout, mode, viewMode }: props) => {

  const context = mode === "event" ? "event" : mode === "favourites" ? "favourites" : "tagged";

  const photos = useSelector(useMemo(() => {
    if (context === "event") {
      return makeSelectEventPhotos(event_id!);
    }
    return makeSelectContextPhotos(context);
  }, [context, event_id])
  );

  /* REDUX-BASED INFINITE GALLERY */
  const { loading, hasMore, loadMore } = useInfinityGallery(context, event_id ?? undefined);

  const ref = useInfinityScroll({
    loading,
    hasmore: hasMore,
    loadmore: loadMore,
    deps: [photos.length],
  });

  /* INITIAL LOAD */
  // const dispatch = useDispatch<AppDispatch>()
  // useEffect(() => {
  //   dispatch(resetGalleryPagination({ context, event_id: event_id ?? undefined }));
  //   // eslint-disable-next-line
  // }, [context, event_id]);


  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
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
    setSelectValue(
      (selectValue && selectValue.length) === (photos && photos.length) //If Already selected
        ? []
        : photoIds
    )
  }

  const toggleSelect = (photo_id: string) => {
    //If selected remove while maintaining prev
    if (selectValue.includes(photo_id)) {
      setSelectValue((prev) => prev.filter((id) => id !== photo_id))
    } else {
      setSelectValue(prev => [...prev, photo_id])
    }
    //If not selected select while maintaining prev
  }

  const handlePhotoOnClick = (photo_id: string) => {
    if (viewMode === 'view') {
      navigate(`/photos/${photo_id}/`)
    } else {
      toggleSelect(photo_id)
    }
  }

  const cols = useBreakPointValue({ xs: 4, sm: 5, md: 6 })

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
            top: 0,
          }}>
            {/* Menu items */}
            <Tooltip title="Update or Delete Photos">
              <span>
                <Button variant='contained' onClick={handleMenuOpen} disabled={selectValue.length > 0 ? false : true} >
                  Actions
                </Button>
              </span>
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
            <MenuItem onClick={() => {
              handleClose();
              setDeleteDialogOpen(true);
            }}
            >
              Delete
            </MenuItem>

          </Menu>
          <UpdatePhoto
            isDialogOpened={dialogOpen}
            onCloseDialog={() => setDialogOpen(false)}
            photo_ids={selectValue}
            event_id={event_id ?? ''}
            onClearSelection={() => setSelectValue([])}
          />
          <DeletePhoto
            isDialogOpened={deleteDialogOpen}
            onCloseDialog={() => setDeleteDialogOpen(false)}
            photo_ids={selectValue}
            event_id={event_id}
            onClearSelection={() => setSelectValue([])}
          />

        </>
      }
      <ImageList
        cols={cols}
        gap={20}
        sx={{ p: 2 }}
        variant={layout}
      >
        {photos.map((item) => {
          return (
            <ImageListItem
              key={item.photo_id}
              sx={{
                position: 'relative',
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
        })

        }
        <div
          ref={ref}
          style={{
            height: "1px",
            width: "100%",
          }}
        />
      </ImageList>
    </Stack>

  )
}

export default GalleryPhotos

