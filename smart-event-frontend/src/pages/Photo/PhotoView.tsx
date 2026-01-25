import { Accordion, AccordionDetails, AccordionSummary, Avatar, AvatarGroup, Box, Button, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate, useParams } from 'react-router-dom'
import DownloadButton from '../../components/buttons/DownloadButton'
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { BookmarkBorder, Bookmark, Favorite, FavoriteBorder,  ShareOutlined, ExpandMore } from '@mui/icons-material';
import { addFavouritesAPI, addLikeAPI, addtoFavourites, clearPhotoId, fetchPhotoDetails, photoLiked, removeFavouritesAPI, removeFromFavourites, removeLikeAPI } from '../../app/photoslice';
import type { PhotoEXIF } from '../../types/types';
import PhotoEXIFData from '../../components/PhotoView/EXIFData';
import { toast } from 'react-toastify';
import CommentSection from '../../components/PhotoView/CommentSection';
import { fetchEvents } from '../../app/eventslice';
import { fetchUsers } from '../../app/userslice';

const PhotoView = () => {
    const { photo_id } = useParams()
    const navigate = useNavigate()
    const authuser = useSelector((state: RootState) => state.auth.user)
    const [open, setOpen] = useState<boolean>(false)
    const handleClose = () => {
        setOpen(false)
    }
    const photo = useSelector((state: RootState) => photo_id ? state.photo.photosById[photo_id] : null)
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        if (!photo_id) return;
        if (!photo) {
            dispatch(fetchPhotoDetails(photo_id))
            console.log(photo);
        }
        return () => {
            dispatch(clearPhotoId())
        }
    }, [photo_id, photo, dispatch])

    const userlist = useSelector((state: RootState) => {
        if (!photo) return [];
        return state.user.userlist
    });

    const allevents = useSelector((state:RootState)=>state.event.events)

    useEffect(()=>{
        if(allevents.length === 0 ) dispatch(fetchEvents())
        if(userlist.length === 0) dispatch(fetchUsers())
    },[userlist,allevents,dispatch])

    const taggedUsers = useSelector((state: RootState) => {
        if (!photo) return [];
        return photo?.tagged_user.map(email => state.user.userbyEmails[email]).filter(Boolean);
    });

    const selectedEvent = allevents.find((e) => e.id === photo?.event)

    const [like, setLike] = useState<boolean>(false);
    const [favourite, setFavourite] = useState<boolean>(false)
    useEffect(() => {
        if (photo?.liked_users.find((e) => e === authuser?.email)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLike(true)
        }
        if (photo?.is_favourite_of.find((e) => e === authuser?.email)) {
            setFavourite(true)
        }
    }, [authuser, photo])
    const ToggleLike = () => {
        if (!photo_id) return
        if (like) {
            removeLikeAPI(photo_id)
        } else {
            addLikeAPI(photo_id)
        }
        dispatch(photoLiked(photo_id))
        setLike(!like)
        console.log('liked');
    }
    const ToggleFavourite = () => {
        if (!photo_id) return
        if (favourite) {
            dispatch(removeFromFavourites(photo_id))
            removeFavouritesAPI(photo_id)
        } else {
            dispatch(addtoFavourites(photo_id))
            addFavouritesAPI(photo_id)
        }

        setFavourite(!favourite)
        console.log('added to favourites');
    }
    const handleShare = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url);
        toast.success('Copied Link !!!')
    }

    const photoEventDetails = {
        Event: selectedEvent?.event_name,
        Date: selectedEvent?.event_date
    }

    const hasAnyEXIFData = (exif?: PhotoEXIF) => {
        if (!exif) return false;
        return Object.values(exif).some(x => x !== null && x !== '' && x !== undefined)
    }

    return (
        <>
            <Dialog open={open} fullWidth maxWidth={'xl'} >
                {/* Header */}
                {/* <PhotoHeader/> */}
                <DialogTitle>
                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                        <Box>
                            <Button startIcon={<KeyboardBackspaceIcon />} onClick={() => (navigate('/events/', { replace: true }))} color='inherit' variant='contained'>{photo?.event?.event_name}</Button>
                        </Box>
                        <Box display={'flex'} gap={1}>
                            {authuser?.role != 'P' && <DownloadButton photo_id={photo_id} photo_name={photo?.image_url} event_name={photo?.event?.event_name ?? ''} />}
                            <IconButton onClick={handleClose} sx={{
                                borderRadius: 1,
                                width: 40,
                                height: 40,
                            }} color='inherit'  >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ xs: '60vh', md: '80vh' }}>
                    <Grid container>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Box
                                sx={{
                                    height: { xs: '60vh', md: '70vh' },
                                    overflow: 'hidden',
                                    borderRadius: 2,
                                }}
                            >
                                <img
                                    src={photo?.image_url}
                                    alt={photo?.photo_id}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        display: 'block',
                                    }}
                                />
                            </Box>
                            <Box display={'flex'} gap={0.2} justifyContent={'center'}>
                                {/* Like */}
                                <IconButton onClick={ToggleLike} sx={{ borderRadius: 1 }}>
                                    <Stack alignItems={'center'} >
                                        {like ? <Favorite /> : <FavoriteBorder />}
                                        <Typography>{photo?.like_count}</Typography>
                                    </Stack>
                                </IconButton>
                                <IconButton onClick={ToggleFavourite} sx={{ borderRadius: 1 }}>
                                    <Stack alignItems={'center'} >
                                        {favourite ? <Bookmark /> : <BookmarkBorder />}
                                        <Typography>Favourite</Typography>
                                    </Stack>
                                </IconButton>
                                <IconButton onClick={handleShare} sx={{ borderRadius: 1 }}>
                                    <Stack alignItems={'center'} >
                                        <ShareOutlined />
                                        <Typography>Share</Typography>
                                    </Stack>
                                </IconButton>

                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper elevation={3} sx={{
                                p: { xs: 1, md: 2.5 }, borderRadius: { xs: 2, md: 3 },
                                background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={0.5} textAlign={'center'}>
                                    <Typography variant="subtitle1" color="text.primary"> Photographer:</Typography>
                                    <Link to={`/profile/${selectedEvent?.event_photographer}`} style={{ textDecoration: 'None' }}> {selectedEvent?.event_photographer} </Link>
                                </Stack>
                                <Divider />
                                {Object.entries(photoEventDetails).map(([label, value]) =>
                                    value ? (
                                        <Box key={label}>
                                            <Stack direction="row" spacing={1} alignItems="center" my={0.5}>
                                                <Typography variant="body2" color="text.secondary"> {label}:</Typography>
                                                <Typography variant="body2"> {value} </Typography>
                                            </Stack>
                                            <Divider />
                                        </Box>
                                    ) : null
                                )}
                                <Stack direction="row" spacing={1} alignItems="center" my={1} textAlign={'center'}>
                                    <Typography sx={{fontWeight:600}}>Tags:</Typography>
                                    {
                                        photo?.tag && photo?.tag.length > 0 ?
                                            photo.tag.map((e) => (
                                                <Typography key={e} color='primary' onClick={()=> window.open(`https://www.google.com/search?q=${encodeURIComponent(e)}&tbm=isch`,'_blank')}  sx={{
                                                    backgroundColor:'rgb(239, 239, 239)',
                                                    borderRadius:0.5,
                                                    mr:0.5, px:0.5,
                                                    '&:hover': {
                                                        cursor:'pointer'
                                                    }
                                                }}
                                                > #{e} </Typography>
                                            )) : <Typography>No Tags Available</Typography>
                                    }
                                </Stack>
                                {/* INFO page and People Tagged Accordion */}
                                <Accordion defaultExpanded >
                                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" expandIcon={<ExpandMore />} >
                                        <Typography component="span" color='inherit'>INFO</Typography>
                                    </AccordionSummary>
                                    <Divider />
                                    <AccordionDetails>
                                        {
                                            hasAnyEXIFData(photo?.exifData) ? <PhotoEXIFData exif={photo?.exifData} /> :
                                                <Typography variant='subtitle2' color='text.secondary'> No EXIF Data exists for this Photo </Typography>
                                        }
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion defaultExpanded >
                                    <AccordionSummary aria-controls="panel2d-content" id="panel2d-header" expandIcon={<ExpandMore />}>
                                        <Typography component="span">People Tagged</Typography>
                                    </AccordionSummary>
                                    <Divider />
                                    <AccordionDetails sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <AvatarGroup>
                                            {photo?.tagged_user && photo?.tagged_user.length > 0 ?
                                                taggedUsers.map((user) => (
                                                    <Tooltip key={user.username} title={user.username}>
                                                        <Avatar alt={user.username} src={user.profile_pic}
                                                            sx={{
                                                                transition: '0.20s',
                                                                '&:hover': {
                                                                    cursor: 'pointer',
                                                                    transform: "translateY(-1px)",
                                                                }
                                                            }}
                                                            onClick={() => navigate(`/profile/${user.username}`)}
                                                        />
                                                    </Tooltip>

                                                )) : <Typography>No one Tagged</Typography>
                                            }
                                        </AvatarGroup>
                                    </AccordionDetails>
                                </Accordion>
                                {/* Comment Section */}
                                {photo_id && <CommentSection photo_id={photo_id} />}
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog >
            <Button onClick={() => setOpen(!open)} variant='contained'>Open dialog box</Button>
        </>
    )
}

export default PhotoView
