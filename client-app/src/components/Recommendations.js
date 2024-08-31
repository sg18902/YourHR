import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    CircularProgress,
    Box,
    Autocomplete,
    TextField, Grid, IconButton, AppBar, Toolbar, Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { saveAs } from 'file-saver';
import JobDetailsDialog from './JobDetailsDialog';  // Import the new component
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ExperienceIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import SkillsIcon from '@mui/icons-material/Build';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WorkOffIcon from '@mui/icons-material/WorkOff';
import green from '../assets/green4.avif';
import Fade from '@mui/material/Fade';
import FileDownloadIcon from '@mui/icons-material/FileDownload';





const Recommendations = () => {
    const [jobs, setJobs] = useState([]);
    const [skillOptions, setSkillOptions] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);  // State to handle selected job
    const experience = localStorage.getItem('experience')
    const userid = localStorage.getItem('userid');
    const [appliedJobs, setAppliedJobs] = useState([]);
    const username = localStorage.getItem('username');
    const navigate = useNavigate();
    const [selectedComponent, setSelectedComponent] = useState('jobs');
    const [loadingState, setLoadingState] = useState(false);

    const handleResumeDownload = async () => {
        console.log('Downloading...');
    
        try {
            console.log(userid)
            // Send a request to download the resume
            const response = await axios.get(`http://localhost:5000/download_resume/${userid}`, {
                responseType: 'blob', // Important: this tells axios to handle the response as a Blob
            });
    
            // Get the content type and file name from the response headers
            const contentType = response.headers['content-type'];
            const fileName = response.headers['content-disposition']
                ? response.headers['content-disposition'].split('filename=')[1]
                : 'resume.pdf';  // Fallback to a default file name if not provided
    
            // Use file-saver to save the file
            saveAs(new Blob([response.data], { type: contentType }), fileName);
    
            console.log('Download complete.');
        } catch (error) {
            console.error('Error downloading resume:', error);
            alert('Failed to download the resume.');
        }
    };

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/skills`);
                setSkillOptions(response.data);
                setSelectedSkills(JSON.parse(localStorage.getItem('skills')) || []);
            } catch (error) {
                console.error('Error fetching skill options:', error);
            }
        };

        fetchSkills();
    }, []);

    const fetchAppliedJobs = async () => {
        setLoadingState(true); // Start loading state
        try {
            console.log(userid)
            const response = await axios.get(`http://localhost:5000/applied_jobs/${userid}`);
            setAppliedJobs(response.data);
        } catch (error) {
            console.error('Error fetching Applied Jobs:', error);
        } finally {
            setLoadingState(false); // End loading state
        }
    };



    useEffect(() => {
        fetchAppliedJobs();
    }, [userid]);

    const fetchJobs = async () => {
        setLoadingState(true); // Start loading state
        try {
            const response = await axios.post(`http://localhost:5000/recommendations`, { skills: selectedSkills, experience: parseInt(experience), userid });
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching job recommendations:', error);
        } finally {
            setLoadingState(false); // End loading state
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [selectedSkills]);

    const handleSkillChange = (event, newValue) => {
        setSelectedSkills(newValue);
    };

    const handleJobClick = (job) => {
        setSelectedJob(job);
    };

    const handleClose = () => {
        fetchJobs();
        fetchAppliedJobs();
        setSelectedJob(null);
    };



    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('skills');
        localStorage.removeItem('experience');
        localStorage.removeItem('userid');
        navigate('/');
    };

   


    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                backgroundImage: `url(${green})`,
                backgroundSize: 'cover', // Ensures the image covers the entire box
                backgroundPosition: 'center', // Centers the image
                backgroundAttachment: 'fixed', // Fixes the background image
                color: '#fff',
                paddingBottom: 3,
                overflow: 'auto',
            }}
        >

            <AppBar position="static" sx={{ background: '#12372A' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Hello, {username}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                            color="inherit"
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#1A5A40', // Lighter shade on hover
                                },
                            }}
                            onClick={handleResumeDownload}
                        >
                            <FileDownloadIcon/>
                            Resume
                        </Button>
                        <Button
                            color="inherit"
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#1A5A40', // Lighter shade on hover
                                },
                            }}
                            onClick={() => setSelectedComponent('jobs')}
                        >
                            Jobs
                        </Button>
                        <Button
                            color="inherit"
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#1A5A40', // Lighter shade on hover
                                },
                            }}
                            onClick={() => setSelectedComponent('applied_jobs')}
                        >
                            Applied Jobs
                        </Button>
                        
                        <IconButton
                            color="inherit"
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#1A5A40', // Lighter shade on hover
                                },
                            }}
                            onClick={handleLogout}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {selectedComponent === 'jobs' ?
                <Container component="main" maxWidth="md" sx={{ marginTop: 5 }}>
                    <Fade in={!loadingState} timeout={300}>

                        <Box
                            sx={{
                                background: 'rgba(255, 255, 255, 0.1)', // Transparent black background
                                borderRadius: '16px', // Circular border radius
                                padding: '16px', // Better padding
                                width: '100%', // Ensure full width
                            }}
                        >
                            <Typography variant="h5" gutterBottom>
                                Job Recommendations
                            </Typography>
                            <Autocomplete
                                multiple
                                options={skillOptions}
                                value={selectedSkills}
                                onChange={handleSkillChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        placeholder="Skills"
                                        sx={{
                                            backgroundColor: '#E0FBE2', // Background color for the input
                                            borderRadius: '16px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px', // Circular border radius for the input
                                                '& fieldset': {
                                                    borderColor: '#E0FBE2', // Border color for the input
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#E0FBE2', // Border color on hover
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#E0FBE2', // Border color when focused
                                                },
                                            },
                                            '& .MuiAutocomplete-popover': {
                                                backgroundColor: '#E0FBE2', // Background color for the dropdown
                                            },
                                            '& .MuiAutocomplete-option': {
                                                color: '#000', // Text color for options
                                            },
                                            '& .MuiAutocomplete-option.Mui-selected': {
                                                backgroundColor: '#B2D6A3', // Background color for selected options
                                                color: '#FFF', // Text color for selected options
                                            },
                                        }}
                                    />
                                )}
                                sx={{ mb: 3 }}
                            />
                        </Box>
                    </Fade>



                    {jobs.length > 0 ? (
                        <Box>
                            {jobs.map((job) => (
                                <Fade in={!loadingState} timeout={300}>

                                    <Paper
                                        key={job._id}
                                        elevation={3}
                                        sx={{
                                            margin: 1,
                                            marginTop: 6,
                                            marginBottom: 6,
                                            width: '98%',
                                            padding: 2,
                                            backgroundColor: '#b5ffe1',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                                            },
                                        }}
                                        onClick={() => handleJobClick(job)}
                                    >
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <AccountBoxIcon color="success" sx={{ mr: 1 }} />
                                            <Typography variant="h6">{job.title}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <Grid container spacing={1} mt={1}>
                                                <Grid item xs={6} display="flex" alignItems="center">
                                                    <LocationOnIcon color="action" sx={{ mr: 1 }} />
                                                    <Typography variant="body2">
                                                        {job.company} | {job.location}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} display="flex" alignItems="center">
                                                    <ExperienceIcon color="action" sx={{ mr: 1 }} />
                                                    <Typography variant="body2" color="textSecondary">
                                                        {job.requiredExperience} years
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Grid container spacing={1} mt={1}>
                                            <Grid item xs={12} display="flex" alignItems="center">
                                                <DescriptionIcon color="action" sx={{ mr: 1 }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    {job.description}
                                                </Typography>
                                            </Grid>


                                        </Grid>

                                    </Paper>
                                </Fade>
                            ))}
                        </Box>
                    ) : (
                        <Paper elevation={3} sx={{ textAlign: 'center', marginTop: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '200px',
                                    backgroundColor: '#b5ffe1',
                                    borderRadius: '10px',
                                    width: '100%',

                                }}
                            >
                                <WorkOffIcon sx={{ fontSize: 60, color: '#757575' }} />
                                <Typography variant="h6" sx={{ marginTop: 2, color: '#757575' }}>
                                    No jobs available.
                                </Typography>
                            </Box>
                        </Paper>)}


                    <JobDetailsDialog open={Boolean(selectedJob)} job={selectedJob} onClose={handleClose} />
                </Container>
                :
                <Container component="main" maxWidth="md" sx={{ marginTop: 5 }}>
                    {appliedJobs.length > 0 ? (
                        <Box>
                            {appliedJobs.map((job) => (
                                <Paper
                                    key={job._id}
                                    elevation={3}
                                    sx={{
                                        margin: 6,
                                        padding: 2,
                                        backgroundColor: '#b5ffe1',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                                        },
                                    }}
                                >
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: 50, color: 'green' }} />
                                        <Typography variant="h5">{job.title}</Typography>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={4} display="flex" alignItems="center">
                                            <WorkIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="subtitle1" color="textSecondary">
                                                Company:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography>{job.company}</Typography>
                                        </Grid>

                                        <Grid item xs={4} display="flex" alignItems="center">
                                            <LocationOnIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="subtitle1" color="textSecondary">
                                                Location:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography>{job.location}</Typography>
                                        </Grid>

                                        <Grid item xs={4} display="flex" alignItems="center">
                                            <DescriptionIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="subtitle1" color="textSecondary">
                                                Description:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography>{job.description}</Typography>
                                        </Grid>

                                        <Grid item xs={4} display="flex" alignItems="center">
                                            <SkillsIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="subtitle1" color="textSecondary">
                                                Required Skills:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography>{job.requiredSkills.join(', ')}</Typography>
                                        </Grid>

                                        <Grid item xs={4} display="flex" alignItems="center">
                                            <ExperienceIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="subtitle1" color="textSecondary">
                                                Experience Required:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography>{job.requiredExperience} years</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Paper elevation={3} sx={{ padding: 4, textAlign: 'center', marginTop: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '200px',
                                    backgroundColor: '#b5ffe1',
                                    borderRadius: '10px',
                                    width: '100%',
                                }}
                            >
                                <WorkOffIcon sx={{ fontSize: 60, color: '#757575' }} />
                                <Typography variant="h6" sx={{ marginTop: 2, color: '#757575' }}>
                                    No Jobs Applied Yet
                                </Typography>
                            </Box>
                        </Paper>)}
                </Container>
            }
        </Box>

    );
};

export default Recommendations;
