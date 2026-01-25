import { Autocomplete, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store';
import type { User } from '../../../types/types';
import { deleteUser, fetchUsers } from '../../../app/userslice';
import axios from 'axios';


const RemoveUser = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [error, setError] = useState<string | null>()

    const userlist = useSelector((state:RootState)=>state.user.userlist)
    const dispatch = useDispatch<AppDispatch>()
    const [removedUser,setRemovedUser] = useState<User | null>(null)

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setError(null);
        setRemovedUser(null);
        setOpen(false);
    };

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!removedUser) return;
        try {
            const email = removedUser.email
            await dispatch(deleteUser(email)).unwrap()
            handleClose()
        }  catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data || "Something went wrong");
                console.log("error",error?.response?.data.error);
            } else {
                // setError(error?.email || "Unkown Error Occured Please try again or contact the team");
                console.log("error",error.response.data.error);
                
            }
        }
    };
    return (
        <>
            <Card sx={{ my: 2 }}>
                <CardContent>
                    <Button color='primary'
                        onClick={() =>{ setOpen(true)}}
                        startIcon={<PersonRemoveRoundedIcon />}
                    >
                        Remove User
                    </Button>
                </CardContent>
            </Card>
            <Dialog open={open} fullWidth maxWidth="sm" disableEnforceFocus>
                <DialogTitle>Remove User</DialogTitle>
                <DialogContent dividers sx={{
                    px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
                }}>
                    <form onSubmit={handleSubmit} id="remove-event-form">
                        <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.primary">
                               Email
                            </Typography>
                            <Autocomplete
                                disablePortal
                                fullWidth
                                value={removedUser}
                                onChange={(e, newValue:User|null) => setRemovedUser(newValue)}
                                options={userlist ?? []}
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
                    </form>
                    {error && <Typography color="error" variant="body2" mt={1}>
                        {error}
                    </Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined' >Cancel</Button>
                    <Button type='submit' form='remove-event-form' variant='contained' color='error'>Remove</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default RemoveUser