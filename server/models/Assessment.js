const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  optionA: {
    type: String,
    required: [true, 'Option A is required'],
    trim: true,
  },
  optionB: {
    type: String,
    required: [true, 'Option B is required'],
    trim: true,
  },
  optionC: {
    type: String,
    required: [true, 'Option C is required'],
    trim: true,
  },
  optionD: {
    type: String,
    required: [true, 'Option D is required'],
    trim: true,
  },
  correctOption: {
    type: String,
    required: [true, 'Correct option is required'],
    enum: {
      values: ['A', 'B', 'C', 'D'],
      message: 'Correct option must be A, B, C, or D',
    },
    uppercase: true,
    trim: true,
  },
  marks: {
    type: Number,
    default: 1,
    min: [1, 'Marks must be at least 1'],
  },
  explanation: {
    type: String,
    trim: true,
    default: '',
    maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    default: null,
  },
  topic: {
    type: String,
    trim: true,
    default: '',
  },
});

const assessmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Assessment must belong to a course'],
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null, // Null for final course assessments, populated for module quizzes
    },
    type: {
      type: String,
      enum: {
        values: ['module', 'final'],
        message: 'Assessment type must be either "module" or "final"',
      },
      required: [true, 'Assessment type is required'],
    },
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    timeLimit: {
      type: Number,
      default: 0, // 0 = no time limit, or minutes
      min: 0,
    },
    allowedAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    passingPercentage: {
      type: Number,
      default: 60,
      min: [0, 'Passing percentage must be at least 0%'],
      max: [100, 'Passing percentage cannot exceed 100%'],
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (val) {
          // If published, must have at least 1 question
          if (this.status === 'published') {
            return Array.isArray(val) && val.length >= 1;
          }
          return true;
        },
        message: 'Published assessment must contain at least 1 question',
      },
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be either "draft" or "published"',
      },
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

assessmentSchema.index({ course: 1, type: 1 });
assessmentSchema.index({ module: 1, type: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;
