import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Close } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../app/store'
import { fetchEvents } from '../../../app/eventslice'
import { fetchUsers } from '../../../app/userslice'
import type { User, Event as AppEvent } from '../../../types/types'
import { toast } from 'react-toastify'
import { fetchPhotoDetails, updatePhotos } from '../../../app/photoslice'

type props = {
    isDialogOpened: boolean,
    onCloseDialog: () => void,
    photo_ids: string[],
    onClearSelection: () => void,
    event_id: string
}
        
// Bulk Update Photo  
const UpdatePhoto = ({ isDialogOpened, onCloseDialog, photo_ids, onClearSelection, event_id }: props) => {
    const authUser = useSelector((state: RootState) => state.auth.user)
    const eventlist = useSelector((state: RootState) => state.event.events)
    const userlist = useSelector((state: RootState) => state.user.userlist)
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        if (eventlist.length === 0) dispatch(fetchEvents())
        if (userlist.length === 0) dispatch(fetchUsers())
    }, [eventlist, dispatch, userlist])

    const [taggedUsers, setTaggedUsers] = useState<User[]>([])
    const handleUserListOnChange = (event: React.SyntheticEvent, newValue: User[]) => {
        setTaggedUsers(newValue)
    }

    const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null)
    const [tag, setTag] = useState<string[]>([]);
    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const str = e.target.value
        const tagArr = str.split(',')
        setTag(tagArr);
    }

    const [privacy, setPrivacy] = useState<string>('as_previous')
    const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrivacy((event.target as HTMLInputElement).value);
    };

    const resetState = () => {
        setPrivacy('as_previous')
        setTag([])
        setTaggedUsers([])
        setSelectedEvent(null)
    }

    const handleCloseDialog = () => {
        resetState()
        onCloseDialog()
    }


    const handleUpdate = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const data: any = {
                photo_ids: photo_ids,
            }
            if (tag.length > 0) {
                data.tags = tag
            }
            if (taggedUsers.length > 0) {
                data.tagged_users = taggedUsers.map((e) => e.email)
            }
            if (selectedEvent) {
                data.event = selectedEvent.id;
            }
            if (privacy === 'public') { data.is_private = false }
            else if (privacy === 'private') data.is_private = true
            await Promise.all(
                photo_ids.map(id => dispatch(fetchPhotoDetails(id)).unwrap())
            )
            await dispatch(updatePhotos(data)).unwrap()
            toast.success('Photos are updated successfully')
            handleCloseDialog()
            onClearSelection()
        } catch (error) {
            console.log(error);
            toast.error(String(error) || 'Something went wrong')
        }
    }
    return (
        <Dialog open={isDialogOpened} >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }} >
                <Typography> Update Selected Photos </Typography>
                <IconButton onClick={onCloseDialog} sx={{ borderRadius: 1 }}>
                    <Close fontSize='small' />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ py: 2 }}>
                {/* Move to Event */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}
                >
                    Move to Event
                </Typography>
                <Autocomplete
                    disablePortal fullWidth
                    value={selectedEvent}
                    onChange={(_, newValue: AppEvent | null) => setSelectedEvent(newValue)}
                    options={eventlist.filter((e) => e.event_photographer === authUser?.email) ?? []}
                    getOptionLabel={(option) => option.event_name}
                    renderOption={(props, option) => {
                        const { key, ...restprops } = props;
                        return (<li key={key} {...restprops}>
                            <Box sx={{
                                width: "100%", px: 1.5, py: 1, borderRadius: 1,
                                "&:hover": { bgcolor: "grey.100" },
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
                        )
                    }
                    }
                    renderInput={(params) => <TextField {...params} label='Event ' placeholder='Move photos to another event...' required />}
                />

                {/* Add Tagged Users */}
                <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 0.5, display: "block" }}
        >
          Tagged Users
        </Typography>
                <Autocomplete
                    disablePortal fullWidth multiple
                    value={taggedUsers}
                    onChange={handleUserListOnChange}
                    options={userlist ?? []}
                    getOptionLabel={(option) => option.username}
                    renderOption={(props, option) => {
                        const { key, ...restprops } = props;
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
                    }
                    }
                    renderInput={(params) => <TextField {...params} label='Users' placeholder='Add Tagged Users...' />}
                />
                {/* Change Photo Privacy  */}
                {/* Private or Public or as previous */}
                <FormControl>
                    <FormLabel id="privacy-radio-buttons-group">Privacy</FormLabel>
                    <RadioGroup row
                        aria-labelledby="privacy-radio-buttons-group"
                        name="privacy-radio-buttons-group"
                        value={privacy}
                        onChange={handlePrivacyChange}
                    >
                        <FormControlLabel value="public" control={<Radio />} label="Public" />
                        <FormControlLabel value="private" control={<Radio />} label="Private" />
                        <FormControlLabel value="as_previous" control={<Radio />} label="Keep as is" />
                    </RadioGroup>
                </FormControl>

                {/* Add Tags */}
                <TextField
                    label='Add Tags'
                    placeholder='Add tags separated by commas'
                    fullWidth
                    margin='normal'
                    value={tag}
                    onChange={handleTagChange}
                />

            </DialogContent>
            <DialogActions  sx={{ px: 3, py: 1.5 }}>
                <Button onClick={handleUpdate} >Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default UpdatePhoto
