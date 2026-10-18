import Dexie from 'dexie';

export const db = new Dexie('VidNoteDB');

// Define database schema
db.version(1).stores({
  videos: 'localId, category, isPosted, clientCreatedAt, clientUpdatedAt',
  savedTagGroups: 'id, title, createdAt',
  settings: 'key',
});

// Helper for unique ID generation
export function generateLocalId() {
  return 'vn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// Format seconds into MM:SS
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Generate thumbnail and get duration from a Video Blob
export function extractVideoMetaAndThumbnail(videoBlob) {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(videoBlob);
      video.src = objectUrl;

      // Handle metadata loaded
      video.onloadedmetadata = () => {
        const duration = video.duration || 0;
        // Seek to 1s or half duration if shorter
        const seekTime = Math.min(1.0, duration > 0 ? duration / 2 : 0);
        video.currentTime = seekTime;
      };

      // When seeked, capture frame to canvas
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          // Scale to 16:10 or 16:9 ratio with crisp resolution
          const width = 640;
          const height = Math.round(width * (video.videoHeight / (video.videoWidth || 1))) || 400;
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, width, height);

          const thumbnail = canvas.toDataURL('image/jpeg', 0.85);
          const duration = video.duration || 0;
          const durationFormatted = formatDuration(duration);

          // Clean up
          URL.revokeObjectURL(objectUrl);
          resolve({
            duration,
            durationFormatted,
            thumbnail,
          });
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      video.onerror = (_e) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load video file for thumbnail generation'));
      };

      // Fallback timeout in case video never seeks
      setTimeout(() => {
        if (!video.videoWidth) {
          URL.revokeObjectURL(objectUrl);
          resolve({
            duration: 0,
            durationFormatted: '0:00',
            thumbnail: '',
          });
        }
      }, 5000);
    } catch (err) {
      reject(err);
    }
  });
}
