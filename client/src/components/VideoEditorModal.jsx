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
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState(0);
  const [durationFormatted, setDurationFormatted] = useState('0:00');
  const [videoName, setVideoName] = useState('');
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
        setVideoName(initialVideo.videoName || 'Saved Video');
        if (initialVideo.videoBlob) {
          setVideoBlob(initialVideo.videoBlob);
          const url = URL.createObjectURL(initialVideo.videoBlob);
          setVideoPreviewUrl(url);
        }
      } else {
        // Reset form
        setCaption('');
        setHashtags('');
        setCategory('Reels');
        setVideoBlob(null);
        setVideoPreviewUrl('');
        setThumbnail('');
        setDuration(0);
        setDurationFormatted('0:00');
        setVideoName('');
      }
    }

    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [isOpen, initialVideo]);

  if (!isOpen) return null;

  // Handle user selecting local video file
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
      setVideoPreviewUrl(url);
      setVideoBlob(file);
      setVideoName(file.name);

      // Extract duration and Base64 thumbnail frame at 1.0s
      const meta = await extractVideoMetaAndThumbnail(file);
      setDuration(meta.duration);
      setDurationFormatted(meta.durationFormatted);
      setThumbnail(meta.thumbnail);
      toast.success('Video loaded & thumbnail generated! 🎬', { duration: 2000 });
    } catch (err) {
      console.error(err);
      toast.error('Could not extract thumbnail, using placeholder.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Quick helper to generate a sample animated clip if user has no file
  const handleGenerateSampleClip = async (type = 'sunset') => {
    setIsProcessingVideo(true);
    toast.loading('Generating scenic preview video...', { id: 'gen-clip' });
    try {
      const blob = await createPlayableVideoBlob(type, 3);
      const url = URL.createObjectURL(blob);
      setVideoPreviewUrl(url);
      setVideoBlob(blob);
      setVideoName(`scenic_${type}_reel.mp4`);
      const thumb = generateSceneThumbnail(type);
      setThumbnail(thumb);
      setDuration(15);
      setDurationFormatted('0:15');
      toast.success('Generated scenic video ready! ✨', { id: 'gen-clip' });
    } catch (_err) {
      console.warn(_err);
      toast.error('Generation failed', { id: 'gen-clip' });
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Format Spacing mini-button action (cleans excessive spaces, ensures clean line breaks for IG/YT)
  const handleFormatSpacing = () => {
    if (!caption.trim()) {
      toast('Write caption first to format', { icon: 'ℹ️' });
      return;
    }
    // Remove extra trailing spaces, normalize empty lines
    const formatted = caption
      .split('\n')
      .map((line) => line.trim())
      .filter((line, index, arr) => !(line === '' && arr[index - 1] === ''))
      .join('\n');

    setCaption(formatted);
    toast.success('Formatted clean IG/YouTube spacing! ✨', { duration: 1800 });
  };

  // Auto-format hashtag text to ensure # prefix on comma separated or space separated words
  const handleHashtagChange = (text) => {
    // If user types a comma, turn previous token into #token
    if (text.includes(',')) {
      const tags = text
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`))
        .join(' ');
      setHashtags(tags + ' ');
      return;
    }
    setHashtags(text);
  };

  // Append preset hashtag bundle
  const handleAppendPreset = (presetTags) => {
    const current = hashtags.trim();
    if (!current) {
      setHashtags(presetTags);
    } else {
      // Append only tags that aren't already included
      const existing = current.toLowerCase().split(/\s+/);
      const toAdd = presetTags
        .split(/\s+/)
        .filter((t) => !existing.includes(t.toLowerCase()))
        .join(' ');
      if (toAdd) {
        setHashtags(`${current} ${toAdd}`.trim());
      }
    }
    toast.success('Added hashtag bundle! 🏷️', { duration: 1500 });
  };

  // Clear selected video
  const handleClearVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoBlob(null);
    setVideoPreviewUrl('');
    setThumbnail('');
    setDuration(0);
    setDurationFormatted('0:00');
    setVideoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save handler
  const handleSave = () => {
    if (!caption.trim() && !videoBlob) {
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

    const videoRecord = {
      localId: initialVideo ? initialVideo.localId : generateLocalId(),
      caption: caption.trim(),
      hashtags: cleanedTags,
      category,
      duration: duration || 0,
      durationFormatted: durationFormatted || '0:00',
      thumbnail: thumbnail || '',
      videoBlob: videoBlob || initialVideo?.videoBlob || null,
      videoName: videoName || 'Video Note',
      videoType: videoBlob?.type || 'video/mp4',
      videoSize: videoBlob?.size || 0,
      isPosted: initialVideo ? initialVideo.isPosted : false,
      clientCreatedAt: initialVideo ? initialVideo.clientCreatedAt : Date.now(),
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

          <h2 className="text-base font-bold text-slate-800">
            {initialVideo ? 'Edit Video Note' : 'Add New Video'}
          </h2>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-1.5 rounded-full text-sm font-semibold shadow-sm shadow-blue-500/25 transition-all"
          >
            Save
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* 1. Video Picker or Preview Box */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!videoPreviewUrl && !thumbnail ? (
              <div className="flex flex-col gap-2">
                {/* Soft blue dashed card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-50/60 hover:bg-blue-50/90 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-2xl p-6 text-center cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2 shadow-xs">
                    <Camera size={22} />
                  </div>
                  <p className="text-blue-600 font-semibold text-sm">
                    Select Video from Gallery
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tap to choose a video file (MP4, WebM, MOV)
                  </p>
                </div>

                {/* Quick AI/Sample Clip Generator button if no file */}
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
                <span>Processing video & generating 1.0s thumbnail...</span>
              </div>
            )}
          </div>

          {/* 2. Category & Platform Tag */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category / Platform
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 scale-[1.02]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Caption / Idea Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Caption / Idea
              </label>
              <button
                type="button"
                onClick={handleFormatSpacing}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg transition-colors"
                title="Format clean line breaks for Instagram and YouTube"
              >
                <Sparkles size={12} className="text-blue-500" />
                <span>✨ Format Spacing</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Write your caption or idea here... You can add notes, description, or anything you want to remember."
                className="w-full bg-slate-100 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all resize-none font-normal leading-relaxed"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-medium">
                {caption.length}/500
              </span>
            </div>
          </div>

          {/* 4. Hashtags Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hashtags (comma separated)
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {hashtags.length}/200
              </span>
            </div>

            <textarea
              value={hashtags}
              onChange={(e) => handleHashtagChange(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="#socialmedia #video #vidnote #growth #idea"
              className="w-full bg-slate-100 rounded-xl p-3 text-sm text-blue-600 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all resize-none leading-relaxed"
            />

            {/* Quick Hashtag Presets */}
            <div className="mt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Quick Preset Bundles:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HASHTAGS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAppendPreset(preset.tags)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors border border-blue-100 active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
