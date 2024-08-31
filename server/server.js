const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const keywordExtractor = require('keyword-extractor');
const cors = require('cors');  // Import cors
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());  // Enable JSON parsing
app.use(express.urlencoded({ extended: true }));  // Enable URL-encoded form data parsing

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Set up multer for file uploads
const storage = multer.memoryStorage();  // Store file in memory temporarily
const upload = multer({ storage: storage });

// Helper function to extract skills
const extractSkills = (text) => {
  // Extract keywords from the resume text
  const keywords = keywordExtractor.extract(text, {
    language: 'english',
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true,
  });

  const lowercaseKeywords = keywords.map(keyword => keyword.toLowerCase());

  // Customize this list of keywords based on common IT skills
const itSkills = [
  'javascript', 'python', 'java', 'node', 'react', 'angular', 'docker', 'aws', 'sql', 'mongodb',
  'html', 'css', 'typescript', 'c#', 'c++', 'ruby', 'php', 'swift', 'kotlin', 'go',
  'django', 'flask', 'spring', 'laravel', 'express', 'vue', 'svelte', 'next.js', 'nuxt.js', 'graphql',
  'kubernetes', 'terraform', 'ansible', 'jenkins', 'git', 'github', 'bitbucket', 'gitlab', 'jira', 'confluence',
  'azure', 'gcp', 'oracle', 'linux', 'unix', 'bash', 'powershell', 'shell scripting', 'puppet', 'chef',
  'hadoop', 'spark', 'hive', 'kafka', 'elasticsearch', 'redis', 'rabbitmq', 'nginx', 'apache', 'tomcat',
  'ci/cd', 'devops', 'microservices', 'serverless', 'graphql', 'restful apis', 'soap', 'json', 'xml', 'jwt',
  'oauth', 'sso', 'authentication', 'authorization', 'pen testing', 'vulnerability scanning', 'firewalls', 'ids/ips', 'siem', 'endpoint security',
  'data analysis', 'data visualization', 'tableau', 'power bi', 'matplotlib', 'pandas', 'numpy', 'tensorflow', 'keras', 'pytorch',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'cloud computing', 'blockchain', 'iot', 'vr/ar', 'mobile development', 'agile methodologies'
];
  const skills = keywords.filter(keyword => itSkills.includes(keyword));

  return skills;
};

// Function to extract text from DOC/DOCX files
const extractTextFromDoc = (buffer) => {
  return new Promise((resolve, reject) => {
    mammoth.extractRawText({ buffer: buffer })
      .then(result => resolve(result.value))
      .catch(err => reject(err));
  });
};

// Route to handle user registration and resume upload
app.post('/signup', upload.single('resume'), async (req, res) => {
  const { name, email, phone, experience, password } = req.body;

  if (!name || !email || !phone || !experience || !req.file) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    let text = '';
    const mimeType = req.file.mimetype;

    // Extract text based on file type
    if (mimeType === 'application/pdf') {
      text = await pdfParse(req.file.buffer).then(data => data.text);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
      text = await extractTextFromDoc(req.file.buffer);
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported file type' });
    }

    // Extract skills using the helper function
    const skills = extractSkills(text);

    // Save user data to the database, including the resume
    const user = new User({
      name,
      email,
      phone,
      resume: {
        data: req.file.buffer,  // Store the file buffer directly
        contentType: req.file.mimetype,  // Store the MIME type
      },
      skills,
      experience: parseInt(experience),
      password
    });
    await user.save();
    res.status(201).json({ success: true, message: 'User registered successfully!', skills });
  } catch (err) {
    console.error('Error saving user data:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Route to recommend jobs based on provided skills
app.post('/recommendations', async (req, res) => {
  try {
    const { skills } = req.body;
    const {experience} = req.body;
    const {userid} = req.body;
    // If no skills are provided, return all jobs
    if (!skills || skills.length === 0) {
      const jobs = await Job.find({ requiredExperience: { $gte: experience }, applicants: { $ne: userid }  });
      return res.json(jobs);
    }

    const lowercaseSkills = skills.map(skill => skill.toLowerCase());

    const jobConditions = lowercaseSkills.map(skill => ({
      $expr: {
        $in: [skill, { $map: { input: "$requiredSkills", as: "reqSkill", in: { $toLower: "$$reqSkill" } } }]
      }
    }));

    const jobs = await Job.find({
      requiredExperience: { $gte: experience }, applicants: { $ne: userid } ,
      $or: jobConditions
    });

    res.json(jobs);
  } catch (err) {
    console.error('Error fetching job recommendations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



app.get('/skills', async (req, res) => {
  try {
    // Use aggregation to get distinct skills
    const skills = await Job.aggregate([
      { $unwind: "$requiredSkills" }, // Deconstructs the requiredSkills array field
      { $group: { _id: null, distinctSkills: { $addToSet: "$requiredSkills" } } }, // Groups by a null key to get all distinct skills
      { $project: { _id: 0, distinctSkills: 1 } } // Exclude the _id field and only include distinctSkills
    ]);

    // If skills are found, return them
    res.status(200).json(skills[0].distinctSkills);
  } catch (err) {
    console.error('Error retrieving skills:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Respond with user details if login is successful
    res.status(200).json({
      role: user.role,
      username: user.name,
      experience: user.experience,
      skills: user.skills,
      userid: String(user._id)
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to handle job applications
app.post('/apply', async (req, res) => {
  const { jobId, userId } = req.body;

  // Validate input
  if (!jobId || !userId) {
    return res.status(400).json({ success: false, error: 'Job ID and User ID are required' });
  }

  try {
    // Find the job by ID and update the applicants list
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $addToSet: { applicants: userId } },  // Use $addToSet to avoid duplicates
      { new: true }  // Return the updated job document
    );

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.status(200).json({ success: true, message: 'Application submitted successfully', job });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Route to get jobs a user has applied to
app.get('/applied_jobs/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required' });
  }

  try {
    // Find jobs where the userId is in the applicants list
    const jobs = await Job.find({ applicants: userId });

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'No jobs found for this user' });
    }

    res.status(200).json( jobs );
  } catch (err) {
    console.error('Error fetching applied jobs:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/download_resume/:userid', async (req, res) => {
  try {
    const userId = req.params.userid;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user || !user.resume || !user.resume.data) {
      return res.status(404).send('Resume not found.');
    }

    // Set the content type and disposition for file download
    res.set({
      'Content-Type': user.resume.contentType,
      'Content-Disposition': `attachment; filename="${user.name}-resume.pdf"`,  // Assuming the file is a PDF
    });

    // Send the resume file
    res.send(user.resume.data);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).send('Server error');
  }
});

// Simple hello everyone API
app.get('/', (req, res) => {
  res.send('Hello everyone!');
});


// Define a port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
