import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Camera,
  X,
  Play,
  Sparkles,
  Loader2,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { extractVideoMetaAndThumbnail, generateLocalId } from '../services/db';
import { createPlayableVideoBlob, generateSceneThumbnail } from '../services/sampleData';
import {
  pickVideoNative,
  registerWebSessionUrl,
  resolveVideoPlaybackUrl,
} from '../services/videoUtils';

const CATEGORIES = ['Reels', 'YouTube', 'Ideas', 'Travel'];

const PRESET_HASHTAGS = [
  { label: '+ Viral Reels', tags: '#reels #viral #explore #trending' },
  { label: '+ YouTube Shorts', tags: '#shorts #youtubeshorts #subscribe' },
  { label: '+ Travel', tags: '#travel #nature #wanderlust #adventure' },
  { label: '+ Creator Growth', tags: '#contentcreator #socialmediatips #growth' },
];

export default function VideoEditorModal({
  isOpen,
  onClose,
  initialVideo = null,
  onSave,
}) {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [category, setCategory] = useState('Reels');
  const [videoUri, setVideoUri] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState(0);
  const [durationFormatted, setDurationFormatted] = useState('0:00');
  const [videoName, setVideoName] = useState('');
  const [videoSize, setVideoSize] = useState(0);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const fileInputRef = useRef(null);
  const previewVideoRef = useRef(null);

  // Initialize form when opened (for add or edit)
  useEffect(() => {
    if (isOpen) {
      if (initialVideo) {
        setCaption(initialVideo.caption || '');
        setHashtags(initialVideo.hashtags || '');
        setCategory(initialVideo.category || 'Reels');
        setThumbnail(initialVideo.thumbnail || '');
        setDuration(initialVideo.duration || 0);
        setDurationFormatted(initialVideo.durationFormatted || '0:00');
        setVideoName(initialVideo.title || initialVideo.videoName || 'Saved Video');
        setVideoSize(initialVideo.videoSize || 0);
        setVideoUri(initialVideo.videoUri || '');

        const resolved = resolveVideoPlaybackUrl(initialVideo);
        setVideoPreviewUrl(resolved || '');
      } else {
        // Reset form
        setCaption('');
        setHashtags('');
        setCategory('Reels');
        setVideoUri('');
        setVideoPreviewUrl('');
        setThumbnail('');
        setDuration(0);
        setDurationFormatted('0:00');
        setVideoName('');
        setVideoSize(0);
      }
    }
  }, [isOpen, initialVideo]);

  if (!isOpen) return null;

  /**
   * Unified Video Picker (Zero-Duplicate)
   * Uses native Capacitor file picker when available on Android/iOS,
   * otherwise falls back to HTML5 file input.
   */
  const handleOpenPicker = async () => {
    setIsProcessingVideo(true);
    try {
      const nativeResult = await pickVideoNative();
      if (nativeResult.cancelled) {
        setIsProcessingVideo(false);
        return;
      }

      if (nativeResult.isNative && nativeResult.path) {
        setVideoUri(nativeResult.path);
        setVideoPreviewUrl(nativeResult.playableUrl);
        setVideoName(nativeResult.name || 'Device Video');
        setVideoSize(nativeResult.size || 0);

        // Generate lightweight canvas snapshot (~50KB JPEG) directly from streaming URL
        const meta = await extractVideoMetaAndThumbnail(nativeResult.playableUrl);
        setDuration(meta.duration || nativeResult.duration || 0);
        setDurationFormatted(meta.durationFormatted || '0:00');
        setThumbnail(meta.thumbnail);

        toast.success('Native video referenced! (Zero duplicate storage) 📱✨', { duration: 2500 });
        setIsProcessingVideo(false);
        return;
      }
    } catch (err) {
      console.warn('Native picker error, opening file dialog:', err);
    }

    setIsProcessingVideo(false);
    fileInputRef.current?.click();
  };

  // Web / HTML5 File Input Fallback
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    setIsProcessingVideo(true);
    try {
      const url = URL.createObjectURL(file);
      const uriRef = `web://${file.name || 'video.mp4'}`;
      registerWebSessionUrl(uriRef, url);

      setVideoPreviewUrl(url);
      setVideoUri(uriRef);
      setVideoName(file.name);
      setVideoSize(file.size || 0);

      // Extract duration and ~50KB Base64 thumbnail frame at 1.0s
      const meta = await extractVideoMetaAndThumbnail(file);
      setDuration(meta.duration);
      setDurationFormatted(meta.durationFormatted);
      setThumbnail(meta.thumbnail);
      toast.success('Video referenced with lightweight thumbnail! 🎬', { duration: 2000 });
    } catch (err) {
      console.error(err);
      toast.error('Could not extract thumbnail, using placeholder.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Helper to generate a sample animated clip without saving any Blobs to storage
  const handleGenerateSampleClip = async (type = 'sunset') => {
    setIsProcessingVideo(true);
    toast.loading('Generating scenic preview video...', { id: 'gen-clip' });
    try {
      const blob = await createPlayableVideoBlob(type, 3);
      const url = URL.createObjectURL(blob);
      const sampleRef = `sample://${type}`;
      registerWebSessionUrl(sampleRef, url);

      setVideoPreviewUrl(url);
      setVideoUri(sampleRef);
      setVideoName(`scenic_${type}_reel.mp4`);
      const thumb = generateSceneThumbnail(type);
      setThumbnail(thumb);
      setDuration(15);
      setDurationFormatted('0:15');
      toast.success('Generated scenic clip ready! ✨', { id: 'gen-clip' });
    } catch (_err) {
      console.warn(_err);
      toast.error('Generation failed', { id: 'gen-clip' });
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Format Spacing action (cleans excessive spaces, ensures clean line breaks for IG/YT)
  const handleFormatSpacing = () => {
    if (!caption.trim()) {
      toast('Write caption first to format', { icon: 'ℹ️' });
      return;
    }
    const formatted = caption
      .split('\n')
      .map((line) => line.trim())
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n');

    setCaption(formatted);
    toast.success('Caption spacing polished! ✨', { duration: 1500 });
  };

  // Append preset hashtags
  const handleAddPreset = (tags) => {
    setHashtags((prev) => {
      const existing = prev ? prev.trim() + ' ' : '';
      return (existing + tags).trim();
    });
  };

  // Clear selected video
  const handleClearVideo = () => {
    setVideoUri('');
    setVideoPreviewUrl('');
    setThumbnail('');
    setDuration(0);
    setDurationFormatted('0:00');
    setVideoName('');
    setVideoSize(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save handler (Zero Duplication: stores only metadata, native URI reference & ~50KB thumbnail)
  const handleSave = () => {
    if (!caption.trim() && !videoUri && !thumbnail) {
      toast.error('Please enter a caption or choose a video');
      return;
    }

    // Format hashtags nicely with #
    let cleanedTags = hashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .join(' ');

    const recordId = initialVideo?.id || initialVideo?.localId || generateLocalId();
    const effectiveStatus = initialVideo
      ? initialVideo.status || (initialVideo.isPosted ? 'Posted' : 'Draft')
      : 'Draft';

    if (videoPreviewUrl) {
      registerWebSessionUrl(recordId, videoPreviewUrl);
    }

    const videoRecord = {
      id: recordId,
      localId: recordId, // backwards compatibility
      title: videoName || (caption ? caption.slice(0, 30) + '...' : 'Video Note'),
      videoUri: videoUri || initialVideo?.videoUri || '',
      thumbnail: thumbnail || '',
      caption: caption.trim(),
      hashtags: cleanedTags,
      category,
      status: effectiveStatus,
      isPosted: effectiveStatus === 'Posted', // backwards compatibility
      duration: duration || 0,
      durationFormatted: durationFormatted || '0:00',
      videoSize: videoSize || 0,
      createdAt: initialVideo?.createdAt || initialVideo?.clientCreatedAt || Date.now(),
      clientCreatedAt: initialVideo?.createdAt || initialVideo?.clientCreatedAt || Date.now(),
      clientUpdatedAt: Date.now(),
      synced: false,
    };

    onSave(videoRecord);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="p-1.5 -ml-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100"
            aria-label="Back"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-base font-bold text-slate-900">
            {initialVideo ? 'Edit Video Note' : 'Add New Video'}
          </h2>
          <button
            onClick={handleSave}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 active:scale-95 px-2 py-1"
          >
            Save
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
          {/* Section 1: Video Picker Box (Zero-Duplicate) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Video Reference & Thumbnail
            </label>

            {/* Hidden HTML5 File Input for Web fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!videoPreviewUrl && !thumbnail ? (
              <div className="flex flex-col gap-2">
                {/* Soft blue dashed card */}
                <div
                  onClick={handleOpenPicker}
                  className="bg-blue-50/60 hover:bg-blue-50/90 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-2xl p-6 text-center cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2 shadow-xs">
                    <Camera size={22} />
                  </div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Select Video from Gallery
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Zero-Duplicate: references local file without consuming extra storage
                  </p>
                </div>

                {/* Demo clip generator */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] text-slate-400 font-medium">Or test with instant demo clip:</span>
                  <button
                    type="button"
                    onClick={() => handleGenerateSampleClip('sunset')}
                    disabled={isProcessingVideo}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg"
                  >
                    <Wand2 size={12} />
                    <span>Auto-create Sunset Clip</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Video Preview Box (Shown after selecting a file) */
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-200 shadow-inner group">
                {videoPreviewUrl ? (
                  <video
                    ref={previewVideoRef}
                    src={videoPreviewUrl}
                    className="w-full h-full object-cover"
                    playsInline
                    loop
                    onClick={() => {
                      if (previewVideoRef.current) {
                        if (previewVideoRef.current.paused) {
                          previewVideoRef.current.play();
                          setIsPlayingPreview(true);
                        } else {
                          previewVideoRef.current.pause();
                          setIsPlayingPreview(false);
                        }
                      }
                    }}
                  />
                ) : (
                  <img
                    src={thumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Centered Play overlay button */}
                {!isPlayingPreview && (
                  <div
                    onClick={() => {
                      if (previewVideoRef.current) {
                        previewVideoRef.current.play();
                        setIsPlayingPreview(true);
                      }
                    }}
                    className="absolute inset-0 bg-black/25 flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform">
                      <Play size={20} fill="white" className="ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Top-Right: Clear 'X' button */}
                <button
                  type="button"
                  onClick={handleClearVideo}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
                  aria-label="Remove video"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>

                {/* Bottom-Right: Duration badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
                  {durationFormatted}
                </div>

                {/* Bottom-Left: File name */}
                <div className="absolute bottom-2.5 left-2.5 max-w-[60%] truncate bg-black/50 backdrop-blur-xs text-slate-200 text-[10px] px-2 py-0.5 rounded-md">
                  {videoName || 'Custom Video'}
                </div>
              </div>
            )}

            {isProcessingVideo && (
              <div className="flex items-center gap-2 mt-2 text-xs text-blue-600 font-medium">
                <Loader2 size={14} className="animate-spin" />
                <span>Referencing video & generating lightweight ~50KB thumbnail...</span>
              </div>
            )}
          </div>

          {/* Section 2: Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Caption Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Caption
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFormatSpacing}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md"
                >
                  <Sparkles size={11} />
                  <span>Format Spacing</span>
                </button>
                <span
                  className={`text-[11px] font-medium ${
                    caption.length > 480 ? 'text-amber-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {caption.length}/500
                </span>
              </div>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 500))}
              placeholder="Write an engaging caption for your reel or short..."
              rows={4}
              className="w-full text-sm p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Section 4: Hashtags Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hashtags
              </label>
              <span
                className={`text-[11px] font-medium ${
                  hashtags.length > 180 ? 'text-amber-600 font-bold' : 'text-slate-400'
                }`}
              >
                {hashtags.length}/200
              </span>
            </div>
            <textarea
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value.slice(0, 200))}
              placeholder="#reels #explore #viral #creator..."
              rows={2}
              className="w-full text-sm p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-800 placeholder-slate-400 font-mono text-xs"
            />

            {/* Quick Hashtag Presets pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_HASHTAGS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAddPreset(preset.tags)}
                  className="text-[11px] font-medium text-blue-600 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-3 safe-bottom">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 text-sm font-bold text-white rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
