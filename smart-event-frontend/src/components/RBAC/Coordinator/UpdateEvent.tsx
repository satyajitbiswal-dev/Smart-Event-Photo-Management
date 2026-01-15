import { Autocomplete, Box, Button, ButtonGroup, Grid, Paper, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { type AppDispatch, type RootState } from '../../../app/store'
import { cleardispatchEvent, selectEvent } from '../../../app/eventslice'
import type { User } from '../../../types/types'
import { EventMembersSelect } from './EventMemberSelect'
import { fetchUsers } from '../../../app/userslice'

const UpdateEvent = ({ event_id }) => {
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const userlist = useSelector((state: RootState) => state.user.userlist)
  const [updatedMembers, setUpdatedMembers] = useState<string[]>([])

  const { selectedEvent, selectedEventloading, selectedEventError } = useSelector((state: RootState) => state.event)

  useEffect(() => {
      dispatch(fetchUsers())
  },[dispatch])
  useEffect(() => {
    if (!selectedEvent || selectedEvent.id !== event_id) {
      dispatch(selectEvent(event_id))
    }

    return () => {
      dispatch(cleardispatchEvent())
    }
  }, [event_id])
  useEffect(() => {
    console.log(selectedEvent);
  }, [selectedEvent])

  if (selectedEventloading) return <h4>loading...</h4>
  if (!selectedEvent) return <h5>Event not found</h5>
  if (selectedEventError) return (<>
    <h4>
      Error in Loading page
    </h4>
    <div>{selectedEventError}</div>
  </>)


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      event_name: formData.get('name'),
      event_date: formData.get('date'),
      event_time: formData.get('time'),
      description: formData.get('bio'),
      event_members: updatedMembers,
    };
    console.log('Updated Event Data:', data);
  }


  return (
    <Box sx={{ backgroundColor: '#f8fafc', py: { xs: 2, md: 4 }, px: { xs: 1, md: 2 } }}>
      <Box sx={{ maxWidth: { xs: '100%', md: 1100 } }} mx={"auto"}>
        <Paper elevation={3} sx={{
          p: { xs: 2, md: 4 }, borderRadius: { xs: 2, md: 3 },
          textAlign: "center",
          background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
        }}>
          <form id='event-update-form' onSubmit={handleSubmit}>
            <Grid container spacing={2} >
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="name"
                  value={selectedEvent.event_name ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ mt: 0.5 }}
                  label='Event Name'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled
                  name="username"
                  value={selectedEvent.event_coordinator ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ mt: 0.5 }}
                  label='Event Coordinator'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Event Date'
                  name="date"
                  type="date"
                  value={selectedEvent.event_date ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable }, inputLabel: { shrink: true } }}
                  // onChange={handleChange}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Event Time'
                  name="time"
                  type="time"
                  value={selectedEvent.event_time ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable }, inputLabel: { shrink: true } }}
                  // onChange={handleChange}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled
                  name="photographer"
                  value={selectedEvent.event_photographer ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ mt: 0.5 }}
                  label='Event Photographer'
                />
              </Grid>
            </Grid>

            <Box mt={3} mb={3}>
              <TextField
                name="bio"
                value={selectedEvent.description ?? ""}
                fullWidth
                multiline
                rows={4}
                variant={isEditable ? "outlined" : "standard"}
                slotProps={{ input: { readOnly: !isEditable } }}
                // onChange={handleChange}
                // error
                sx={{ mt: 0.5 }}
                label='Event Description'
                // placeholder='Write the event description in max 300 words'
              />
            </Box>
            <EventMembersSelect
              userlist={userlist}
              event_members={selectedEvent.event_members}
              event_coordinator_email={selectedEvent.event_coordinator}
              event_photographer_email={selectedEvent.event_photographer}
              isEditMode={isEditable}
              onChange={(emails) => {
                setUpdatedMembers(emails);
              }}
            />


          </form>
          {
            selectedEvent &&
            <ButtonGroup>
              <Button variant={isEditable ? "outlined" : "contained"} onClick={() => setIsEditable(!isEditable)}>
                {isEditable ? "Cancel" : "Edit Changes"}</Button>
              <Button variant={isEditable ? "contained" : "outlined"} disabled={!isEditable}>Save Changes</Button>
            </ButtonGroup>
          }
        </Paper>
      </Box>
    </Box>
  )
}

export default UpdateEvent