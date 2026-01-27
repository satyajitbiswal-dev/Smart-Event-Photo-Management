/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate, useParams } from "react-router-dom";
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

const PhotoView = () => {
    const { photo_id } = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    /* state */
    const authuser = useSelector((s: RootState) => s.auth.user);
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const photo = useSelector((s: RootState) => photo_id ? s.photo.photosById[photo_id] : null);
    const events = useSelector((s: RootState) => s.event.events);
    const users = useSelector((s: RootState) => s.user.userbyEmails);

    const [favourite, setFavourite] = useState(false);

    /* fetch data */
    useEffect(() => {
        if (!photo_id) return;

        if (!photo || !photo.hasFullDetails) dispatch(fetchPhotoDetails(photo_id));
        if (events.length === 0) dispatch(fetchEvents());
        dispatch(fetchUsers());

    }, [photo_id]);

    /* derive data  */
    const selectedEvent = events.find((e) => e.id === photo?.event);

    const taggedUsers =
        (photo?.tagged_user ?? [])
            .map((email) => users[email])
            .filter(Boolean);


    const photographer =
        selectedEvent?.event_photographer &&
            users[selectedEvent.event_photographer]
            ? users[selectedEvent.event_photographer].username
            : "";

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

        const res = like
            ? await removeLikeAPI(photo_id)
            : await addLikeAPI(photo_id);
        console.log('res', res);


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
            toast.error("Failed to update favourite");
        }
    };


    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
    };


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
                            {authuser?.role !== "P" && (
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

                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={photo.image_url}
                                alt={photo.photo_id}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                    // display: "block",
                                    pointerEvents: "none",
                                }}
                            />
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
                            <Box p={2}>
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
