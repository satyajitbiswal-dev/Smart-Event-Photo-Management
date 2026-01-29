/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import type { RootState, AppDispatch } from "../../app/store";
import { fetchPhotoDetails, addLikeAPI, removeLikeAPI, photoLiked, addFavouritesAPI, removeFavouritesAPI, addtoFavourites, removeFromFavourites, } from "../../app/photoslice";
import { fetchEvents } from "../../app/eventslice";
import { fetchUsers } from "../../app/userslice";

import DownloadButton from "../../components/buttons/DownloadButton";
import CommentSection from "../../components/PhotoView/CommentSection";
import PhotoINFO from "../../components/PhotoView/PhotoINFO";
import PhotoActions from "../../components/PhotoView/PhotoActions";
import PhotoTopBar from "../../components/PhotoView/PhotoTopBar";
import { selectIsAuthenticated } from "../../app/authslice";
import privateapi from "../../services/AxiosService";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { makeSelectContextPhotos, makeSelectEventPhotos } from "../../app/selectors/photoSelector";



const PhotoView = () => {
    const { photo_id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    /* state */
    const authuser = useSelector((s: RootState) => s.auth.user);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    // const photos = useSelector((s:RootState)=> )
    const photo = useSelector((s: RootState) => photo_id ? s.photo.photosById[photo_id] : null);
    const events = useSelector((s: RootState) => s.event.events);
    const users = useSelector((s: RootState) => s.user.userbyEmails);

    const [favourite, setFavourite] = useState(false);
    const viewedRef = useRef(false);
    /* fetch data */
    useEffect(() => {
        if (!photo_id) return;

        if (!photo || !photo.hasFullDetails) dispatch(fetchPhotoDetails(photo_id));
        if (events.length === 0) dispatch(fetchEvents());
        dispatch(fetchUsers());
    }, [photo_id]);

    useEffect(() => {
        if (!photo_id || viewedRef.current) return; //used ref taaki No more rerender
        viewedRef.current = true;
        privateapi.post(`/photos/${photo_id}/view/`, {});
    }, [photo_id]);

    /* derive data  */
    const selectedEvent = events.find((e) => e.id === photo?.event);

    const taggedUsers =(photo?.tagged_user ?? []).map((email) => users[email]).filter(Boolean);
    const photographer = selectedEvent?.event_photographer &&  users[selectedEvent.event_photographer] ? 
    users[selectedEvent.event_photographer].username: "";

    /*  sync like/fav  */
    useEffect(() => {
        if (!photo || !authuser?.email) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFavourite(false);
            return;
        }
        const favUsers = photo.is_favourite_of ?? [];
        setFavourite(favUsers.includes(authuser.email));

    }, [photo, authuser]);


    /*  handlers */
    const like = !!authuser?.email && !!photo && Array.isArray(photo.liked_users) &&
        photo.liked_users.includes(authuser.email);

    const handleLike = async () => {
        if (!photo_id || !authuser) return;
        const res = like ? await removeLikeAPI(photo_id) : await addLikeAPI(photo_id);
        dispatch(photoLiked({
            photo_id,
            like_count: res.data.like_count,
            user_email: authuser.email,
            actionType: like ? "remove" : "add",
        }));
    };

    const handleFavourite = async () => {
        if (!photo_id || !authuser) return;

        try {
            if (favourite) {
                await removeFavouritesAPI(photo_id);
                dispatch(removeFromFavourites(photo_id));
            } else {
                await addFavouritesAPI(photo_id);
                dispatch(addtoFavourites(photo_id));
            }
            setFavourite(!favourite);
        } catch {
            toast.error("Failed to update favourite or you shoould login to try");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
    };

    const location = useLocation()

    const context = location.state?.source ?? "event"
    const event_id = location.state?.event_id

    const photos = useSelector(useMemo(() => {
        if (context === "event") {
          return makeSelectEventPhotos(event_id!);
        }
        return makeSelectContextPhotos(context);
      }, [context, event_id])
      );

    const currentIndex = photos.findIndex(p => p.photo_id === photo_id)

    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < photos.length - 1

    const goPrev = () => {
        if (!hasPrev) return
        const prevPhoto = photos[currentIndex - 1]
        navigate(`/photos/${prevPhoto.photo_id}`,{
            replace:true,
            state:{
        source: context,
        event_id: event_id,
        }
        })
    }

    const goNext = () => {
        if (!hasNext) return
        const nextPhoto = photos[currentIndex + 1]
        navigate(`/photos/${nextPhoto.photo_id}`, {
            replace:true,
            state:{
        source: context,
        event_id: event_id,
        }
        })
    }

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [currentIndex, photos])

    if (!photo || !photo?.hasFullDetails) return null;

    return (
        <Dialog open fullScreen={isMobile} maxWidth="xl" fullWidth>
            {/* desktop   */}
            {!isMobile && (
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button
                            startIcon={<KeyboardBackspaceIcon />}
                            onClick={() => navigate(`/events/${selectedEvent?.id}/photos/`)}
                        >
                            {selectedEvent?.event_name}
                        </Button>

                        <Box display="flex" gap={1}>
                            {(isAuthenticated || authuser?.role !== "P") && (
                                <DownloadButton
                                    photo_id={photo_id}
                                    photo_name={photo.image_url}
                                    event_name={selectedEvent?.event_name ?? ""}
                                />
                            )}
                            <IconButton onClick={() => navigate(-1)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
            )}

            {/*  CONTENT  */}
            <DialogContent sx={{ p: 0, overflow: "hidden", height: isMobile ? "100%" : '100vh', }}>
                <Grid container sx={{ height: "100%" }}>
                    {/*  PHOTO */}
                    <Grid size={{ xs: 12, md: 8 }}
                        sx={{
                            height: "100%",
                            position: "relative",
                            bgcolor: "black",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* MOBILE TOP BAR */}
                        {isMobile && (
                            <PhotoTopBar
                                onBack={() => navigate(-1)}
                                photo={photo}
                                selectedEvent={selectedEvent}
                                taggedUsers={taggedUsers}
                                photographer={photographer}
                            />
                        )}

                        <Box sx={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <img
                                src={photo.image_url}
                                alt={photo.photo_id}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                    pointerEvents: "none",
                                }}
                            />

                            <IconButton
                                onClick={goPrev}
                                disabled={!hasPrev}
                                sx={{ position: "absolute",
                                    left: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    zIndex: 2,
                                }}
                            >
                                <ArrowBackIosNewIcon />
                            </IconButton>

                            <IconButton
                                onClick={goNext}
                                disabled={!hasNext}
                                sx={{
                                    position: "absolute",
                                    right: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "white",
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                    zIndex: 2,
                                }}
                            >
                                <ArrowForwardIosIcon />
                            </IconButton>
                        </Box>


                        {/* ACTIONS */}
                        {!isMobile && (

                            <PhotoActions
                                like={like}
                                favourite={favourite}
                                likeCount={photo.like_count}
                                onLike={handleLike}
                                onFavourite={handleFavourite}
                                onShare={handleShare}
                                isAuthenticated={isAuthenticated}
                            />

                        )}

                        {isMobile && (
                            <Box position="absolute" bottom={12} width="100%">
                                <PhotoActions
                                    variant="mobile"
                                    like={like}
                                    favourite={favourite}
                                    onLike={handleLike}
                                    onFavourite={handleFavourite}
                                    onShare={handleShare}
                                    isAuthenticated={isAuthenticated}
                                />
                            </Box>
                        )}
                    </Grid>

                    {/*  INFO + COMMENTS (DESKTOP ONLY)  */}
                    {!isMobile && (
                        <Grid size={{ md: 4 }}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                            }}
                        >
                            {/* INFO */}
                            <Box p={2}  >
                                <PhotoINFO
                                    photo={photo}
                                    selectedEvent={selectedEvent}
                                    taggedUsers={taggedUsers}
                                    photographer={photographer}
                                />
                            </Box>

                            {/* COMMENTS */}
                            <Box sx={{ flex: 1, overflowY: "auto" }}>
                                <CommentSection photo_id={photo_id!} />
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default PhotoView;
