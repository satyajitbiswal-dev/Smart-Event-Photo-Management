import * as React from 'react';
import { Box, Button, Card, CssBaseline, FormControl, FormLabel, TextField, Typography, Stack, InputAdornment, IconButton } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { publicapi } from '../services/AxiosService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function SignUp() {
  const [errors, setErrors] = useState({ username: '', email: '', password: '', fullname: '' });
  const [userError, setUserError] = useState('')
  const[showPassword, setShowPassword] = useState<boolean>(false)
  const navigate = useNavigate();

  const validate = (username: string, email: string, password: string, fullname: string) => {
    const newErrors = { username: '', email: '', password: '', fullname: '' };
    let valid = true;

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }

    if (!fullname.trim()) {
      newErrors.fullname = 'Name is required';
      valid = false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
      valid = false;
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const username = String(data.get('username'));
    const email = String(data.get('email'));
    const password = String(data.get('password'));
    const fullname = String(data.get('fullname'));

    if (!validate(username, email, password, fullname)) return;
    const registerUser = async () => {
      try {
        setUserError("")
        const response = await publicapi.post('register/', {
          username: username,
          email: email,
          password: password,
          name: fullname
        })
        // console.log(response)
        navigate('confirmation/',{replace: true});
      }
      catch (error) {
        if (axios.isAxiosError(error)) {
          setUserError(error.response?.data?.email?.[0] ||
            error.response?.data?.username?.[0] ||
            "Registration failed");
        }
      }
    }
    registerUser();

  };

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
            Sign Up
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormControl fullWidth margin="normal">
              <FormLabel>Email</FormLabel>
              <TextField
                name="email"
                type="email"
                placeholder="you@example.com"
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel>Full Name</FormLabel>
              <TextField
                name="fullname"
                type='text'
                placeholder="Jon Snow"
                error={!!errors.fullname}
                helperText={errors.fullname}
                required
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel>Username</FormLabel>
              <TextField
                name="username"
                type="text"
                placeholder="Jon_the_snowbreaker"
                error={!!errors.username}
                helperText={errors.username}
                required
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel>Password</FormLabel>
              <TextField
                name="password"
                type={ showPassword ? 'text' : 'password' }
                placeholder="••••••••"
                error={!!errors.password}
                helperText={errors.password}
                required
                slotProps={{input:{
                  endAdornment : (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={() => setShowPassword(!showPassword) } >
                          { showPassword ? <VisibilityOffIcon /> : <VisibilityIcon /> }
                      </IconButton>
                    </InputAdornment>
                  )
                }}}
              />
            </FormControl>

            {userError && <Typography color="error" variant="body2">{userError}</Typography>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
            >
              Create Account
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            Already have an account? <Button onClick={() => navigate('/signin')}>Sign In</Button>
          </Box>
        </Card>
      </Stack>
    </>
  );
}
