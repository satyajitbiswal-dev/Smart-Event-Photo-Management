import {
  Box,
  IconButton,
  Drawer,
  Typography,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  InfoOutlined,
  ChatBubbleOutline,
} from "@mui/icons-material";
import { useRef, useState } from "react";
import PhotoINFO from "./PhotoINFO";
import CommentSection from "./CommentSection";
import type { Photo } from "../../types/types";
import type { Event } from "../../types/types";
import type { User } from "../../types/types";

type Props = {
  onBack: () => void;
  photo: Photo;
  selectedEvent?: Event;
  taggedUsers: User[];
  photographer: string
};

const PhotoTopBar = ({ onBack, photo, selectedEvent, taggedUsers, photographer }: Props) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);


  const handleOnClick = () => {
    console.log('Clicked Info');
    setInfoOpen(true)

  }

  return (
    <>
      {/* top */}
      <Box ref={containerRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          px: 1,               // 🔥 horizontal padding
          py: 0.5,
          pointerEvents: "auto",
          bgcolor: "rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          onClick={onBack}
          sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white" }}
        >
          <ArrowBack />
        </IconButton>

        <Box>
          <IconButton onClick={handleOnClick}
            sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white", mr: 1 }}
          >
            <InfoOutlined />
          </IconButton>
          <IconButton
            onClick={() => setCommentOpen(true)}
            sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white" }}
          >
            <ChatBubbleOutline />
          </IconButton>
        </Box>
      </Box>

      {/*info */}
      <Drawer
        container={() => containerRef.current}   // 🔥 THIS
        ModalProps={{
          keepMounted: true,
        }}
        anchor="right"
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 300,
            zIndex: 1302,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography fontWeight={700} mb={1}>
            Photo Info
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <PhotoINFO
            photo={photo}
            selectedEvent={selectedEvent}
            taggedUsers={taggedUsers}
            photographer={photographer}
          />
        </Box>
      </Drawer>

      {/* comment */}
      <Drawer
        container={() => containerRef.current}
        ModalProps={{
          keepMounted: true,
        }}
        anchor="bottom"
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
      >
        <Box
          sx={{
            height: "70vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <CommentSection photo_id={photo.photo_id} />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default PhotoTopBar;
