const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: {
        values: ['trainee', 'trainer', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      default: 'trainee',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    careerGoal: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    photo: {
      type: String,
      trim: true,
      default: '',
    },
    education: [
      {
        qualification: { type: String, trim: true, default: '' },
        institution: { type: String, trim: true, default: '' },
        fieldOfStudy: { type: String, trim: true, default: '' },
        startYear: { type: Number, default: null },
        endYear: { type: Number, default: null },
        description: { type: String, trim: true, default: '' },
      },
    ],
    experience: [
      {
        jobTitle: { type: String, trim: true, default: '' },
        organization: { type: String, trim: true, default: '' },
        employmentType: { type: String, trim: true, default: 'Full-time' },
        startDate: { type: String, trim: true, default: '' },
        endDate: { type: String, trim: true, default: '' },
        isCurrent: { type: Boolean, default: false },
        description: { type: String, trim: true, default: '' },
      },
    ],
    interests: {
      type: [String],
      default: [],
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    professionalBackground: {
      type: String,
      trim: true,
      default: '',
    },
    teachingInterests: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password with bcryptjs
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to return safe user object without password
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id.toString(),
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    skills: this.skills,
    careerGoal: this.careerGoal || '',
    phone: this.phone || '',
    location: this.location || '',
    bio: this.bio || '',
    photo: this.photo || '',
    education: this.education || [],
    experience: this.experience || [],
    interests: this.interests || [],
    designation: this.designation || '',
    organization: this.organization || '',
    yearsOfExperience: this.yearsOfExperience || 0,
    professionalBackground: this.professionalBackground || '',
    teachingInterests: this.teachingInterests || [],
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
