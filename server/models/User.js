const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: function () {
        return this.email ? this.email.split('@')[0] : 'User';
      },
    },
    avatar: {
      type: String,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['otp', 'google'],
      default: 'otp',
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to safely return public user profile
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    avatar: this.avatar,
    authProvider: this.authProvider,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
