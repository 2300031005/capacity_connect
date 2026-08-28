const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Resource must belong to a course'],
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Resource must belong to a module'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a resource title'],
      trim: true,
      maxlength: [150, 'Resource title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      required: [true, 'Please specify resource type'],
      enum: {
        values: ['pdf', 'document', 'presentation', 'text', 'image', 'video', 'link'],
        message: '{VALUE} is not a valid resource type',
      },
    },
    fileName: {
      type: String,
      default: '',
    },
    filePath: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    externalUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
resourceSchema.index({ module: 1 });
resourceSchema.index({ course: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
