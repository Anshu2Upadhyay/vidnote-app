import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';

// In-memory registry for browser Object URLs (for Web / PWA sessions)
const webSessionMap = new Map();

/**
 * Register an ephemeral web object URL for a given video ID or URI
 */
export function registerWebSessionUrl(idOrUri, url) {
  if (idOrUri && url) {
    webSessionMap.set(String(idOrUri), url);
  }
}

/**
 * Retrieve registered web session URL
 */
export function getWebSessionUrl(idOrUri) {
  if (!idOrUri) return null;
  return webSessionMap.get(String(idOrUri));
}

/**
 * Resolves a persistent playable stream URL from a video record
 * - Uses Capacitor.convertFileSrc() for native device paths (Android/iOS)
 * - Uses session Object URL for Web/PWA
 * - Falls back to direct URI if already HTTP/HTTPS/data
 */
export function resolveVideoPlaybackUrl(video) {
  if (!video) return '';

  const id = video.id || video.localId;
  const uri = video.videoUri || video.uri || video.path || '';

  // 1. Check in-memory web session map (browser session)
  const sessionUrl = getWebSessionUrl(id) || getWebSessionUrl(uri);
  if (sessionUrl) {
    return sessionUrl;
  }

  // 2. If it's already an HTTP / HTTPS / Blob / Data URL
  if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('blob:') || uri.startsWith('data:')) {
    return uri;
  }

  // 3. If running in Capacitor or has native file/content scheme
  if (
    Capacitor.isNativePlatform() ||
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('/storage/') ||
    uri.startsWith('/data/')
  ) {
    try {
      return Capacitor.convertFileSrc(uri);
    } catch (err) {
      console.warn('Error converting file src:', err);
      return uri;
    }
  }

  return uri;
}

/**
 * Opens device video picker with Zero Duplication
 * In Capacitor: Uses native OS file picker without copying/reading binary data into memory
 * In Web: Returns null to instruct caller to trigger HTML5 file input
 */
export async function pickVideoNative() {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await FilePicker.pickVideos({
        multiple: false,
        readData: false, // Critical: do NOT load heavy binary into memory!
      });

      if (result.files && result.files.length > 0) {
        const file = result.files[0];
        const nativePath = file.path || '';
        const playableUrl = Capacitor.convertFileSrc(nativePath);

        return {
          isNative: true,
          path: nativePath,
          name: file.name || 'Device Video',
          size: file.size || 0,
          duration: file.duration || 0,
          mimeType: file.mimeType || 'video/mp4',
          playableUrl,
        };
      }
      return { cancelled: true };
    } catch (err) {
      console.warn('Native FilePicker error or fallback required:', err);
      return { isNative: false, error: err };
    }
  }

  return { isNative: false };
}
