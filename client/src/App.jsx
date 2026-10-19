import { useState, useEffect, useCallback } from 'react';
import { db, SEED_VIDEOS } from '@/db/localDb';
import { Plus, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import VideoCard from '@/components/VideoCard';
import AddVideoModal from '@/components/AddVideoModal';
import VideoPlayer from '@/components/VideoPlayer';
import EmptyState from '@/components/EmptyState';
import CategoryChips from '@/components/CategoryChips';
import IdeasPage from '@/pages/Ideas';
import StatsPage from '@/pages/Stats';
import SettingsPage from '@/pages/Settings';

const CATEGORIES = ['All', 'Reels', 'YouTube', 'Ideas', 'Travel'];

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toast, setToast] = useState(null);

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = useCallback(async () => {
    try {
      const allVideos = await db.videos.toArray();
      setVideos(allVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { console.error('Load error:', err); }
    finally { setLoading(false); }
  }, []);

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.hashtags || []).some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); showToast('Caption & Hashtags copied! 📋'); }
    catch { showToast('Failed to copy', 'error'); }
  };

  const handleAddVideo = (videoData) => {
    setShowAddModal(false);
    setLoading(true);
    const newVideo = { ...videoData, synced: false, createdAt: new Date().toISOString() };
    db.videos.add(newVideo).then(() => { loadVideos(); showToast('Video saved to vault!'); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const deleteVideo = async (id) => {
    setLoading(true);
    await db.videos.delete(id);
    loadVideos();
    showToast('Video deleted');
  };

  const loadDemoData = async () => {
    setLoading(true);
    for (const video of SEED_VIDEOS) { await db.videos.add(video); }
    loadVideos();
    showToast('Demo data loaded!');
  };

  const clearVault = async () => {
    await db.videos.clear();
    loadVideos();
    showToast('Vault cleared');
  };

  const openPlayer = (video) => setSelectedVideo(video);
  const closePlayer = () => setSelectedVideo(null);

  const handleUpdateVideo = (id, updates, keepOpen = false) => {
    db.videos.update(id, updates).then(() => {
      loadVideos();
      if (keepOpen) {
        setSelectedVideo(prev => (prev ? { ...prev, ...updates } : null));
      } else {
        setSelectedVideo(null);
      }
      showToast('Video updated');
    }).catch(err => {
      console.error(err);
      showToast('Failed to update', 'error');
    });
  };

  const handleDeleteFromPlayer = (id) => { closePlayer(); deleteVideo(id); };

  return (
    <div className="mobile-container min-h-screen bg-[#F8FAFC]">
      {toast && (
        <div className="toast show flex items-center gap-3" role="alert">
          {toast.type === 'success' ? '✅' : '❌'}<span>{toast.message}</span>
        </div>
      )}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchOpen={searchOpen} setSearchOpen={setSearchOpen} onAdd={() => setShowAddModal(true)} />
      {activeTab === 'Home' && (
        <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4">
          <div className="mb-4">
            <CategoryChips categories={CATEGORIES} active={categoryFilter} onSelect={setCategoryFilter} />
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mb-2" /><span>Loading vault...</span></div>
          ) : filteredVideos.length === 0 ? (
            <EmptyState onAddDemo={loadDemoData} onAddVideo={() => setShowAddModal(true)} />
          ) : (
            <div className="grid grid-cols-2 gap-3 p-2">
              {filteredVideos.map(video => (
                <VideoCard key={video.id} video={video} onPlay={() => openPlayer(video)} onDelete={(id) => deleteVideo(id)} onCopy={() => { const text = `${video.caption}\n\n${(video.hashtags || []).join(' ')}`; copyToClipboard(text); }} />
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'Ideas' && <IdeasPage videos={videos} onAddVideo={() => setShowAddModal(true)} onPlay={openPlayer} onDelete={deleteVideo} onCopy={copyToClipboard} />}
      {activeTab === 'Stats' && <StatsPage videos={videos} />}
      {activeTab === 'Settings' && <SettingsPage videos={videos} loadDemoData={loadDemoData} clearVault={clearVault} onThemeToggle={() => {}} />}
      {showAddModal && <AddVideoModal onSave={handleAddVideo} onClose={() => setShowAddModal(false)} />}
      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={closePlayer} onCopy={() => { const text = `${selectedVideo.caption}\n\n${(selectedVideo.hashtags || []).join(' ')}`; copyToClipboard(text); }} onDelete={(id) => handleDeleteFromPlayer(id)} onUpdate={(updates, keepOpen) => handleUpdateVideo(selectedVideo.id, updates, keepOpen)} />
      )}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add New Video"><Plus size={24} /></button>
    </div>
  );
}

export default App;