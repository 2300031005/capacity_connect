const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a skill name'],
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a skill category'],
      enum: {
        values: ['Technical', 'Soft Skill', 'Other'],
        message: '{VALUE} is not a valid skill category',
      },
      default: 'Technical',
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

// Pre-validation hook to compute normalizedName
skillSchema.pre('validate', function (next) {
  if (this.name) {
    this.normalizedName = this.name.toLowerCase().trim();
  }
  next();
});

skillSchema.index({ category: 1, isActive: 1 });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
