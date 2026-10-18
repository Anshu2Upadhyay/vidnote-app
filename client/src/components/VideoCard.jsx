import React, { useState } from 'react';
import { Copy, Check, Play, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VideoCard({
  video,
  onOpenPlayer,
  onTogglePosted,
  onDelete,
}) {
  const [copied, setCopied] = useState(false);

  // Unified Copy Action (copies full caption + hashtags in one block)
  const handleCopyUnified = (e) => {
    e.stopPropagation();
    let fullBlock = (video.caption || '').trim();
    if (video.hashtags && !fullBlock.includes(video.hashtags)) {
      fullBlock = fullBlock ? `${fullBlock}\n\n${video.hashtags}` : video.hashtags;
    }
    if (!fullBlock) {
      toast('Empty caption & hashtags to copy', { icon: 'ℹ️' });
      return;
    }

    const videoKey = video.id || video.localId;
    navigator.clipboard.writeText(fullBlock).then(() => {
      setCopied(true);
      toast.success('Caption & Hashtags copied! 📋', {
        id: `copy-${videoKey}`,
        duration: 2500,
        style: {
          borderRadius: '12px',
          background: '#1E293B',
          color: '#fff',
          fontSize: '12px',
          fontWeight: '600',
        },
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    onTogglePosted(video);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(video);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      {/* 1. Thumbnail Section (Top) */}
      <div
        onClick={() => onOpenPlayer(video)}
        className="relative w-full aspect-[16/10] bg-slate-900 cursor-pointer overflow-hidden"
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.caption || 'Video thumbnail'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800 text-slate-400">
            <Play size={24} className="opacity-60" />
          </div>
        )}

        {/* Hover/Touch Play Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform shadow-lg">
            <Play size={16} fill="white" className="ml-0.5" />
          </div>
        </div>

        {/* Top-Left: Smart Status Badge (Draft vs Posted ✅) */}
        {(() => {
          const isPosted = video.status === 'Posted' || video.isPosted;
          return (
            <button
              onClick={handleToggleStatus}
              title="Tap to toggle status"
              className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight shadow-sm backdrop-blur-md transition-all active:scale-90 ${
                isPosted
                  ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white border border-emerald-400/40'
                  : 'bg-black/60 hover:bg-black/80 text-white/90 border border-white/20'
              }`}
            >
              {isPosted ? 'Posted ✅' : 'Draft'}
            </button>
          );
        })()}

        {/* Top-Right: Delete Icon Badge (White circle with red X) */}
        <button
          onClick={handleDeleteClick}
          title="Delete video note"
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/95 hover:bg-white text-[#EF4444] flex items-center justify-center shadow-md transition-all active:scale-90"
        >
          <X size={14} strokeWidth={2.8} />
        </button>

        {/* Bottom-Left: Video Duration Badge (▶ 0:28) */}
        <div className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
          <span>▶</span>
          <span>{video.durationFormatted || '0:00'}</span>
        </div>

        {/* Bottom-Right: Category tag pill if any */}
        {video.category && (
          <div className="absolute bottom-2 right-2 z-10 bg-black/50 backdrop-blur-xs text-slate-200 text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider">
            {video.category}
          </div>
        )}
      </div>

      {/* 2. Unified Caption & Hashtag Block (Bottom of Card) */}
      <div className="p-3 flex flex-col justify-between flex-1 bg-white dark:bg-slate-900 transition-colors">
        {/* Top Row of Block: Caption + Copy Button */}
        <div className="flex items-start justify-between gap-2">
          <p
            onClick={() => onOpenPlayer(video)}
            className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-sky-400 transition-colors flex-1"
            title={video.caption}
          >
            {video.caption || 'No caption entered'}
          </p>

          {/* One-Click Unified Copy Action Button */}
          <button
            onClick={handleCopyUnified}
            title="Copy Caption & Hashtags together"
            className={`p-2 rounded-xl shrink-0 shadow-sm transition-all active:scale-90 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} strokeWidth={2.2} />}
          </button>
        </div>

        {/* Bottom Row of Block: Hashtags Text */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-800/80">
          <p
            onClick={() => onOpenPlayer(video)}
            className="text-[11px] text-blue-600 dark:text-sky-400 font-medium line-clamp-2 leading-tight cursor-pointer hover:underline"
            title={video.hashtags}
          >
            {video.hashtags || '#caption #video'}
          </p>
        </div>
      </div>
    </div>
  );
}
