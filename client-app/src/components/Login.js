import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import SignupForm from './SignupForm';
import green from '../assets/green6.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    console.log('API call triggered');

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });

      if (response.status === 200) {
        alert('Login successful');
        const { skills, username, experience, userid } = response.data;
        localStorage.setItem('username', username);
        localStorage.setItem('skills', JSON.stringify(skills));
        localStorage.setItem('experience', experience);
        localStorage.setItem('userid', userid);

        navigate('/Recommendations');
      } else {
        alert('Login unsuccessful');
      }
    } catch (err) {
      alert('Login unsuccessful');
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${green})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            backgroundColor: '#E0FBE2',
            borderRadius: 3,
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              marginBottom: 2,
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 70, color: '#1A4D2E' }} />
            <Typography variant="h5" align="center" gutterBottom sx={{ color: '#1A4D2E' }}>
              Welcome Back
            </Typography>
          </Box>

          <form onSubmit={handleLoginSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root.Mui-required': { color: 'red' },
                  '& .MuiInputLabel-root': {
                    '&.MuiInputLabel-shrink': {
                      color: '#1A4D2E',
                    },
                  },
                }}
              />
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: '#E0FBE2',
                  '& .MuiInputLabel-root.Mui-required': { color: 'red' },
                  '& .MuiInputLabel-root': {
                    '&.MuiInputLabel-shrink': {
                      color: '#1A4D2E',
                    },
                  },
                }}
              />
              <Box sx={{ marginTop: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<LoginIcon />}
                  sx={{
                    borderRadius: 3,
                    background: '#007FFF',
                    color: '#fff',
                    padding: '10px 0',
                    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      backgroundColor: '#005BB5',
                    },
                  }}
                >
                  Login
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setShowSignUp(true)}
                  sx={{
                    color: '#1A4D2E',
                    textDecoration: 'underline',
                  }}
                >
                  Don't have an account? Sign Up
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>

      <SignupForm open={showSignUp} onClose={() => setShowSignUp(false)} />
    </div>
  );
};

export default Login;
