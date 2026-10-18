import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    localId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    caption: {
      type: String,
      default: '',
    },
    hashtags: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Reels',
    },
    duration: {
      type: Number,
      default: 0,
    },
    durationFormatted: {
      type: String,
      default: '0:00',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    isPosted: {
      type: Boolean,
      default: false,
    },
    clientCreatedAt: {
      type: Number,
      default: () => Date.now(),
    },
    clientUpdatedAt: {
      type: Number,
      default: () => Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.model('Video', videoSchema);
