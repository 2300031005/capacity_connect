const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    trainee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Enrollment must belong to a trainee'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Enrollment must belong to a course'],
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedModules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['active', 'completed'],
        message: '{VALUE} is not a valid enrollment status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollments for the same trainee and course
enrollmentSchema.index({ trainee: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ trainee: 1, status: 1 });
enrollmentSchema.index({ course: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
