const mongoose = require('mongoose');

const competencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a competency name'],
      trim: true,
      unique: true,
      maxlength: [120, 'Competency name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

competencySchema.index({ isActive: 1 });

const Competency = mongoose.model('Competency', competencySchema);

module.exports = Competency;
