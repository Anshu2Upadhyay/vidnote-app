import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';

/**
 * UpdatePrompt Component
 * Listens for new Service Worker versions and automatically fetches updates when
 * the device comes online, refreshing the app with the latest deployment seamlessly.
 */
export default function UpdatePrompt() {
  const refreshingRef = useRef(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;

      // When the device comes back online, immediately check for SW updates
      const checkUpdate = () => {
        if (navigator.onLine) {
          registration.update().catch((err) => {
            console.debug('SW update check skipped/failed:', err);
          });
        }
      };

      window.addEventListener('online', checkUpdate);

      // Also check periodically every 60s when network is active
      const interval = setInterval(checkUpdate, 60 * 1000);

      // Initial check after short delay
      setTimeout(checkUpdate, 3000);
    },
    onRegisterError(error) {
      console.warn('PWA registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh && !refreshingRef.current) {
      refreshingRef.current = true;

      toast('✨ New update available! Refreshing...', {
        icon: '🔄',
        duration: 3000,
        style: {
          background: '#0F172A',
          color: '#38BDF8',
          border: '1px solid #1E293B',
          borderRadius: '12px',
          padding: '12px 16px',
          fontWeight: 600,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        },
      });

      // Auto update and reload
      const timer = setTimeout(() => {
        updateServiceWorker(true);
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
