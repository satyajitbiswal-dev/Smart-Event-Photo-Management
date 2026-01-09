import * as React from 'react';
import { Box, Button, Card, CssBaseline, FormControl, FormLabel, TextField, Typography, Stack, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { publicapi } from '../services/AxiosService';
import { OTPVerif } from '../features/auth/OTPVerif';
import { useDispatch } from 'react-redux';
import { guest } from '../app/authslice';

export default function SignIn() {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userError, setUserError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState<string>("")
  const dispatch = useDispatch()

  const handleClose = () => {
    setDialogOpen(false);
  }

  const validateInputs = (email: string, password: string) => {
    let valid = true;

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const email = String(data.get('email'));
    const password = String(data.get('password'));

    if (!validateInputs(email, password)) return;
    try {
      setUserError('');
      const response = await publicapi.post('login/send-otp/', {
        email: email,
        password: password
      },
      {withCredentials:true}
    );
      console.log(response);
      setDialogOpen(true);
      setEmail(email)
      // Handle successful login, e.g., store token, redirect, etc.
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status == 403 || error?.response?.status == 401) {
          setUserError(error?.response?.data?.message);
        } else {
          setUserError("Invalid Email or Password");
        }
      } else {
        console.log('Unexpected error:', error);
        setUserError("Invalid Email or Password");
      }
    }

  };

  const handleGuest = async () =>{
    dispatch(guest());
    navigate("/")
  }

  return (
    <>
      <CssBaseline />
      <Stack
        height="100vh"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f5f5f5"
      >
        <Card sx={{ p: 4, width: 380 }}>
          <Typography variant="h5" textAlign="center" mb={2}>
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormControl fullWidth margin="normal">
              <FormLabel>Email</FormLabel>
              <TextField
                name="email"
                type="email"
                error={!!emailError}
                helperText={emailError}
                placeholder="you@example.com"
                required
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel>Password</FormLabel>
              <TextField
                name="password"
                type="password"
                error={!!passwordError}
                helperText={passwordError}
                placeholder="••••••••"
                required
              />
            </FormControl>
            {userError && (
              <Typography color="error" variant="body2" mt={1}>
                {userError}
              </Typography>
            )}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} >
              Sign In
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            Don't have an account? <Button onClick={() => navigate('/signup')}>Sign Up</Button>
          </Box>
          <Button variant="outlined" fullWidth sx={{  mt: 1,
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
            }}
            onClick={handleGuest}
            value="Guest"
            name = "Guest"
          >
            Continue as Guest
          </Button>
          <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Enter the OTP for Verification</DialogTitle>
            <DialogContent>
              <OTPVerif email={email} />
            </DialogContent>
          </Dialog>
        </Card>
      </Stack>
    </>
  );
}
