import Dexie from 'dexie';

export const db = new Dexie('VidNoteDB');

// Define database schema
// Version 1 (Legacy schema)
db.version(1).stores({
  videos: 'localId, category, isPosted, clientCreatedAt, clientUpdatedAt',
  savedTagGroups: 'id, title, createdAt',
  settings: 'key',
});

// Version 2: "Zero-Duplicate" Reference-Only Architecture
// Only stores metadata + lightweight thumbnail. Drops heavy videoBlob from IndexedDB.
db.version(2)
  .stores({
    videos: 'id, localId, category, status, isPosted, createdAt, clientCreatedAt',
    savedTagGroups: 'id, title, createdAt',
    settings: 'key',
  })
  .upgrade((tx) => {
    return tx.table('videos').toCollection().modify((video) => {
      video.id = video.id || video.localId;
      video.title = video.title || video.videoName || 'Video Draft';
      video.videoUri = video.videoUri || video.uri || '';
      video.status = video.status || (video.isPosted ? 'Posted' : 'Draft');
      video.createdAt = video.createdAt || video.clientCreatedAt || Date.now();
      // Drop binary blob to reclaim 100% device storage
      delete video.videoBlob;
    });
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

/**
 * Thumbnail-Only Generation:
 * Captures a single lightweight canvas image snapshot (JPEG, ~50KB)
 * directly from video URL or file reference.
 * 
 * @param {string|File|Blob} source - Playable video URL or File
 * @returns {Promise<{ duration: number, durationFormatted: string, thumbnail: string }>}
 */
export function extractVideoMetaAndThumbnail(source) {
  return new Promise((resolve, reject) => {
    try {
      let objectUrl = null;
      let videoSrc = '';

      if (typeof source === 'string') {
        videoSrc = source;
      } else if (source instanceof Blob || source instanceof File) {
        objectUrl = URL.createObjectURL(source);
        videoSrc = objectUrl;
      } else {
        return reject(new Error('Invalid video source provided'));
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      video.src = videoSrc;

      const cleanup = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };

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
          // Lightweight dimension capping (600px wide, 16:10 / 16:9 aspect)
          const width = 600;
          const videoW = video.videoWidth || 600;
          const videoH = video.videoHeight || 375;
          const height = Math.round(width * (videoH / videoW)) || 375;
          
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, width, height);

          // Highly optimized JPEG thumbnail (~35KB-50KB)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.75);
          const duration = video.duration || 0;
          const durationFormatted = formatDuration(duration);

          cleanup();
          resolve({
            duration,
            durationFormatted,
            thumbnail,
          });
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      video.onerror = (_e) => {
        cleanup();
        reject(new Error('Failed to load video file for thumbnail generation'));
      };

      // Safety timeout in case video never seeks
      setTimeout(() => {
        if (!video.videoWidth) {
          cleanup();
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
