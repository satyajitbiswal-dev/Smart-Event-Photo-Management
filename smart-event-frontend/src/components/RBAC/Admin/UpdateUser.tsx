import { Autocomplete, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store';
import type { User } from '../../../types/types';
import { fetchUsers, updateUser } from '../../../app/userslice';
import axios from 'axios';


const UpdateUser = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [error, setError] = useState<string | null>()

    const userlist = useSelector((state: RootState) => state.user.userlist)
    const dispatch = useDispatch<AppDispatch>()
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setError(null);
        setSelectedUser(null);
        setOpen(false);
    };

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedUser) return;
        const formData = new FormData(event.currentTarget)
        const formJson: Partial<User> = Object.fromEntries(formData.entries())
        try {
            const email: string = selectedUser.email
            dispatch(updateUser({ email: email, data: formJson })).unwrap()
            handleClose()
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                console.log(err.response?.data);   // 👈 asli backend error

                const data = err.response?.data;

                // Agar field-wise errors hain
                if (typeof data === "object") {
                    const formattedErrors: any = {};
                    Object.keys(data).forEach((key) => {
                        formattedErrors[key] = data[key][0];
                    });
                    console.log(formattedErrors);
                }
                // Agar sirf ek message aaya
                else {
                    console.log({ general: "Something went wrong" });
                }
            } else {
                console.log({ general: "Unknown error occurred" });
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
                        Update User Credentials
                    </Button>
                </CardContent>
            </Card>
            <Dialog open={open} fullWidth maxWidth="sm" disableEnforceFocus>
                <DialogTitle>Remove User</DialogTitle>
                <DialogContent dividers sx={{
                    px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 },
                }}>
                    <form onSubmit={handleSubmit} id="update-user-role">
                        <Stack spacing={2}>
                            {/* <Typography variant="body2" color="text.primary">
                                Email
                            </Typography> */}
                            <Autocomplete
                                disablePortal
                                fullWidth
                                options={userlist ?? []}
                                value={selectedUser}
                                onChange={(e, newValue: User | null) => setSelectedUser(newValue)}
                                getOptionLabel={(option) => option.email || ""}
                                renderInput={(params) => <TextField {...params} size='small' required label="Email" placeholder='Enter the user email' fullWidth />}
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
                                                role = {option.role}
                                            </Typography>
                                        </Box>
                                    </li>
                                    )
                                }}

                            />
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
                        </Stack>
                    </form>
                    {error && <Typography color="error" variant="body2" mt={1}>
                        {error}
                    </Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined' >Cancel</Button>
                    <Button type='submit' form='update-user-role' variant='contained' color='success'>Update</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default UpdateUser