const mongoose = require('mongoose');

const courseDiscussionMessageSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Discussion message must belong to a course'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    message: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast chronological conversation querying
courseDiscussionMessageSchema.index({ course: 1, createdAt: 1 });

const CourseDiscussionMessage = mongoose.model(
  'CourseDiscussionMessage',
  courseDiscussionMessageSchema
);

module.exports = CourseDiscussionMessage;
