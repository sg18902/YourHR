import React, { useState } from 'react';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import CloseIcon from '@mui/icons-material/Close';

const CustomDialog = styled(Dialog)(({ theme }) => ({
  borderRadius: '12px',
  '& .MuiPaper-root': {
    borderRadius: '12px',
    backgroundColor: '#E0FBE2',
    padding: theme.spacing(3),
  },
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: '#E0FBE2',
  borderRadius: '8px',
});

const SignupForm = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [resume, setResume] = useState(null);
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== retypePassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    const hashedPassword = bcrypt.hashSync(password, 10);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('experience', experience);
    formData.append('resume', resume);
    formData.append('password', hashedPassword);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Sign up successful');
      onClose();
    } catch (error) {
      alert('Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog open={open} onClose={onClose}>
      <DialogTitle sx = {{backgroundColor: '#E0FBE2'}}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#1A4D2E' }}>
            Sign Up
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <StyledDialogContent>
        <form id="signup-form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Experience (Years)"
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Retype Password"
            type="password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
          />
          <Box display="flex" alignItems="center" marginTop={2}>
            <input
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="resume"
              type="file"
              onChange={(e) => setResume(e.target.files[0])}
            />
            <label htmlFor="resume">
              <Button variant="contained" component="span">
                Upload Resume
              </Button>
            </label>
            {resume && (
              <Typography variant="body2" sx={{ marginLeft: 2 }}>
                {resume.name}
              </Typography>
            )}
          </Box>
          {loading && <LoadingSpinner sx={{ marginTop: 2 }} />}
        </form>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} variant = 'variant' color="success">Cancel</Button>
        <Button
          type="submit"
          form="signup-form"
          variant="contained"
          color="primary"
          sx={{ backgroundColor: '#1A4D2E', '&:hover': { backgroundColor: '#14523D' } }}
        >
          Sign Up
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default SignupForm;
