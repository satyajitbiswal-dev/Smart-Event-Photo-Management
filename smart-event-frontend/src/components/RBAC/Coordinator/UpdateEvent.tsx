import { Box, Button, ButtonGroup, Divider, Grid, Paper, TextField, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { type AppDispatch, type RootState } from '../../../app/store'
import { cleardispatchEvent, selectEvent, updateEvent } from '../../../app/eventslice'
import type { Event } from '../../../types/types'
import { EventMembersSelect } from './EventMemberSelect'
import dayjs from 'dayjs'
import toastMessage from '../../../pages/toastStyle'

const UpdateEvent = ({event_id}) => {
  const authUser = useSelector((state: RootState) => state.auth.user)
  const { selectedEvent, selectedEventloading, selectedEventError } = useSelector((state: RootState) => state.event)

  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    if (!selectedEvent || selectedEvent.id !== event_id) {
      dispatch(selectEvent(event_id))
    }
    return () => {
      dispatch(cleardispatchEvent())
    }
  }, [event_id])
  
  const [isEditable, setIsEditable] = useState<boolean>(false)

  const protectedEmails = useMemo(() => {
      const set = new Set<string>();
      if (selectedEvent?.event_coordinator) set.add(selectedEvent.event_coordinator);
      if (selectedEvent?.event_photographer) set.add(selectedEvent.event_photographer);
      return Array.from(set);
    }, [ selectedEvent ]);
  
    const initialEmails = useMemo(() => {
      return Array.from( new Set([   ...(selectedEvent?.event_members ?? []),   ...protectedEmails, ])
      );
    }, [selectedEvent?.event_members, protectedEmails]);

    const [members, setMembers] = useState<string[]>(initialEmails );

  const [form, setForm] = useState<Partial<Event> | null>(selectedEvent)
  const [originalForm, setOriginalForm] = useState<Partial<Event> | null>(selectedEvent)

  useEffect(() => {
    if(!selectedEvent) return;
    setForm(selectedEvent);
    setOriginalForm(selectedEvent)
    setMembers(initialEmails);
  }, [selectedEvent,initialEmails])


  const handleChange = (e) => {
    if (form) {
      setForm(prev => (
        { ...prev, [e.target.name]: e.target.value ?? null }
      ))
    }

  }

  if (selectedEventloading) return <h4>loading...</h4>
  if (!selectedEvent) return <h5>Event not found</h5>
  if (selectedEventError) return (<>
    <h4>
      Error in Loading page
    </h4>
    <div>{selectedEventError}</div>
  </>)

  const handleToggle = () => {
    if (isEditable) {
      setForm(originalForm)
      setMembers (initialEmails)
    }
    setIsEditable(!isEditable)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const formJson: Partial<Event> = Object.fromEntries(formData.entries())
      if (!formJson['event_time']) {
        formJson['event_time'] = undefined
      }
      // formJson['event_members'] = updatedMembers
      await dispatch(updateEvent({ id: selectedEvent.id, data: formJson })).unwrap()
      setIsEditable(!isEditable)
      toastMessage('Event Update Successfully',"top-right")
    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        for (const key in error) {
          const value = error[key];
          if (Array.isArray(value)) {
            value.forEach(msg => toastMessage(msg, "top-right"));
          } else {
            // Single string
            toastMessage(value as string, "top-right");
          }
        }
      } else {
        toastMessage(error, 'top-right')
      }
    }
  }



  return (
    <Box sx={{ backgroundColor: '#f8fafc', py: { xs: 2, md: 4 }, px: { xs: 1, md: 2 } }}>
      <Box sx={{ maxWidth: { xs: '100%', md: 1100 } }} mx={"auto"} position={'relative'}>

        {!isEditable && <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: { xs: -40, md: -40 },
            left: "50%",
            transform: "translateX(-50%)",
            px: { xs: 2, md: 4 },
            py: { xs: 1.5, md: 2 },
            borderRadius: 3,
            minWidth: { xs: "85%", md: 600 },
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            color: "white",
            zIndex: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {selectedEvent.event_name}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {selectedEvent.event_date}{selectedEvent.event_time ? ` • ${selectedEvent.event_time}` : ''}
          </Typography>
        </Paper>}

        <Paper elevation={3} sx={{ mt: { xs: 6, md: 7 },
          mx: { xs: 2, md: 4 },
          p: { xs: 4, md: 6 },
          pt: { xs: 6, md: 7 },
          borderRadius: { xs: 2, md: 3 },
          textAlign: "left",
          background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
        }}>

          <form id='event-update-form' onSubmit={handleSubmit}>
            <Grid container spacing={2} >
              {isEditable && <> <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="event_name"
                  value={form?.event_name ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ mt: 0.5 }}
                  onChange={handleChange}

                  label='Event Name'
                />
              </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label='Event Date'
                    name="event_date"
                    type="date"
                    value={form?.event_date ?? ""}
                    fullWidth
                    size="small"
                    variant={isEditable ? "outlined" : "standard"}
                    slotProps={{ input: { readOnly: !isEditable }, inputLabel: { shrink: true } }}
                    onChange={handleChange}

                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </>
              }

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled
                  name="event_coordinator"
                  value={form?.event_coordinator ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ mt: 0.5 }}
                  onChange={handleChange}

                  label='Event Coordinator'

                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled
                  name="event_photographer"
                  value={form?.event_photographer ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ mt: 0.5 }}
                  onChange={handleChange}

                  label='Event Photographer'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Event Time'
                  name="event_time"
                  type="time"
                  value={form?.event_time ?? ""}
                  fullWidth
                  size="small"
                  variant={isEditable ? "outlined" : "standard"}
                  slotProps={{ input: { readOnly: !isEditable }, inputLabel: { shrink: true } }}
                  onChange={handleChange}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

            </Grid>

            <Box mt={3} mb={3}>
              <TextField
                name="description"
                value={form?.description ?? ""}
                fullWidth
                multiline
                rows={4}
                variant={isEditable ? "outlined" : "standard"}
                slotProps={{ input: { readOnly: !isEditable } }}
                onChange={handleChange}
                // error
                sx={{ mt: 0.5 }}
                label='Event Description'
                placeholder={selectedEvent.event_coordinator === authUser?.email ? 'Write the event description in max 300 words' : ''}
              />
            </Box>

            <EventMembersSelect
              event={form}
              isEditMode={isEditable}
              protectedEmails={protectedEmails}
              members={members}
              setMembers={setMembers} 
            />


          </form>
          {
            selectedEvent.event_coordinator === authUser?.email &&
            <ButtonGroup >
              <Button variant={isEditable ? "outlined" : "contained"} onClick={handleToggle}>
                {isEditable ? "Cancel" : "Edit Changes"}</Button>
              <Button variant={isEditable ? "contained" : "outlined"} disabled={!isEditable} type='submit' form='event-update-form' >Save Changes</Button>
            </ButtonGroup>
          }
        </Paper>
      </Box>
    </Box>
  )
}

export default UpdateEvent
