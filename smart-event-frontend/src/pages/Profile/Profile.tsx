import { useEffect, useState } from 'react'
import { Avatar, Box, Button, ButtonGroup, FormControl, FormControlLabel, FormLabel, Grid, MenuItem, Paper, Radio, RadioGroup, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import privateapi from '../../services/AxiosService';
import type { MemberProfile, Event } from '../../types/types';
import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import ResetPasswordDialog from '../../features/auth/ResetPassword';

const Member = () => {
  const isMobile = useMediaQuery('(max-width:900px)');

  const { username } = useParams()

  const [isEditable, setisEditable] = useState<boolean>(false)
  const authuser = useSelector((state: RootState) => state.auth.user)
  const [user, setUser] = useState<MemberProfile>({})
  const [originalUser, setOriginalUser] = useState<MemberProfile>({}) // Store original data for cancel
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)

  const navigate = useNavigate()

  const [photographedEvents, setPhotoGraphedEvents] = useState<Event[]>([])
  const [coordinatedEvents, setCoordinatedEvents] = useState<Event[]>([])
  const [participatedEvents, setParticipatedEvents] = useState<Event[]>([])

  const [selectedCoordinatedEvent, setSelectedCoordinatedEvent] = useState("");
  const [selectedPhotographedEvent, setSelectedPhotographedEvent] = useState("");

  type Role = "M" | "P" | "A";
  const UserRole: Record<Role, string> = {
    M: "Member",
    P: "Public",
    A: "Admin"
  }

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const response = await privateapi.get(`/profile/${username}/`);
        // console.log(response.data);
        const userData = response.data;
        setUser(userData);
        setOriginalUser({ ...userData }); // Store original data (deep copy)
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (!username) return;

    const fetchEventActicity = async () => {
      try {
        const response = await privateapi.get(`/event_activity/`);
        console.log(response.data);
        setParticipatedEvents(response.data.participated_events)
        setPhotoGraphedEvents(response.data.photographed_events)
        setCoordinatedEvents(response.data.coordinated_events)
      } catch (err) {
        console.error(err);
      }
    };
    fetchEventActicity();
  }, [username])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const handleProfileUpdate = async () => {
    if (isEditable) {
      setUser(originalUser);
      setProfilePicFile(null);
      setProfilePicPreview(null);
    }
    setisEditable(!isEditable)
  }

  const handleSave = async () => {
    try {
      // Update user profile data
      const { profile_pic, ...cleanUser } = user;
      await privateapi.patch(`/update/${username}/`, cleanUser);

      let updatedUser = { ...user };

      // Update profile picture if a new file was selected
      if (profilePicFile) {
        const formData = new FormData();
        formData.append("profile_pic", profilePicFile);

        const response = await privateapi.patch(
          `/update/${username}/profile_pic/`,
          formData
          // Don't set Content-Type header - axios will set it automatically with boundary
        );

        updatedUser = {
          ...user,
          profile_pic: response.data.profile_pic,
        };

        setProfilePicFile(null);
        setProfilePicPreview(null);
      }
      setUser(updatedUser);
      setOriginalUser(updatedUser); // Update original too
      setisEditable(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const handleProfilePicUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the file for later upload
    setProfilePicFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  const [passwordDialog,setPasswordDialog] = useState<boolean>(false)
  const handlePasswordReset = () => {
    setPasswordDialog(true)
  }

  return (
    <Box maxWidth={1100} mx="auto" mt={6} px={2} >
      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Profile
              </Typography>
        <Grid container spacing={3} alignItems="center"  direction={isMobile ? 'column-reverse' : 'row'} >
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={1.5}>
              

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Username
                  </Typography>
                  <TextField
                    name="username"
                    value={user.username ?? ""}
                    fullWidth
                    size="small"
                    variant={isEditable ? "outlined" : "standard"}
                    slotProps={{ input: { readOnly: !isEditable } }}
                    onChange={handleChange}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <TextField
                    name="email"
                    value={user.email ?? ""}
                    fullWidth
                    size="small"
                    variant={isEditable ? "outlined" : "standard"}
                    slotProps={{ input: { readOnly: !isEditable } }}
                    onChange={handleChange}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <TextField
                    name="name"
                    value={user.name ?? ""}
                    fullWidth
                    size="small"
                    variant={isEditable ? "outlined" : "standard"}
                    slotProps={{ input: { readOnly: !isEditable } }}
                    onChange={handleChange}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <TextField
                    name="role"
                    value={user.role ? UserRole[user.role as Role] : ""}
                    fullWidth
                    size="small"
                    variant="standard"
                    slotProps={{ input: { readOnly: !isEditable } }}
                    disabled
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.5} alignItems="center">
              <Avatar
                src={profilePicPreview || user.profile_pic || undefined}
                sx={{ width: 140, height: 140 }}
                key={profilePicPreview || user.profile_pic} // Force re-render on change
              />

              {/* Upload Picture */}
              <Button
                component="label"
                startIcon={<CloudUploadIcon />}
                variant="outlined"
                size="small"
                disabled={!isEditable}
              >
                Change Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePicUpdate}
                />
              </Button>

            </Stack>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Academic Information
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Enrollment
              </Typography>
              <TextField
                name="enrollment"
                value={user.enrollment ?? ""}
                fullWidth
                size="small"
                variant={isEditable ? "outlined" : "standard"}
                slotProps={{ input: { readOnly: !isEditable } }}
                onChange={handleChange}
                sx={{ mt: 0.5 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Department
              </Typography>
              <TextField
                name="department"
                value={user.department ?? ""}
                fullWidth
                size="small"
                variant={isEditable ? "outlined" : "standard"}
                slotProps={{ input: { readOnly: !isEditable } }}
                onChange={handleChange}
                sx={{ mt: 0.5 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Batch
              </Typography>
              <TextField
                name="batch"
                value={user.batch ?? ""}
                fullWidth
                size="small"
                variant={isEditable ? "outlined" : "standard"}
                slotProps={{ input: { readOnly: !isEditable } }}
                onChange={handleChange}
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Gender and DOB */}
        <Box mt={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Gender
                </FormLabel>
                <RadioGroup row name="sex" value={user.sex ?? ""} onChange={handleChange}>
                  <FormControlLabel value="M" control={<Radio disabled={!isEditable} />} label="Male" />
                  <FormControlLabel value="F" control={<Radio disabled={!isEditable} />} label="Female" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Date of Birth
              </Typography>
              <TextField
                name="dob"
                type="date"
                value={user.dob ?? ""}
                fullWidth
                size="small"
                variant={isEditable ? "outlined" : "standard"}
                slotProps={{ input: { readOnly: !isEditable }, inputLabel: { shrink: true } }}
                onChange={handleChange}
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Bio */}
        <Box mt={3}>
          <Typography variant="caption" color="text.secondary">
            Bio
          </Typography>
          <TextField
            name="bio"
            value={user.bio ?? ""}
            fullWidth
            multiline
            rows={4}
            variant={isEditable ? "outlined" : "standard"}
            slotProps={{ input: { readOnly: !isEditable } }}
            onChange={handleChange}
            sx={{ mt: 0.5 }}
          />
        </Box>
        {/* Activities */}
        
       { authuser?.username === username && 
       <>
        <Stack mt={3} direction={{ xs: "column", sm: "row" }}
alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
          {!isMobile && <Typography variant="h6" color="text.secondary" component={"span"}>
            Coordinated Events :
          </Typography>}
          <Box sx={{ width: { xs: "100%", sm: 400 } }}>
            <TextField select value={selectedCoordinatedEvent} label='Coordinated-Events'
            onChange={(e) => setSelectedCoordinatedEvent(e.target.value)} size='small' fullWidth 
            sx={{ overflowX:'clip' }}
            >
              <MenuItem value="">Select an Event</MenuItem>
            {
              coordinatedEvents.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.event_name} - {event.event_date}
                </MenuItem>
              ))
            }
            
          </TextField>
          </Box>
          
          <Button
              variant='contained'
              disabled = {selectedCoordinatedEvent == "" ? true : false}
              onClick={() => { navigate(`/events/${selectedCoordinatedEvent}`) }}>
              Go
            </Button>
        </Stack>
        <Box mt={3}>
          <Stack mt={3} direction={{ xs: "column", sm: "row" }}
alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
          {!isMobile && <Typography variant="h6" color="text.secondary" component={"span"}>
            PhotoGrapher Actions :
          </Typography>}
          <Box sx={{ width: { xs: "100%", sm: 400 } }}
>
            <TextField select value={selectedPhotographedEvent} label="Photographed-Events"
            onChange={(e) => setSelectedPhotographedEvent(e.target.value)} size='small' fullWidth>
              <MenuItem value="">Select an Event</MenuItem>
            {
              photographedEvents.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.event_name} - {event.event_date}
                </MenuItem>
              ))
            }
          </TextField>
          </Box>
          
          <Button
              variant='contained'
              disabled = {selectedPhotographedEvent == "" ? true : false}
              onClick={() => { navigate(`/photographer/dashboard/${selectedPhotographedEvent}`) }}>
              Go
            </Button>
        </Stack>
        </Box>
        {/* ACTIONS */}
        <Box  mt={4} display="flex" justifyContent="space-between" alignItems={'center'} >
            <Button variant='contained' size='small' onClick={handlePasswordReset} >
              Reset Password
            </Button>
             <ResetPasswordDialog 
          open={passwordDialog}
          onClose={() => setPasswordDialog(false)}
           />
          <ButtonGroup>
            <Button variant={isEditable ? "outlined" : "contained"} onClick={handleProfileUpdate}>
              {isEditable ? "Cancel" : "Edit Profile"}
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={!isEditable}>
              Save Changes
            </Button>
          </ButtonGroup>
        </Box>
      </>
        }
      </Paper>
    </Box>
  )
}

export default Member
