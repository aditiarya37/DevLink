const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LinkSchema = new mongoose.Schema({
    github: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
}, { _id: false });

const WorkExperienceSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true },
    company: { type: String, trim: true, required: true },
    location: { type: String, trim: true, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
});

const EducationSchema = new mongoose.Schema({
    institution: { type: String, trim: true, required: true },
    degree: { type: String, trim: true, default: '' },
    fieldOfStudy: { type: String, trim: true, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    description: { type: String, trim: true, maxlength: 500, default: '' },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'],
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot be more than 20 characters long']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address', ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  displayName: {
    type: String,
    trim: true,
    default: function() { return this.username; }
  },
  profilePicture: {
    type: String,
    default: `https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=150&font-size=0.33&length=1`,
  },
  bio: {
    type: String,
    maxlength: [250, 'Bio cannot be more than 250 characters'],
    default: ''
  },
  following: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  followers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  skills: [ { type: String, trim: true, lowercase: true, } ],
  links: { type: LinkSchema, default: () => ({}) },
  workExperience: [WorkExperienceSchema],
  education: [EducationSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index({ skills: 1 });
UserSchema.index({ username: 'text', displayName: 'text' }); 

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;