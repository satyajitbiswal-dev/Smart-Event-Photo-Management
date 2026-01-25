import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Grid, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import ShareButton from '../../components/buttons/ShareButton'
import { red } from '@mui/material/colors'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom'
import { fetchEvents } from '../../app/eventslice'
import { CalendarMonth } from '@mui/icons-material'

const EventPlaceholder = ({ title }: { title: string }) => (
    <Box
        sx={{
            height: 160,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background:
                "linear-gradient(135deg, #6366f1, #22d3ee)",
            color: "white",
        }}
    >
        <CalendarMonth sx={{ fontSize: 36, mb: 1 }} />
        <Typography fontSize={13} fontWeight={600}>
            {title}
        </Typography>
    </Box>
)


const Event = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const [activeEventId, setActiveEventId] = React.useState<string | null>(null)

    const openMenu = Boolean(anchorEl)

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchEvents())
    }, [dispatch])
    const eventList = useSelector((state: RootState) => state.event.events)
    const navigate = useNavigate()

  return (
    <Box sx={{ backgroundColor: '#f8fafc', py: { xs: 3, sm: 3, md: 4 }, px: { xs: 2, sm: 2 } }}>
        <Grid container columnSpacing={3} rowSpacing={4}>
            {
                eventList.length > 0 &&
                //make cards for every event
                eventList.map((event) => (
                    <Grid key={event.id} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                height: "100%",
                                borderRadius: 3,
                                cursor: "pointer",
                                transition: "0.25s",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: 6,
                                },
                            }}
                            onClick={() => navigate(`${event.id}/photos/`)}
                        >
                            {/* Thumbnail */}
                            <Box position="relative">
                                {/* <CardMedia
                                    component="img"
                                    height="160"
                                    // image={event.thumbnail || "/event-placeholder.jpg"}
                                    alt={event.event_name}
                                /> */}
                                <EventPlaceholder title={event.event_name} />
                                {/* Overlay */}
                                <Box
                                    position="absolute"
                                    bottom={0}
                                    width="100%"
                                    px={1.5}
                                    py={1}
                                    sx={{
                                        background:
                                            "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                                        color: "white",
                                    }}
                                >
                                    <Typography fontWeight={600} fontSize={14}>
                                        {event.event_name}
                                    </Typography>
                                    <Typography variant="caption">
                                        {event.event_date}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Content */}
                            <CardContent sx={{ pb: 1 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    {event.description}
                                </Typography>

                                <Box mt={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Organized by
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {event.event_coordinator}
                                    </Typography>
                                </Box>
                            </CardContent>

                            {/* Actions */}
                            <CardActions
                                sx={{
                                    pt: 0,
                                    px: 2,
                                    justifyContent: "space-between",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    View photos →
                                </Typography>

                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setAnchorEl(e.currentTarget)
                                        setActiveEventId(event.id)
                                    }}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </CardActions>
                        </Card>

                        {/* Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu && activeEventId === event.id}
                            onClose={() => setAnchorEl(null)}
                        >
                            <MenuItem
                                onClick={() => {
                                    navigate(`${event.id}/`)
                                    setAnchorEl(null)
                                }}
                            >
                                Read More
                            </MenuItem>

                            <MenuItem onClick={() => setAnchorEl(null)}>
                                <ShareButton event={event} />  
                            </MenuItem>
                        </Menu>
                    </Grid>

                ))
            }
        </Grid>
    </Box>
    )
}

export default Event




// Search by event name and event data