import { useRef } from "react";
import { MenuItem, Typography, Divider, Box, IconButton, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { markAsRead, markSeenAPI, deleteNotificationAPI, deleteNotification } from "../../app/notificationslice";
import type { AppDispatch } from "../../app/store";
import type { Notification } from "../../types/types";
import DeleteIcon from '@mui/icons-material/Delete';
import { MarkEmailRead } from '@mui/icons-material';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);


type Props = {
    notification: Notification;
    menuopen: boolean;
};

const NotificationItem = ({ notification }: Props) => {
    const ref = useRef<HTMLLIElement | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const handleSeen = () => {
        if (!notification.is_seen) {
            dispatch(markAsRead(notification.id))
            markSeenAPI(notification.id)
        }
    }

    const handleDelete = () => {
        dispatch(deleteNotification(notification.id));   // optimistic
        deleteNotificationAPI(notification.id);
    };

    return (
        <MenuItem
            ref={ref}
            sx={{
                alignItems: "flex-start",
                gap: 1,
                py: 1.2,
                "&:hover .notif-actions": {
                    opacity: 1,
                },
            }}
        >
            <Box flex={1}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: notification.is_seen ? 400 : 600,
                        whiteSpace: "normal",
                    }}
                >
                    {notification.text_message}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {dayjs(notification.send_time).fromNow()}
                </Typography>
            </Box>

            <Box
                className="notif-actions"
                sx={{
                    display: "flex",
                    gap: 0.5,
                    opacity: 0,
                    transition: "opacity 0.2s",
                }}
            >
                {!notification.is_seen && (
                    <Tooltip title="Mark as read">
                        <IconButton  size="small"  onClick={handleSeen}>
                            <MarkEmailRead fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                <Tooltip title="Delete">
                    <IconButton size="small" onClick={handleDelete} color="error" >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </MenuItem>

    );
};

export default NotificationItem;