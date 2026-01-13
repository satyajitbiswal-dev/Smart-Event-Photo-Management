import { Autocomplete, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import axios from 'axios';
import type { Event } from '../../../types/types';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../app/store';
import { deleteEvent, fetchEvents } from '../../../app/eventslice';


const RemoveEvent = () => {
    const [open, setOpen] = useState<boolean>(false)
    // const [event, setEvent] = useState<Event[] | null>(null)
    const [removedEvent, setRemovedEvent] = useState<Event | null>(null)
    const [error, setError] = useState<string | null>(null)

    const events = useSelector((state: RootState) => state.event.events)
    const dispatch = useDispatch<AppDispatch>()

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setError(null);
        setRemovedEvent(null)
        setOpen(false);
    };
    useEffect(() => {
        dispatch(fetchEvents())
    }, [dispatch])
    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!removedEvent) return;
        try{
            const id:string = removedEvent.id
            await dispatch(deleteEvent(id)).unwrap()
            handleClose()
        }catch(error){
            if(axios.isAxiosError(error)){
                    setError(error?.response?.data)
                    console.log(error);
                    
                }else{
                    console.log(error);
            }
        }
        
    };
    return (
        <>
            <Card>
                <CardContent>
                    <Button color='primary'
                        onClick={() => { setOpen(true) }}
                        startIcon={<RemoveCircleRoundedIcon />}
                    >
                        Remove an Event
                    </Button>
                </CardContent>
            </Card>
            <Dialog open={open} fullWidth maxWidth="sm" disableEnforceFocus>
                <DialogTitle>Remove an Event</DialogTitle>
                <DialogContent dividers sx={{
                    px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
                }}>
                    <form onSubmit={handleSubmit} id="remove-event-form">
                        <Typography variant="body2" color="text.primary">
                                    Enter the event
                        </Typography>
                        <Autocomplete disablePortal fullWidth
                        options={events ?? []}
                        renderInput={(params)=><TextField {...params} size='small' required fullWidth placeholder='Enter the Event name and date' />}
                        value={removedEvent}
                        getOptionLabel={(option)=> option ? `${option.event_name}(${option.event_date})` : ""}
                        onChange={(e, newValue: Event | null)=> setRemovedEvent(newValue)}
                        renderOption={(props, option)=>{
                            const {key, ...restProps} = props
                            return(
                                <li key={key} {...restProps}>
                                     <Box sx={{ width: "100%", px: 1.5, py: 1, borderRadius: 1,
                                            "&:hover": {  bgcolor: "grey.100"    },
                                        }}
                                    >
                                        <Typography fontSize={14} fontWeight={600}>
                                            {option.event_name}
                                        </Typography>
                                        <Typography fontSize={12} color="text.secondary">
                                            {option.event_date}
                                        </Typography>
                                    </Box>
                                </li>
                            )}

                        }
                        />
                            
                    </form>
                    {error && <Typography color="error" variant="body2" mt={1}>
                        {error}
                    </Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type='submit' form='remove-event-form' variant='contained' color='error'>Remove</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default RemoveEvent