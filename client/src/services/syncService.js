import { db } from './db';

const API_BASE_URL = 'http://localhost:5000/api';

export async function checkServerStatus() {
  if (!navigator.onLine) {
    return { online: false, serverConnected: false, dbStatus: 'offline' };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        serverConnected: true,
        dbStatus: data.database || 'connected',
      };
    }
    return { online: true, serverConnected: false, dbStatus: 'unreachable' };
  } catch (_e) {
    console.warn(_e);
    return { online: navigator.onLine, serverConnected: false, dbStatus: 'offline' };
  }
}

export async function syncVideosWithBackend() {
  try {
    const status = await checkServerStatus();
    if (!status.serverConnected) {
      return { success: false, reason: 'Server or DB offline. Data is safe locally.' };
    }

    // Get all local videos from Dexie
    const localVideos = await db.videos.toArray();
    if (localVideos.length === 0) {
      return { success: true, count: 0, message: 'Nothing to sync' };
    }

    // Prepare payload without massive binary Blobs (we sync metadata + Base64 thumbnail)
    const payload = localVideos.map((v) => ({
      localId: v.localId,
      caption: v.caption,
      hashtags: v.hashtags,
      category: v.category,
      duration: v.duration,
      durationFormatted: v.durationFormatted,
      thumbnail: v.thumbnail,
      isPosted: v.isPosted,
      clientCreatedAt: v.clientCreatedAt,
      clientUpdatedAt: v.clientUpdatedAt,
    }));

    const res = await fetch(`${API_BASE_URL}/videos/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videos: payload }),
    });

    if (res.ok) {
      const data = await res.json();
      // Mark local items as synced
      await db.videos.toCollection().modify({ synced: true });
      return { success: true, count: data.syncedCount || localVideos.length, message: 'Sync complete' };
    }

    return { success: false, reason: 'Sync request returned non-200' };
  } catch (err) {
    console.warn('Silent sync skipped:', err.message);
    return { success: false, reason: err.message };
  }
}
