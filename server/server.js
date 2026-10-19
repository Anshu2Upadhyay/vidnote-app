require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const videoRoutes = require('./routes/videoRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vidnote';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get(['/api/health', '/health'], (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount routes with and without /api prefix for bulletproof compatibility
app.use('/api', videoRoutes);
app.use('/api', aiRoutes);
app.use('/', videoRoutes);
app.use('/', aiRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed (offline mode):', err.message);
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
  });