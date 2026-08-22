import mongoose from 'mongoose';

// User and Career Preferences Schema
const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // Hashed password
  displayName: { type: String, default: 'User' },
  photoURL: { type: String, default: '' },
  xpPoints: { type: Number, default: 1250 },
  streak: { type: Number, default: 7 },
  plan: { type: String, default: 'FREE' },
  usage: {
    analysisCount: { type: Number, default: 0 },
    windowStartDate: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  preferences: {
    fullname: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    careerStatus: { type: String, default: '' },
    experienceYears: { type: String, default: '' },
    preferredWorkStyle: { type: String, default: '' },
    targetLocation: { type: String, default: '' },
    expectedSalary: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    academicFoundation: { type: [mongoose.Schema.Types.Mixed], default: [] }
  }
});

// Resume Schema
const ResumeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  filename: { type: String, required: true },
  targetRole: { type: String, default: 'Full Stack Developer' },
  parsedData: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

// ATS Result Schema
const AtsResultSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  resumeId: { type: String, required: true },
  score: { type: Number, required: true },
  market_match: { type: Number, default: 0 },
  label: { type: String, default: 'Moderate Traction' },
  color: { type: String, default: 'amber' },
  breakdown: { type: [mongoose.Schema.Types.Mixed], default: [] },
  top_3_fixes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

// Roadmap Schema
const RoadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  resumeId: { type: String, required: true },
  title: { type: String },
  sprints: { type: [mongoose.Schema.Types.Mixed], default: [] },
  salary_projection: { type: mongoose.Schema.Types.Mixed, default: {} },
  skill_gap_report: { type: mongoose.Schema.Types.Mixed, default: {} },
  marketAnalysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Resume = mongoose.model('Resume', ResumeSchema);
export const AtsResult = mongoose.model('AtsResult', AtsResultSchema);
export const Roadmap = mongoose.model('Roadmap', RoadmapSchema);
