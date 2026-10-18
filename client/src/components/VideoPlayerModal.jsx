import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Edit3,
  Share2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { formatDuration } from '../services/db';
import { resolveVideoPlaybackUrl } from '../services/videoUtils';
import { createPlayableVideoBlob } from '../services/sampleData';

export default function VideoPlayerModal({
  video,
  onClose,
  onEdit,
  onMarkPosted,
}) {
  const [videoSrc, setVideoSrc] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Initialize video stream directly from native reference (Capacitor.convertFileSrc) or Web session
  useEffect(() => {
    let isMounted = true;
    let objectUrlToRevoke = null;

    async function initVideo() {
      if (!video) return;

      // Handle sample demo videos dynamically without saving heavy Blobs in IndexedDB
      if (video.videoUri && video.videoUri.startsWith('sample://')) {
        const sceneType = video.videoUri.replace('sample://', '') || 'sunset';
        try {
          const blob = await createPlayableVideoBlob(sceneType, 3);
          if (isMounted) {
            const url = URL.createObjectURL(blob);
            objectUrlToRevoke = url;
            setVideoSrc(url);
          }
        } catch (err) {
          console.warn('Sample video generation fallback:', err);
          if (isMounted) setVideoSrc('');
        }
        return;
      }

      // Stream directly from native device path or web session URL
      const resolved = resolveVideoPlaybackUrl(video);
      if (isMounted) {
        setVideoSrc(resolved);
      }
    }

    initVideo();

    return () => {
      isMounted = false;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [video]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.duration || 0);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleRewind10 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const handleForward10 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Unified Copy Action (Copies [Caption]\n\n[Hashtags])
  const handleCopyAll = () => {
    let fullBlock = (video.caption || '').trim();
    if (video.hashtags && !fullBlock.includes(video.hashtags)) {
      fullBlock = fullBlock ? `${fullBlock}\n\n${video.hashtags}` : video.hashtags;
    }
    if (!fullBlock) {
      toast('Empty caption & hashtags to copy', { icon: 'ℹ️' });
      return;
    }

    navigator.clipboard.writeText(fullBlock).then(() => {
      setCopiedAll(true);
      toast.success('Caption & Hashtags copied! 📋', {
        id: 'player-copy-all',
        duration: 2500,
      });
      setTimeout(() => setCopiedAll(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  // Copy single hashtag pill
  const handleCopySingleTag = (tag) => {
    navigator.clipboard.writeText(tag).then(() => {
      toast.success(`Copied ${tag} ✨`, { id: `tag-${tag}`, duration: 1500 });
    });
  };

  // Native Web Share or Share Action
  const handleShare = async () => {
    let fullText = (video.caption || '').trim();
    if (video.hashtags && !fullText.includes(video.hashtags)) {
      fullText = fullText ? `${fullText}\n\n${video.hashtags}` : video.hashtags;
    }

    if (navigator.share) {
      try {
        const shareData = {
          title: video.title || 'VidNote Video Post',
          text: fullText,
        };

        await navigator.share(shareData);
        toast.success('Shared successfully! 🚀');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyAll();
        }
      }
    } else {
      // Fallback
      handleCopyAll();
    }
  };

  // Copy & Mark as Posted
  const handleCopyAndMarkPosted = () => {
    handleCopyAll();
    onMarkPosted(video, true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (_e) {
      console.warn(_e);
    }
    toast.success('Marked as Posted! 🎉', { id: 'posted-toast' });
  };

  // Parse hashtags into array
  const hashtagList = (video.hashtags || '')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Caption split into title / body
  const captionLines = (video.caption || '').split('\n').filter(Boolean);
  const captionTitle = captionLines[0] || 'Untitled Video';
  const captionBody = captionLines.slice(1).join('\n') || (captionLines.length === 1 ? '' : '');

  return (
    <div
      ref={playerContainerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-fade-in"
    >
      {/* 1. Top Overlay Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white safe-top">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 text-white"
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold tracking-tight">Preview</span>
          {video.category && (
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
              {video.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(video)}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 text-white/90 hover:text-white"
            title="Edit Video Note"
          >
            <Edit3 size={19} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 text-white/90 hover:text-white"
            title="Share"
          >
            <Share2 size={19} />
          </button>
        </div>
      </div>

      {/* 2. Full-Screen Video Canvas & Custom Controls */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-black min-h-0">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            loop
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full max-h-[60vh] object-contain cursor-pointer"
          />
        ) : video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.caption}
            className="w-full h-full max-h-[60vh] object-contain"
          />
        ) : (
          <div className="text-slate-400 text-sm">No video source</div>
        )}

        {/* Center Big Play Button if paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute z-10 w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl border border-white/20"
          >
            <Play size={28} fill="white" className="ml-1" />
          </button>
        )}

        {/* Custom Video Controls Strip */}
        <div className="w-full px-5 py-3 bg-gradient-to-t from-black/90 to-transparent space-y-2 mt-auto">
          {/* Interactive Timeline Scrubber Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Controls: Mute, Rewind, Play/Pause, Forward, Fullscreen */}
          <div className="flex items-center justify-between text-white/90 px-2 pt-1">
            <button
              onClick={toggleMute}
              className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 active:scale-95"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <div className="flex items-center gap-5">
              <button
                onClick={handleRewind10}
                className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 active:scale-95 flex items-center gap-0.5 text-xs font-semibold"
                title="Rewind 10s"
              >
                <RotateCcw size={18} />
                <span className="text-[10px]">10</span>
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md active:scale-95"
              >
                {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
              </button>

              <button
                onClick={handleForward10}
                className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 active:scale-95 flex items-center gap-0.5 text-xs font-semibold"
                title="Forward 10s"
              >
                <span className="text-[10px]">10</span>
                <RotateCw size={18} />
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 active:scale-95"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Drawer Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl max-h-[46vh] flex flex-col overflow-y-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 transition-colors">
        {/* Drag Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

        {/* Unified Copy Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 pr-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {captionTitle}
            </h3>
            {captionBody && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto no-scrollbar">
                {captionBody}
              </p>
            )}
          </div>

          {/* Prominent Blue Button "📋 Copy All" */}
          <button
            onClick={handleCopyAll}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 transition-all active:scale-95 ${
              copiedAll
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
            }`}
          >
            {copiedAll ? <Check size={14} strokeWidth={2.8} /> : <Copy size={14} />}
            <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
          </button>
        </div>

        {/* Interactive Hashtag Pills */}
        {hashtagList.length > 0 && (
          <div className="py-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-2">
              Tap any hashtag to copy:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
              {hashtagList.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopySingleTag(tag)}
                  className="bg-blue-50 dark:bg-sky-950/40 hover:bg-blue-100 dark:hover:bg-sky-900/60 active:scale-95 text-blue-600 dark:text-sky-400 px-3 py-1 rounded-lg text-xs font-medium border border-blue-100/80 dark:border-sky-800/60 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Smart Feature — Quick Share / Post Action Bar */}
        <div className="pt-2 flex items-center gap-2 mt-auto safe-bottom">
          <button
            onClick={handleCopyAndMarkPosted}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              video.isPosted
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>{video.isPosted ? 'Posted Already ✅' : 'Copy & Mark as Posted ✅'}</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
