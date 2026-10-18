import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { db } from './services/db';
import { populateSampleVideos } from './services/sampleData';
import { checkServerStatus, syncVideosWithBackend } from './services/syncService';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CategoryChips from './components/CategoryChips';
import EmptyState from './components/EmptyState';
import VideoCard from './components/VideoCard';
import VideoEditorModal from './components/VideoEditorModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import IdeasTab from './components/IdeasTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import ProfileModal from './components/ProfileModal';
import UpdatePrompt from './components/UpdatePrompt';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Network & Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState({ serverConnected: false, dbStatus: 'checking' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  // Modals & Navigation
  const [playerVideo, setPlayerVideo] = useState(null);
  const [editorState, setEditorState] = useState({ isOpen: false, videoToEdit: null });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. Fetch videos from local IndexedDB
  const refreshVideos = async () => {
    try {
      const all = await db.videos.orderBy('clientCreatedAt').reverse().toArray();
      setVideos(all);
    } catch (e) {
      console.error('Error reading from IndexedDB:', e);
    }
  };

  // Initial load
  useEffect(() => {
    refreshVideos();

    // Check server status
    checkServerStatus().then((status) => {
      setServerStatus(status);
      if (status.serverConnected) {
        syncVideosWithBackend().then(() => refreshVideos());
      }
    });

    // Online / Offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet connection restored 🌐', { id: 'net-status' });
      checkServerStatus().then((s) => {
        setServerStatus(s);
        if (s.serverConnected) {
          syncVideosWithBackend().then(() => refreshVideos());
        }
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setServerStatus({ serverConnected: false, dbStatus: 'offline' });
      toast('Offline mode active. All videos saved to device 📱', {
        id: 'net-status',
        icon: '🔒',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: videos.length };
    videos.forEach((v) => {
      const cat = v.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [videos]);

  // Filtered videos based on category and live search query
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchCategory =
        selectedCategory === 'All' || v.category === selectedCategory;

      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchCaption = (v.caption || '').toLowerCase().includes(q);
      const matchHashtags = (v.hashtags || '').toLowerCase().includes(q);
      const matchCat = (v.category || '').toLowerCase().includes(q);

      return matchCaption || matchHashtags || matchCat;
    });
  }, [videos, selectedCategory, searchQuery]);

  // Save or Update Video
  const handleSaveVideo = async (videoRecord) => {
    try {
      await db.videos.put(videoRecord);
      setEditorState({ isOpen: false, videoToEdit: null });
      await refreshVideos();

      // Confetti celebration
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (_e) {
        console.warn(_e);
      }

      toast.success('Saved to local vault! 🎬');

      // Silent sync if online
      if (isOnline && serverStatus.serverConnected) {
        syncVideosWithBackend().catch(() => {});
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save video');
    }
  };

  // Toggle isPosted status
  const handleTogglePosted = async (video) => {
    try {
      const updated = {
        ...video,
        isPosted: !video.isPosted,
        clientUpdatedAt: Date.now(),
      };
      await db.videos.put(updated);
      await refreshVideos();

      if (playerVideo && playerVideo.localId === video.localId) {
        setPlayerVideo(updated);
      }

      if (updated.isPosted) {
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_e) {
          console.warn(_e);
        }
        toast.success('Marked as Posted! 🚀', { id: `status-${video.localId}` });
      } else {
        toast('Moved back to Drafts', { id: `status-${video.localId}`, icon: '📝' });
      }

      if (isOnline && serverStatus.serverConnected) {
        syncVideosWithBackend().catch(() => {});
      }
    } catch (_e) {
      console.warn(_e);
      toast.error('Failed to update status');
    }
  };

  // Delete Video with Undo Toast
  const handleDeleteVideo = async (video) => {
    const backupVideo = { ...video };
    try {
      await db.videos.delete(video.localId);
      await refreshVideos();

      if (playerVideo && playerVideo.localId === video.localId) {
        setPlayerVideo(null);
      }

      toast(
        (t) => (
          <div className="flex items-center justify-between gap-3 text-xs">
            <span>Video deleted</span>
            <button
              onClick={async () => {
                await db.videos.put(backupVideo);
                await refreshVideos();
                toast.dismiss(t.id);
                toast.success('Restored video note! ↩️');
              }}
              className="px-2 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 4000, id: `del-${video.localId}` }
      );

      // Silently sync delete if online
      if (isOnline && serverStatus.serverConnected) {
        fetch(`http://localhost:5000/api/videos/${video.localId}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    } catch (_e) {
      console.warn(_e);
      toast.error('Failed to delete');
    }
  };

  // Load Showcase Demo Videos
  const handleLoadSamples = async () => {
    setIsLoadingSamples(true);
    toast.loading('Generating realistic showcase clips & thumbnails...', { id: 'sample-toast' });
    try {
      await populateSampleVideos();
      await refreshVideos();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (_e) {
        console.warn(_e);
      }
      toast.success('Showcase demo vault loaded! 🎉', { id: 'sample-toast' });
      setActiveTab('home');
    } catch (err) {
      console.error(err);
      toast.error('Could not load sample videos', { id: 'sample-toast' });
    } finally {
      setIsLoadingSamples(false);
    }
  };

  // Clear All Data
  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to delete all saved videos and hashtag groups? This action cannot be undone.')) {
      try {
        await db.videos.clear();
        await db.savedTagGroups.clear();
        await refreshVideos();
        toast.success('Vault reset successfully');
        setActiveTab('home');
      } catch (_e) {
        console.warn(_e);
        toast.error('Failed to clear database');
      }
    }
  };

  // Manual Sync trigger
  const handleManualSync = async () => {
    setIsSyncing(true);
    toast.loading('Synchronizing with MERN backend...', { id: 'sync-toast' });
    try {
      const res = await syncVideosWithBackend();
      if (res.success) {
        toast.success(res.message || 'Vault synced with cloud! ☁️', { id: 'sync-toast' });
        await refreshVideos();
      } else {
        toast(res.reason || 'Backend offline. Data is safely stored locally.', {
          id: 'sync-toast',
          icon: 'ℹ️',
        });
      }
      const s = await checkServerStatus();
      setServerStatus(s);
    } catch (_err) {
      console.warn(_err);
      toast.error('Sync failed', { id: 'sync-toast' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 md:py-6 flex items-center justify-center font-sans antialiased text-slate-800">
      {/* Toast Notification Container */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#1E293B',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          },
        }}
      />

      {/* PWA / OTA Update Listener & Auto Refresh */}
      <UpdatePrompt />

      {/* Sleek Mobile-First Viewport Container */}
      <div className="w-full max-w-md mx-auto min-h-screen md:min-h-[844px] md:max-h-[880px] bg-[#F8FAFC] shadow-2xl relative overflow-hidden flex flex-col md:rounded-[40px] md:border-[8px] md:border-slate-800">
        {/* Global Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isOnline={isOnline}
          serverStatus={serverStatus}
          onSync={handleManualSync}
          isSyncing={isSyncing}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Tab 1: Home View (Dashboard & 2-Column Grid / Empty State) */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            {/* Category Filter Chips */}
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              counts={categoryCounts}
            />

            {/* Conditional Content: Empty State vs 2-Column Video Grid */}
            {videos.length === 0 ? (
              <EmptyState
                onOpenAdd={() => setEditorState({ isOpen: true, videoToEdit: null })}
                onLoadSamples={handleLoadSamples}
                isLoadingSamples={isLoadingSamples}
              />
            ) : filteredVideos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <p className="text-sm font-semibold">No matching videos found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try another search query or category filter
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-3 text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Populated State (2-Column Grid - grid-cols-2 gap-3 p-4) */
              <div className="p-4 grid grid-cols-2 gap-3 pb-8">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.localId}
                    video={video}
                    onOpenPlayer={(v) => setPlayerVideo(v)}
                    onTogglePosted={handleTogglePosted}
                    onDelete={handleDeleteVideo}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Ideas View */}
        {activeTab === 'ideas' && (
          <IdeasTab
            videos={videos}
            onOpenPlayer={(v) => setPlayerVideo(v)}
            onTogglePosted={handleTogglePosted}
            onDeleteVideo={handleDeleteVideo}
            onOpenAddModal={() => setEditorState({ isOpen: true, videoToEdit: null })}
          />
        )}

        {/* Tab 3: Stats View */}
        {activeTab === 'stats' && <StatsTab videos={videos} />}

        {/* Tab 4: Settings View */}
        {activeTab === 'settings' && (
          <SettingsTab
            isOnline={isOnline}
            serverStatus={serverStatus}
            onSync={handleManualSync}
            isSyncing={isSyncing}
            onLoadSamples={handleLoadSamples}
            isLoadingSamples={isLoadingSamples}
            onClearAllData={handleClearAllData}
            videoCount={videos.length}
          />
        )}

        {/* Global Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => setEditorState({ isOpen: true, videoToEdit: null })}
        />

        {/* Screen 2: Add / Edit Video Modal */}
        <VideoEditorModal
          isOpen={editorState.isOpen}
          initialVideo={editorState.videoToEdit}
          onClose={() => setEditorState({ isOpen: false, videoToEdit: null })}
          onSave={handleSaveVideo}
        />

        {/* Screen 3: Full Video Player Screen ("Preview") */}
        {playerVideo && (
          <VideoPlayerModal
            video={playerVideo}
            onClose={() => setPlayerVideo(null)}
            onEdit={(v) => {
              setPlayerVideo(null);
              setEditorState({ isOpen: true, videoToEdit: v });
            }}
            onMarkPosted={handleTogglePosted}
          />
        )}

        {/* User Profile Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          totalVideos={videos.length}
          storageStatus={serverStatus}
        />
      </div>
    </div>
  );
}
