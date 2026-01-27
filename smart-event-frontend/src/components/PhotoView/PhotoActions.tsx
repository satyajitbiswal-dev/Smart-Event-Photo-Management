import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Favorite, FavoriteBorder, Bookmark, BookmarkBorder, ShareOutlined, } from "@mui/icons-material";

type Props = {
    like: boolean;
    favourite: boolean;
    likeCount?: number;
    onLike: () => void;
    onFavourite: () => void;
    onShare: () => void;
    variant?: "desktop" | "mobile";
    isAuthenticated: boolean;
};

const PhotoActions = ({ like, favourite, likeCount = 0, onLike, onFavourite, onShare, variant = "desktop", isAuthenticated }: Props) => {
    const isMobile = variant === "mobile";

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                gap: isMobile ? 2 : 0.5,
                py: isMobile ? 1 : 0,
                bgcolor: isMobile ? "rgba(0,0,0,0.35)" : "transparent",
                backdropFilter: isMobile ? "blur(6px)" : "none",
                borderRadius: isMobile ? 2 : 0,
            }}
        >
            {/* LIKE */}
            <Tooltip title={!isAuthenticated ? "Login to like photos" : ""}>
                <span>
                    <IconButton
                        onClick={onLike}
                        // disabled={!isAuthenticated}
                        sx={{ color: isMobile ? "white" : "red" }}
                    >
                        <Stack alignItems="center">
                            {like ? <Favorite /> : <FavoriteBorder />}
                            {!isMobile && <Typography fontSize={12}>{likeCount}</Typography>}
                        </Stack>
                    </IconButton>
                </span>
            </Tooltip>


            {/* FAVOURITE */}
            <Tooltip title={!isAuthenticated ? "Login Required" : ""}>
                <span>
            <IconButton
                onClick={onFavourite}
                sx={{ color: isMobile ? "white" : "aqua" }}
            >
                <Stack alignItems="center">
                    {favourite ? <Bookmark /> : <BookmarkBorder />}
                    {!isMobile && <Typography fontSize={12}>Favourite</Typography>}
                </Stack>
            </IconButton>
            </span>
            </Tooltip>

            {/* SHARE */}
            <IconButton
                onClick={onShare}
                sx={{ color: isMobile ? "white" : "grey" }}
            >
                <Stack alignItems="center">
                    <ShareOutlined />
                    {!isMobile && <Typography fontSize={12}>Share</Typography>}
                </Stack>
            </IconButton>
        </Box>
    );
};

export default PhotoActions;
