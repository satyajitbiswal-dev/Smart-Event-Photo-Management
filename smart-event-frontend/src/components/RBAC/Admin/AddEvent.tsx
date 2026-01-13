import { Autocomplete, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import privateapi from '../../../services/AxiosService';
import type { MemberProfile, Event } from '../../../types/types';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store';
import { createEvent } from '../../../app/eventslice';
import { fetchUsers } from '../../../app/userslice';

const AddEvent = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [error, setError] = useState<string | null>()

    const [coordinator, setCoordinator] = useState<MemberProfile | null>(null)
    const [photographer, setPhotographer] = useState<MemberProfile | null>(null)

    const userlist = useSelector((state:RootState) => state.user.userlist)
    const dispatch = useDispatch<AppDispatch>()

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setError(null);
        setCoordinator(null);
        setPhotographer(null);
        setOpen(false);
    };


    useEffect(() => {
        dispatch(fetchUsers())
    },[dispatch])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson: Partial<Event> = Object.fromEntries((formData as any).entries());
        formJson.event_coordinator = coordinator?.email;
        formJson.event_photographer = photographer?.email;
        try {
            await dispatch(createEvent(formJson)).unwrap();
            handleClose();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.non_field_errors || "Something went wrong");
            } else {
                setError("Unknown error occurred");
            }
        }
    };

        return (
            <>
                <Card sx={{ my: 2 }}>
                    <CardContent>
                        <Button color='primary'
                            onClick={() => { setOpen(true) }}
                            startIcon={<AddCircleOutlineRoundedIcon />}
                        >
                            Create New Event
                        </Button>
                    </CardContent>
                </Card>
                <Dialog open={open} fullWidth maxWidth="sm" disableEnforceFocus>
                    <DialogTitle>Create a New Event</DialogTitle>
                    <DialogContent dividers sx={{
                        px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
                    }}>
                        <form onSubmit={handleSubmit} id="subscription-form">
                            {/* event name */}
                            <Stack spacing={2}>
                                <Stack>
                                    <Typography variant="body2" color="text.primary">
                                        Event Name
                                    </Typography>
                                    <TextField
                                        name="event_name"
                                        type="text"
                                        fullWidth
                                        size="small"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        // onChange={handleChange}
                                        sx={{ mt: 0.5 }}
                                    />
                                </Stack>
                                {/* event date */}
                                <Stack>

                                    <Typography variant="body2" color="text.primary">
                                        Event Date
                                    </Typography>
                                    <TextField
                                        name="event_date"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        // onChange={handleChange}
                                        sx={{ mt: 0.5 }}
                                    />
                                </Stack>

                                {/* event coordinator fetch list of students(email)*/}
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" color="text.primary">
                                        Event Coordinator
                                    </Typography>
                                    <Autocomplete
                                        disablePortal
                                        fullWidth
                                        options={userlist ?? []}
                                        value={coordinator}
                                        onChange={(e, newValue) => setCoordinator(newValue)}
                                        getOptionLabel={(option) => option.email || ""}
                                        renderInput={(params) => <TextField {...params} size='small' required placeholder='Enter the user email' helperText="User must be an active member or admin of club" fullWidth />}
                                        renderOption={(props, option) => {
                                            const { key, ...restprops } = props
                                            return (<li key={key} {...restprops}>
                                                <Box sx={{
                                                    width: "100%", px: 1.5, py: 1, borderRadius: 1,
                                                    "&:hover": { bgcolor: "grey.100" },
                                                }}
                                                >
                                                    <Typography fontSize={14} fontWeight={600}>
                                                        {option.email}
                                                    </Typography>
                                                    <Typography fontSize={12} color="text.secondary">
                                                        {option.username}
                                                    </Typography>
                                                </Box>
                                            </li>
                                            )
                                        }}

                                    />
                                </Stack>
                                <Stack spacing={0.5}>
                                    <Typography variant="body2" color="text.primary">
                                        Event Photographer
                                    </Typography>
                                    <Autocomplete disablePortal fullWidth options={userlist ?? []}
                                        value={photographer}
                                        onChange={(e, newValue) => setPhotographer(newValue)}
                                        getOptionLabel={(option) => option.email || ""}
                                        renderInput={(params) => <TextField {...params} size='small' required placeholder='Enter the user email' helperText="User must be an active member or admin of club" fullWidth />}
                                        renderOption={(props, option) => {
                                            const { key, ...restprops } = props
                                            return (<li key={key} {...restprops}>
                                                <Box sx={{
                                                    width: "100%", px: 1.5, py: 1, borderRadius: 1,
                                                    "&:hover": { bgcolor: "grey.100" },
                                                }}
                                                >
                                                    <Typography fontSize={14} fontWeight={600}>
                                                        {option.email}
                                                    </Typography>
                                                    <Typography fontSize={12} color="text.secondary">
                                                        {option.username}
                                                    </Typography>
                                                </Box>
                                            </li>
                                            )
                                        }}
                                    />
                                </Stack>
                            </Stack>
                            {/* event photographer fetch list of students(email)*/}

                        </form>
                        {error && <Typography color="error" variant="body2" mt={1}>
                            {error}
                        </Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" form="subscription-form">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        )
    }

    export default AddEvent


