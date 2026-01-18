import React, { useState } from 'react'
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, Divider, IconButton, Link, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { selectTopUnreadNotifications } from '../../app/notificationslice';
import type { Notification } from '../../types/types';
import NotificationItem from './NotificationItem';
import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';

const Notification = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const navigate = useNavigate()

    const unread = useSelector((state: RootState) => state.notification.notifications.filter(
        (e) => e.is_seen === false
    ))
    const toptemunread = useSelector(selectTopUnreadNotifications)


    const handleOpenNotifications = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }


    return (<>
        <Tooltip title='Open Notifications' >
            <IconButton sx={{ p: 0, mr: { xs: 1.5, md: 2.5 } }} onClick={handleOpenNotifications}>
                <Badge badgeContent={unread.length} max={10} color="info">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
        </Tooltip>

        <Menu id='menu-notification' anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            keepMounted
            sx={{ maxHeight: 300 }}
        >
            {
                toptemunread.length > 0 ?
                    toptemunread.map((notif) => (
                        <NotificationItem key={notif.id} notification={notif} menuopen={Boolean(anchorEl)} />
                    ))
                    : <Typography> No recent unread Notification </Typography>
            }
            <Divider />

            <MenuItem
                onClick={() => {
                    navigate("/notifications");
                    handleClose(); 
                }}
                sx={{
                    justifyContent: "center",
                    fontWeight: 500,
                    color: "primary.main",
                }}
            >
                View all notifications
            </MenuItem>
        </Menu >
    </>
    )
}

export default Notification

{/* <Link href="#" underline="none"> View More </Link> */ }