import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import SkillsIcon from '@mui/icons-material/Build';
import ExperienceIcon from '@mui/icons-material/AccessTime';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import axios from 'axios';

const JobDetailsDialog = ({ open, job, onClose, userId }) => {
  if (!job) return null;
  const userid = localStorage.getItem('userid');

  // Function to handle job application
  const handleApply = async () => {
    try {
      await axios.post('http://localhost:5000/apply', {
        jobId: job._id,  // Use the job's ID
        userId: userid,  // Use the user ID passed as prop
      });
      onClose();
      alert('Application submitted successfully!');
      
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 16,
          padding: '20px',
          backgroundColor: '#b5ffe1',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AccountBoxIcon color="success" style={{ marginRight: 8, fontSize: 50 }} />
            <Typography variant="h5">{job.title}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={4} display="flex" alignItems="center">
            <WorkIcon color="action" style={{ marginRight: 4 }} />
            <Typography variant="subtitle1" color="textSecondary">
              Company:
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>{job.company}</Typography>
          </Grid>

          <Grid item xs={4} display="flex" alignItems="center">
            <LocationOnIcon color="action" style={{ marginRight: 4 }} />
            <Typography variant="subtitle1" color="textSecondary">
              Location:
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>{job.location}</Typography>
          </Grid>

          <Grid item xs={4} display="flex" alignItems="center">
            <DescriptionIcon color="action" style={{ marginRight: 4 }} />
            <Typography variant="subtitle1" color="textSecondary">
              Description:
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>{job.description}</Typography>
          </Grid>

          <Grid item xs={4} display="flex" alignItems="center">
            <SkillsIcon color="action" style={{ marginRight: 4 }} />
            <Typography variant="subtitle1" color="textSecondary">
              Required Skills:
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>{job.requiredSkills.join(', ')}</Typography>
          </Grid>

          <Grid item xs={4} display="flex" alignItems="center">
            <ExperienceIcon color="action" style={{ marginRight: 4 }} />
            <Typography variant="subtitle1" color="textSecondary">
              Experience Required:
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>{job.requiredExperience} years</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="success">
          Close
        </Button>
        <Button
          onClick={handleApply}
          color="primary"
          variant="contained"
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsDialog;
