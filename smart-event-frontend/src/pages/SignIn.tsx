import * as React from 'react';
import { Box, Button, Card, CssBaseline, FormControl, FormLabel, TextField, Typography, Stack, Dialog, DialogContent, DialogTitle, InputAdornment, IconButton } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { publicapi } from '../services/AxiosService';
import { OTPVerif } from '../features/auth/OTPVerif';
import { useDispatch } from 'react-redux';
import { guest } from '../app/authslice';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ForgotPassword from '../features/auth/ForgotPassword';
import CloseIcon from "@mui/icons-material/Close";

const OMNIPORT_LOGIN_URL = `
https://channeli.in/oauth/authorise/
?client_id=6bugbw6qVuKIos4sPnIPM5FlrFZLb1IBZ9sAYBTC
&redirect_uri=http://localhost:5173/accounts/channeli/callback/
`;

export default function SignIn() {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userError, setUserError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>('')
  const [forgotDialog, setForgotDialog] = useState<boolean>(false)

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const handleOAuthLogin = () => {
    window.location.href = OMNIPORT_LOGIN_URL;
  };
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
        { withCredentials: true }
      );
      setDialogOpen(true);
      setEmail(email)
      setPassword(password)
      // Handle successful login, e.g., store token, redirect, etc.
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.status == 403 || error?.response?.status == 401) {
          setUserError(error?.response?.data?.message);
        } else {
          setUserError("Invalid Email or Password");
        }
      } else {
        setUserError("Invalid Email or Password");
      }
    }

  };

  const handleGuest = async () => {
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
                type={showPassword ? 'text' : 'password'}
                error={!!passwordError}
                helperText={passwordError}
                placeholder="••••••••"
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onClick={() => setShowPassword(!showPassword)} >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
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
          <Button size="small" onClick={() => setForgotDialog(true)}>
            Forgot Password?
          </Button>
          <ForgotPassword
            open={forgotDialog}
            onClose={() => setForgotDialog(false)}
          />
          <Box mt={1} textAlign="center">
            Don't have an account? <Button onClick={() => navigate('/signup')}>Sign Up</Button>
          </Box>
          <Button variant="outlined" fullWidth sx={{
            mt: 1,
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 2,
          }}
            onClick={handleGuest}
            value="Guest"
            name="Guest"
          >
            Continue as Guest
          </Button>
          <Button onClick={handleOAuthLogin} sx={{
            mt: 1,
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 2,
          }}>
            Login with Omniport
          </Button>

          <Dialog open={dialogOpen} maxWidth="xs" fullWidth>
            <DialogTitle>
              <Typography> Enter the OTP for Verification </Typography>
              <IconButton
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "text.secondary",
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <OTPVerif email={email} password={password} />
            </DialogContent>
          </Dialog>
        </Card>
      </Stack>
    </>
  );
}
