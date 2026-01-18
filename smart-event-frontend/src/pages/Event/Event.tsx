import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Grid, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import ShareButton from '../../components/buttons/ShareButton'
import { red } from '@mui/material/colors'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom'
import { fetchEvents } from '../../app/eventslice'

const Event = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchEvents())
    }, [dispatch])
    const eventList = useSelector((state: RootState) => state.event.events)
    const navigate = useNavigate()
    return (
        <Box sx={{ backgroundColor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
            <Grid container columnSpacing={3} rowSpacing={4}>
                {
                    eventList.length > 0 &&
                    //make cards for every event
                    eventList.map((event) => (
                        <Grid key={event.id} size={{ xs: 12, md: 3, sm: 4 }} >
                            <Card >
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: red[500] }} aria-label="event">
                                            {event.event_name[0]}
                                        </Avatar>
                                    }
                                    title={event.event_name}
                                    subheader={event.event_date}
                                    action={
                                        <>
                                        
                            <IconButton
                                id="basic-button"
                                aria-controls={openMenu ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={openMenu ? 'true' : undefined}
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={openMenu}
                                onClose={() => setAnchorEl(null)}
                            >
                                <MenuItem onClick={() => { navigate(`${event.id}/photos/`); setAnchorEl(null); }}>
                                    Read More
                                </MenuItem>
                                <MenuItem onClick={() => setAnchorEl(null)}>
                                    <ShareButton event={event} />
                                </MenuItem>
                            </Menu>
                            </>
                            }
                                />
                                <CardMedia
                                    component="img"
                                    height="150"
                                    image="https://picsum.photos/id/233/200/300"
                                    alt="event_photo"
                                />
                                <CardContent>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {event.description}
                                    </Typography>

                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                Organized by
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                {event.event_coordinator}
                                            </Typography>
                                        </Box>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                                        <Box>
                                            <Button variant='contained' onClick={() => navigate(`${event.id}/photos/`)}>Photos </Button>
                                        </Box>
                                        <Box>
                                            <ShareButton event={event} />
                                            {/* <Button variant='outlined' > Read More </Button> */}
                                        </Box>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    )
}

export default Event


