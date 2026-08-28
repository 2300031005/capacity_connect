const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    trainee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Certificate must belong to a trainee'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Certificate must belong to a course'],
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Certificate must designate a trainer'],
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Certificate must be associated with the passed final assessment'],
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    filePath: {
      type: String,
      required: [true, 'Local certificate file path is required'],
    },
    status: {
      type: String,
      enum: ['valid', 'revoked'],
      default: 'valid',
    },
  },
  {
    timestamps: true,
  }
);

// One certificate per trainee per course
certificateSchema.index({ trainee: 1, course: 1 }, { unique: true });
certificateSchema.index({ trainer: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
