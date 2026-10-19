const mongoose = require('mongoose');

const videoNoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  caption: { type: String, required: true, trim: true },
  hashtags: [{ type: String }],
  category: { type: String, enum: ['Reels', 'YouTube', 'Ideas', 'Travel'], default: 'Reels' },
  duration: { type: String, default: '0:00' },
  thumbnailDataUrl: { type: String },
  preview: { type: String },
  videoUrl: { type: String },
  watermarkRemoved: { type: Boolean, default: false },
  socialMetadata: { type: Object },
  cloudBackup: {
    provider: { type: String, default: 'Google Drive' },
    driveId: { type: String },
    status: { type: String, default: 'backed_up' },
    backedUpAt: { type: Date, default: Date.now },
  },
  synced: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('VideoNote', videoNoteSchema);