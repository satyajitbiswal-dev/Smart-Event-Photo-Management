import React, { useState } from 'react'
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton, Menu, Tooltip } from '@mui/material';

const Notification = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const handleOpenNotifications = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    return (<>
        <Tooltip title='Open Notifications' onClick={handleOpenNotifications}>
            <IconButton sx={{ p: 0, mr: { xs: 1.5, md: 2.5 } }}>
                <Badge badgeContent={1} max={10} color="info">
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
        >
        
        </Menu>
    </>
    )
}

export default Notification
