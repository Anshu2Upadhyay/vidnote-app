import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Copy,
  Sparkles,
  Wand2,
  Loader2,
  Save,
  CheckCircle2,
  Check,
  RotateCcw
} from 'lucide-react';
import { removeVideoWatermark, generateSmartAutofill } from '@/services/apiService';

export default function VideoPlayer({ video, onClose, onCopy, onDelete, onUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'social'
  const [socialPlatform, setSocialPlatform] = useState('youtube'); // 'youtube' | 'instagram' | 'facebook'

  // Editable fields
  const [caption, setCaption] = useState(video.caption || '');
  const [hashtagsText, setHashtagsText] = useState((video.hashtags || []).join(' '));

  // Watermark removal state (Gemini Mathematical Alpha Unblending)
  const [currentPreview, setCurrentPreview] = useState(video.preview || null);
  const [watermarkMode, setWatermarkMode] = useState('gemini'); // 'gemini' | 'veo'
  const [isRemovingWatermark, setIsRemovingWatermark] = useState(false);
  const [watermarkProgress, setWatermarkProgress] = useState(0);
  const [watermarkStatus, setWatermarkStatus] = useState('');
  const [watermarkRemoved, setWatermarkRemoved] = useState(video.watermarkRemoved || false);
  const [unsavedWatermark, setUnsavedWatermark] = useState(false);

  // Social metadata state
  const existingMeta = video.socialMetadata || {};
  const [ytTitle, setYtTitle] = useState(existingMeta.youtube?.title || '');
  const [ytDescription, setYtDescription] = useState(existingMeta.youtube?.description || '');
  const [ytTags, setYtTags] = useState(existingMeta.youtube?.tags || '');
  const [ytHashtags, setYtHashtags] = useState(existingMeta.youtube?.hashtags || '');

  const [igCaption, setIgCaption] = useState(existingMeta.instagram?.reelCaption || '');
  const [igHashtags, setIgHashtags] = useState(existingMeta.instagram?.hashtags || '');

  const [fbPostText, setFbPostText] = useState(existingMeta.facebook?.postText || '');
  const [fbHashtags, setFbHashtags] = useState(existingMeta.facebook?.hashtags || '');

  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const videoRef = useRef(null);

  // Derive playable video source safely (without throw if video.file is undefined)
  const getVideoSource = () => {
    if (currentPreview) return currentPreview;
    if (video.preview) return video.preview;
    if (video.file instanceof Blob || video.file instanceof File) {
      try {
        return URL.createObjectURL(video.file);
      } catch (e) {
        console.warn('URL.createObjectURL failed:', e);
      }
    }
    return video.thumbnailDataUrl || '';
  };

  const videoSrc = getVideoSource();
  const isSvgPoster = typeof videoSrc === 'string' && videoSrc.startsWith('data:image/svg');

  useEffect(() => {
    const v = videoRef.current;
    if (v && !isSvgPoster) {
      if (isPlaying) {
        v.play().catch(e => console.log('Playback notice:', e));
      } else {
        v.pause();
      }
    }
  }, [isPlaying, isSvgPoster]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const notifyCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Watermark Removal Action (Gemini Mathematical Alpha Unblending)
  const handleRemoveWatermark = async () => {
    if (isRemovingWatermark) return;
    setIsRemovingWatermark(true);
    setWatermarkProgress(15);
    setWatermarkStatus('Loading Gemini & Veo alpha reference masks...');

    const timer1 = setTimeout(() => {
      setWatermarkProgress(55);
      setWatermarkStatus('Applying reverse alpha: Original = (Watermarked - Logo*α)/(1-α)...');
    }, 300);

    const timer2 = setTimeout(() => {
      setWatermarkProgress(85);
      setWatermarkStatus('Subtracting watermark transparency (100% Zero Quality Loss)...');
    }, 650);

    try {
      const response = await removeVideoWatermark({
        videoId: video.id,
        videoUrl: videoSrc,
        preview: currentPreview || video.preview,
        thumbnailDataUrl: video.thumbnailDataUrl,
        caption: caption,
        mode: watermarkMode,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setWatermarkProgress(100);
      setWatermarkStatus('Gemini watermark unblended successfully! ✨');

      if (response && response.cleanedVideoUrl) {
        setCurrentPreview(response.cleanedVideoUrl);
        setWatermarkRemoved(true);
        setUnsavedWatermark(true);
      }
    } catch (err) {
      console.error('Watermark removal error:', err);
      alert('Could not remove watermark: ' + err.message);
    } finally {
      setTimeout(() => {
        setIsRemovingWatermark(false);
      }, 500);
    }
  };

  // Save cleaned video using existing file save mechanism
  const handleSaveCleanedVideo = () => {
    onUpdate({
      preview: currentPreview,
      thumbnailDataUrl: currentPreview,
      watermarkRemoved: true,
    }, true);
    setUnsavedWatermark(false);
  };

  // 2. Contextual AI Metadata Auto-Fill
  const handleSmartAutoFill = async () => {
    if (isAutoFilling) return;
    setIsAutoFilling(true);
    try {
      const tagsArray = hashtagsText.split(/[\s,]+/).filter(Boolean);
      const res = await generateSmartAutofill({
        title: caption,
        caption: caption,
        hashtags: tagsArray,
        category: video.category || 'Reels',
      });

      if (res && res.youtube) {
        setYtTitle(res.youtube.title || '');
        setYtDescription(res.youtube.description || '');
        setYtTags(res.youtube.tags || '');
        setYtHashtags(res.youtube.hashtags || '');
      }

      if (res && res.instagram) {
        setIgCaption(res.instagram.reelCaption || '');
        setIgHashtags(res.instagram.hashtags || '');
      }

      if (res && res.facebook) {
        setFbPostText(res.facebook.postText || '');
        setFbHashtags(res.facebook.hashtags || '');
      }

      // Switch to social metadata tab to let the user review and edit
      setActiveTab('social');
    } catch (err) {
      console.error('Autofill error:', err);
      alert('Failed to auto-fill metadata: ' + err.message);
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Save all changes (caption, hashtags, and social metadata)
  const handleSaveAll = () => {
    const updatedTags = hashtagsText.split(/[\s,]+/).filter(Boolean);
    const socialData = {
      youtube: {
        title: ytTitle,
        description: ytDescription,
        tags: ytTags,
        hashtags: ytHashtags,
      },
      instagram: {
        reelCaption: igCaption,
        hashtags: igHashtags,
      },
      facebook: {
        postText: fbPostText,
        hashtags: fbHashtags,
      },
    };

    onUpdate({
      caption,
      hashtags: updatedTags,
      socialMetadata: socialData,
      ...(unsavedWatermark ? { preview: currentPreview, thumbnailDataUrl: currentPreview, watermarkRemoved: true } : {}),
    }, true);
    setUnsavedWatermark(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col select-none">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base">Video Note & Editor</span>
          {watermarkRemoved && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> Cleaned
            </span>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 bg-white/10 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white rounded-2xl shadow-2xl p-2 w-52 z-30 border border-slate-100 animate-in fade-in zoom-in-95">
          <button
            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 font-medium hover:bg-slate-50 rounded-xl flex items-center gap-2"
            onClick={() => {
              setMenuOpen(false);
              setActiveTab(activeTab === 'social' ? 'notes' : 'social');
            }}
          >
            <Wand2 size={15} className="text-purple-600" />
            {activeTab === 'social' ? 'View Notes' : 'Social Metadata'}
          </button>
          <button
            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 font-medium hover:bg-slate-50 rounded-xl flex items-center gap-2"
            onClick={() => {
              setMenuOpen(false);
              handleRemoveWatermark();
            }}
          >
            <Sparkles size={15} className="text-amber-500" />
            Remove Watermark
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button
            className="w-full text-left px-4 py-2.5 text-xs text-red-500 font-medium hover:bg-red-50 rounded-xl flex items-center gap-2"
            onClick={() => {
              setMenuOpen(false);
              onDelete(video.id);
            }}
          >
            <Trash2 size={15} /> Delete Video
          </button>
        </div>
      )}

      {/* Video Preview Canvas */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
        {isSvgPoster ? (
          <img
            src={videoSrc}
            alt="Preview"
            className="w-full h-full object-contain max-h-[46vh]"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain max-h-[46vh]"
            muted={isMuted}
            playsInline
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                setDurationSec(videoRef.current.duration || 0);
              }
            }}
            onClick={() => setIsPlaying(!isPlaying)}
          />
        )}

        {/* Center Play Overlay */}
        {!isSvgPoster && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition-all">
              {isPlaying ? <Pause size={30} className="text-white ml-0.5" /> : <Play size={30} className="text-white ml-1" />}
            </div>
          </div>
        )}

        {/* Top Watermark Action Badge on Preview */}
        <div className="absolute top-16 left-4 z-10 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-0.5 rounded-full border border-white/15">
            <button
              onClick={() => setWatermarkMode('gemini')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                watermarkMode === 'gemini'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Google Gemini Omni & Nano Banana"
            >
              Gemini
            </button>
            <button
              onClick={() => setWatermarkMode('veo')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                watermarkMode === 'veo'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Google Flow & Veo 3 AI Video"
            >
              Veo 3
            </button>
          </div>

          <button
            onClick={handleRemoveWatermark}
            disabled={isRemovingWatermark}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-full text-xs font-semibold shadow-lg shadow-indigo-950/40 border border-white/20 backdrop-blur-md active:scale-95 transition-all"
          >
            {isRemovingWatermark ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} className="text-amber-300" />
            )}
            <span>✨ Remove Watermark (AI)</span>
          </button>

          {unsavedWatermark && (
            <button
              onClick={handleSaveCleanedVideo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-lg shadow-emerald-950/40 border border-emerald-400/30 backdrop-blur-md active:scale-95 transition-all"
            >
              <Save size={13} />
              <span>Save Cleaned Video</span>
            </button>
          )}
        </div>

        {/* Processing Progress Loader Modal */}
        {isRemovingWatermark && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/25 animate-pulse">
              <Sparkles size={32} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Gemini Watermark Remover</h3>
            <p className="text-indigo-300 text-[10px] font-mono mb-2">Original = (Watermarked - Logo * α) / (1 - α)</p>
            <p className="text-slate-300 text-xs mb-4 max-w-xs">{watermarkStatus}</p>

            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${watermarkProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Loader2 size={12} className="animate-spin text-indigo-400" />
              <span>Neural inpainting in progress...</span>
            </div>
          </div>
        )}

        {/* Bottom Playback Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10">
          <div className="flex items-center gap-3 mb-1.5">
            {!isSvgPoster && (
              <>
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                  }}
                  className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white text-xs hover:bg-white/20"
                >
                  ↺ 10
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100"
                >
                  {isPlaying ? <Pause size={18} className="ml-0.5" /> : <Play size={18} className="ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
                  }}
                  className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white text-xs hover:bg-white/20"
                >
                  10 ↻
                </button>
              </>
            )}

            <div className="flex items-center gap-2 flex-1 ml-2">
              <span className="text-[11px] text-white/80 font-mono">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={durationSec || 100}
                value={currentTime || 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[11px] text-white/80 font-mono">{video.duration || formatTime(durationSec)}</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sheet - Editor & Social Metadata */}
      <div className="bg-white rounded-t-3xl shadow-2xl max-h-[50vh] flex flex-col overflow-hidden">
        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'notes'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📝 Notes & Tags
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/50'
              }`}
            >
              <Sparkles size={13} />
              <span>Social Metadata (AI)</span>
            </button>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <Save size={13} />
            <span>Save</span>
          </button>
        </div>

        {/* Tab 1: Notes & Tags Tab */}
        {activeTab === 'notes' && (
          <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
            {/* Contextual AI Auto-Fill Trigger Bar */}
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-100 rounded-2xl p-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm">
                  <Wand2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Generate Social Metadata</p>
                  <p className="text-[10px] text-slate-500">Auto-fill YouTube, Reels & Facebook</p>
                </div>
              </div>

              <button
                onClick={handleSmartAutoFill}
                disabled={isAutoFilling}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
              >
                {isAutoFilling ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} className="text-amber-300" />
                )}
                <span>🪄 Auto-Fill Social Metadata</span>
              </button>
            </div>

            {/* Editable Title / Caption */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Title / Caption
                </label>
                <button
                  onClick={() => notifyCopy(caption, 'caption')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  {copiedKey === 'caption' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedKey === 'caption' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your video note or title here..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Editable Initial Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Initial Hashtags
                </label>
                <button
                  onClick={() => notifyCopy(hashtagsText, 'tags')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  {copiedKey === 'tags' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedKey === 'tags' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <input
                type="text"
                value={hashtagsText}
                onChange={(e) => setHashtagsText(e.target.value)}
                placeholder="#travel #reels #inspiration"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-blue-600 font-medium focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Quick Copy All Action */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const fullText = `${caption}\n\n${hashtagsText}`;
                  navigator.clipboard.writeText(fullText);
                  onCopy();
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Copy size={14} /> Copy Note & Tags
              </button>
              <button
                onClick={handleRemoveWatermark}
                disabled={isRemovingWatermark}
                className="py-2.5 px-4 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-violet-200 transition-all"
              >
                <Sparkles size={14} /> ✨ Remove Watermark
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: AI Social Metadata Tab */}
        {activeTab === 'social' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-Tabs: YouTube, Instagram, Facebook */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSocialPlatform('youtube')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    socialPlatform === 'youtube'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  YouTube
                </button>
                <button
                  onClick={() => setSocialPlatform('instagram')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    socialPlatform === 'instagram'
                      ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  Instagram
                </button>
                <button
                  onClick={() => setSocialPlatform('facebook')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    socialPlatform === 'facebook'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Facebook
                </button>
              </div>

              {/* Regenerate Trigger */}
              <button
                onClick={handleSmartAutoFill}
                disabled={isAutoFilling}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                title="Regenerate with AI"
              >
                {isAutoFilling ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                <span>Re-Generate</span>
              </button>
            </div>

            {/* Platform Fields Content Container */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {/* YouTube Fields */}
              {socialPlatform === 'youtube' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide">
                      YouTube Metadata
                    </span>
                    <button
                      onClick={() =>
                        notifyCopy(
                          `${ytTitle}\n\n${ytDescription}\n\nTags: ${ytTags}\n\n${ytHashtags}`,
                          'yt-all'
                        )
                      }
                      className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'yt-all' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'yt-all' ? 'Copied All' : 'Copy All YouTube'}</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-semibold text-slate-700">Video Title</label>
                      <button
                        onClick={() => notifyCopy(ytTitle, 'yt-title')}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        {copiedKey === 'yt-title' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ytTitle}
                      onChange={(e) => setYtTitle(e.target.value)}
                      placeholder="YouTube Title (4K, High CTR)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-semibold text-slate-700">Description</label>
                      <button
                        onClick={() => notifyCopy(ytDescription, 'yt-desc')}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        {copiedKey === 'yt-desc' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      value={ytDescription}
                      onChange={(e) => setYtDescription(e.target.value)}
                      placeholder="YouTube Description with timestamps and subscribe CTA..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-red-500 outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[11px] font-semibold text-slate-700">Tags (SEO)</label>
                        <button
                          onClick={() => notifyCopy(ytTags, 'yt-tags')}
                          className="text-[10px] text-slate-500 hover:text-slate-800"
                        >
                          {copiedKey === 'yt-tags' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ytTags}
                        onChange={(e) => setYtTags(e.target.value)}
                        placeholder="Comma separated tags..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 focus:bg-white focus:border-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[11px] font-semibold text-slate-700">Hashtags</label>
                        <button
                          onClick={() => notifyCopy(ytHashtags, 'yt-hash')}
                          className="text-[10px] text-slate-500 hover:text-slate-800"
                        >
                          {copiedKey === 'yt-hash' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ytHashtags}
                        onChange={(e) => setYtHashtags(e.target.value)}
                        placeholder="#Shorts #VidNote"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-red-600 focus:bg-white focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Instagram Fields */}
              {socialPlatform === 'instagram' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wide">
                      Instagram Reel Metadata
                    </span>
                    <button
                      onClick={() => notifyCopy(`${igCaption}\n\n${igHashtags}`, 'ig-all')}
                      className="text-[11px] text-pink-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'ig-all' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'ig-all' ? 'Copied All' : 'Copy Reel Caption & Tags'}</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-semibold text-slate-700">Reel Caption</label>
                      <button
                        onClick={() => notifyCopy(igCaption, 'ig-cap')}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        {copiedKey === 'ig-cap' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      value={igCaption}
                      onChange={(e) => setIgCaption(e.target.value)}
                      placeholder="Hook line, emojis, call to action..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-semibold text-slate-700">Hashtags (High Reach)</label>
                      <button
                        onClick={() => notifyCopy(igHashtags, 'ig-hash')}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        {copiedKey === 'ig-hash' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      value={igHashtags}
                      onChange={(e) => setIgHashtags(e.target.value)}
                      placeholder="#reels #explorepage #trending..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-pink-600 font-medium focus:bg-white focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Facebook Fields */}
              {socialPlatform === 'facebook' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                      Facebook Post Metadata
                    </span>
                    <button
                      onClick={() => notifyCopy(`${fbPostText}\n\n${fbHashtags}`, 'fb-all')}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'fb-all' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'fb-all' ? 'Copied All' : 'Copy Post Content'}</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-semibold text-slate-700">Post Text</label>
                      <button
                        onClick={() => notifyCopy(fbPostText, 'fb-text')}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        {copiedKey === 'fb-text' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      value={fbPostText}
                      onChange={(e) => setFbPostText(e.target.value)}
                      placeholder="Engaging discussion post, question, story..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-semibold text-slate-700">Hashtags</label>
                      <button
                        onClick={() => notifyCopy(fbHashtags, 'fb-hash')}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        {copiedKey === 'fb-hash' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={fbHashtags}
                      onChange={(e) => setFbHashtags(e.target.value)}
                      placeholder="#Community #Inspiration #VidNote..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-blue-600 font-medium focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}