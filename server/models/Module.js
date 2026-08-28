const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Module must belong to a course'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a module title'],
      trim: true,
      maxlength: [150, 'Module title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      required: [true, 'Module order number is required'],
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying course modules in order
moduleSchema.index({ course: 1, order: 1 });

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
