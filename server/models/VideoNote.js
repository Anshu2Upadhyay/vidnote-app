const mongoose = require('mongoose');

const videoNoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  caption: { type: String, required: true, trim: true },
  hashtags: [{ type: String }],
  category: { type: String, enum: ['Reels', 'YouTube', 'Ideas', 'Travel'], default: 'Reels' },
  duration: { type: String, default: '0:00' },
  thumbnailDataUrl: { type: String },
  synced: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('VideoNote', videoNoteSchema);