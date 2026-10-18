import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Video } from './models/Video.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vidnote';

// CORS configuration for localhost, Vercel deployments, and Capacitor
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or vercel.app preview/production domains
    const isVercel = /\.vercel\.app$/.test(origin) || origin.endsWith('.vercel.app');
    const isExplicitlyAllowed = allowedOrigins.includes(origin);

    if (isExplicitlyAllowed || isVercel || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow to avoid unexpected mobile webview blocks
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection state
let isDbConnected = false;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isDbConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    isDbConnected = false;
    console.warn('⚠️ MongoDB connection failed. Running in standalone API mode (Offline-first client handles persistence):', error.message);
  }
}

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.log('ℹ️ MongoDB disconnected.');
});

mongoose.connection.on('connected', () => {
  isDbConnected = true;
  console.log('✅ MongoDB connected.');
});

// Attempt connection asynchronously
connectDB();

// Routes
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VidNote API',
    database: isDbConnected ? 'connected' : 'offline/disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Get all videos
app.get('/api/videos', async (req, res) => {
  if (!isDbConnected) {
    return res.status(200).json({
      success: true,
      message: 'Running in offline database mode',
      videos: [],
    });
  }
  try {
    const videos = await Video.find().sort({ clientCreatedAt: -1 });
    res.json({ success: true, videos });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create or update video
app.post('/api/videos', async (req, res) => {
  const { localId, caption, hashtags, category, duration, durationFormatted, thumbnail, isPosted, clientCreatedAt, clientUpdatedAt } = req.body;

  if (!localId) {
    return res.status(400).json({ success: false, error: 'localId is required' });
  }

  if (!isDbConnected) {
    return res.json({
      success: true,
      message: 'DB offline - acknowledged for local sync',
      video: req.body,
    });
  }

  try {
    const video = await Video.findOneAndUpdate(
      { localId },
      {
        caption,
        hashtags,
        category,
        duration,
        durationFormatted,
        thumbnail,
        isPosted,
        clientCreatedAt: clientCreatedAt || Date.now(),
        clientUpdatedAt: clientUpdatedAt || Date.now(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, video });
  } catch (err) {
    console.error('Error saving video:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update single video status or properties
app.put('/api/videos/:id', async (req, res) => {
  const localId = req.params.id;
  if (!isDbConnected) {
    return res.json({ success: true, message: 'DB offline - acknowledged' });
  }
  try {
    const updated = await Video.findOneAndUpdate(
      { localId },
      { ...req.body, clientUpdatedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, video: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a video
app.delete('/api/videos/:id', async (req, res) => {
  const localId = req.params.id;
  if (!isDbConnected) {
    return res.json({ success: true, message: 'DB offline - acknowledged' });
  }
  try {
    await Video.findOneAndDelete({ localId });
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sync batch from offline client
app.post('/api/videos/sync', async (req, res) => {
  const { videos = [] } = req.body;

  if (!isDbConnected) {
    return res.json({
      success: true,
      syncedCount: 0,
      message: 'Server online but MongoDB is offline. Metadata kept safely on device.',
    });
  }

  try {
    let syncedCount = 0;
    for (const v of videos) {
      if (!v.localId) continue;
      await Video.findOneAndUpdate(
        { localId: v.localId },
        {
          caption: v.caption,
          hashtags: v.hashtags,
          category: v.category,
          duration: v.duration,
          durationFormatted: v.durationFormatted,
          thumbnail: v.thumbnail,
          isPosted: v.isPosted,
          clientCreatedAt: v.clientCreatedAt || Date.now(),
          clientUpdatedAt: v.clientUpdatedAt || Date.now(),
        },
        { upsert: true, new: true }
      );
      syncedCount++;
    }

    const allServerVideos = await Video.find().sort({ clientCreatedAt: -1 });

    res.json({
      success: true,
      syncedCount,
      serverVideos: allServerVideos,
      message: `Successfully synchronized ${syncedCount} items.`,
    });
  } catch (err) {
    console.error('Error during batch sync:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 VidNote Backend Server running on port ${PORT}`);
});
