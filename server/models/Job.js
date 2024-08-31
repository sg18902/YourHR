const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], required: true },  // Array of skills required for the job
  requiredExperience: { type: Number, required: true },  // Minimum years of experience required
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // Array of User ObjectIds (optional)
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
