const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [150, 'Course title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a course category'],
      trim: true,
    },
    level: {
      type: String,
      required: [true, 'Please select a course difficulty level'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: '{VALUE} is not a valid course level',
      },
      default: 'beginner',
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course must have an assigned trainer'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    prerequisites: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and catalog queries
courseSchema.index({ status: 1, category: 1, level: 1 });
courseSchema.index({ trainer: 1 });
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
