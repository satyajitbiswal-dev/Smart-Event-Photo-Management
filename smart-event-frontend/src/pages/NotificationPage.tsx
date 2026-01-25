import { Box, Typography, List, ListItem, Button, Stack, IconButton, Tooltip } from "@mui/material"
import CircleIcon from "@mui/icons-material/Circle"
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../app/store"
import dayjs from "dayjs"
import { MarkEmailRead } from "@mui/icons-material"
import DeleteIcon from '@mui/icons-material/Delete';
import relativeTime from "dayjs/plugin/relativeTime";
import { clearAll, clearAllNotificationsAPI, deleteNotification, deleteNotificationAPI, markAllAsRead, markAllSeenAPI, markAsRead, markSeenAPI } from "../app/notificationslice";
import type { Notification } from "../types/types";
import { useNavigate } from "react-router-dom";
dayjs.extend(relativeTime);

const NotificationPage = () => {
  const notifications = useSelector((state: RootState) => state.notification.notifications)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  //mark as read
  const handleSeen = (n: Notification) => {
    if (!n.is_seen) {
      dispatch(markAsRead(n.id))
      markSeenAPI(n.id)
    }
  }

  // mark all as read
  const handleMarkAllRead = () => {
    dispatch(markAllAsRead())
    markAllSeenAPI()
  }

  // clear all
  const handleClearAll = () => {
    dispatch(clearAll())
    clearAllNotificationsAPI()
  }
  // delete
  const handleDelete = (n: Notification) => {
    dispatch(deleteNotification(n.id));   // optimistic
    deleteNotificationAPI(n.id);
  };


  const handleForward = (n: Notification) => {
    if(n.event_id){
      console.log(n.event_id);     
      navigate('event/:event_id/photos/')
    }
    else if(n.photo_id){
      console.log(n.photo_id);
      navigate('')
    }
    else return
  }
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 }, maxWidth: 720,
        mx: "auto",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant={'h6'}>
          Notifications
        </Typography>
        <Box>
          <Button
            size="small"
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
          <Tooltip title="Clear all notifications">
            <IconButton size="small" color="error" onClick={handleClearAll}>
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        </Box>

      </Stack>

      <List disablePadding >
        {notifications.map((n) => (
          <ListItem key={n.id} sx={{
            mb: 1, borderRadius: 2,
            backgroundColor: n.is_seen ? "grey.100" : "primary.light",
            opacity: n.is_seen ? 0.65 : 1,
            px: { xs: 1.5, sm: 2 },   py: { xs: 1, sm: 1.5 },
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "action.hover",
            },
            "&:hover .notif-actions": {
              opacity: 1,
            },
          }}
          onClick = {() => handleForward(n)}
          >
            <Box display={'flex'} alignItems={'center'} width={'100%'}>
              {!n.is_seen && (
                <CircleIcon sx={{ fontSize: 10, color: "primary.main", mt: 1, mr: 1.5 }} />
              )}
              <Box display={'flex'} flexDirection={'column'} gap={1} >
                <Typography
                  fontSize={14}
                  fontWeight={n.is_seen ? 400 : 600}
                >
                  {n.text_message}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {dayjs(n.send_time).fromNow()}
                </Typography>
              </Box>
              <Box className='notif-actions' sx={{
                display: "flex", gap: 0.5, opacity: 0,
                transition: "opacity 0.2s",
                mr: 0, ml: "auto",
              }}
              >
                {!n.is_seen && (
                  <Tooltip title="Mark as read">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleSeen(n)}} >
                      <MarkEmailRead fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Delete">
                  <IconButton size="small" color="error" 
                  onClick={(e) =>  
                    {e.stopPropagation() 
                    handleDelete(n)}}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

            </Box>

          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default NotificationPage


//  Arrow to redirect them to app