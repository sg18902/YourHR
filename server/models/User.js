const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  resume: { 
    data: Buffer,  // Store the file buffer
    contentType: String,  // Store the MIME type
  },
  skills: { type: [String], required: true },  // Array of user's skills
  experience: { type: Number, required: true },  // Number of years of experience
  password: { type: String, required: true }  // Password field
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
