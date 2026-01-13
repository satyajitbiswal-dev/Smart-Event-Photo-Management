import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../app/store';
import type { User } from '../../../types/types';
import axios from 'axios';
import { createUser } from '../../../app/userslice';

const AddUser = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const dispatch = useDispatch<AppDispatch>()

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setError(null);
        setOpen(false);
    };

    useEffect(() => {

    }, [])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget)
        const formJson: Partial<User> = Object.fromEntries(formData.entries())
        try {
            await dispatch(createUser(formJson)).unwrap()
            handleClose()
        }  catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data || "Something went wrong");
                console.log("error",error);
            } else {
                setError(error?.email);
                console.log("error",error);
                
            }
        }
    };
    return (
        <>
            <Card sx={{ my: 2 }}>
                <CardContent>
                    <Button color='primary'
                        onClick={() => { setOpen(true) }}
                        startIcon={<PersonAddAltRoundedIcon />}
                    >
                        Add User
                    </Button>
                </CardContent>
            </Card>
            <Dialog open={open} fullWidth maxWidth="sm" disableEnforceFocus>
                <DialogTitle>Add a new User</DialogTitle>
                <DialogContent dividers sx={{
                    px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
                }}>
                    <form onSubmit={handleSubmit} id="user-creation-form">
                        <Stack spacing={2}>
                            {/* Email */}
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                required
                                fullWidth
                                size="small"
                            />
                            {/* Role */}
                            <TextField
                                name="role"
                                label="Role"
                                select
                                required
                                fullWidth
                                size="small"
                                defaultValue=""
                            >
                                <MenuItem value="A">Admin</MenuItem>
                                <MenuItem value="M">Member</MenuItem>
                            </TextField>

                            {/* Submit */}</Stack>
                    </form>
                    {error && <Typography color="error" variant="body2" mt={1}>
                        {error}
                    </Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined'>Cancel</Button>
                    <Button type="submit" form="user-creation-form" variant='contained'>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default AddUser