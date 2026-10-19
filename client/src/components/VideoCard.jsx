import { useState } from 'react';
import { X, Copy, Play, Sparkles, Cloud } from 'lucide-react';

export default function VideoCard({ video, onPlay, onDelete, onCopy }) {
  const duration = video.duration || '0:00';
  const initialThumb = video.thumbnailDataUrl || video.preview || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%231E293B'/%3E%3Ccircle cx='200' cy='125' r='30' fill='%233B82F6'/%3E%3Cpolygon points='193,110 213,125 193,140' fill='white'/%3E%3C/svg%3E";
  const [imgSrc, setImgSrc] = useState(initialThumb);

  const hashtags = video.hashtags || [];
  const hashtagText = hashtags.join(' ');
  const isCloudBacked = Boolean(video.cloudBackup || video.synced);

  return (
    <div className="video-card group cursor-pointer" onClick={() => onPlay(video)}>
      <div className="relative h-40 bg-slate-900 overflow-hidden rounded-t-2xl">
        <img
          src={imgSrc}
          alt={video.caption || 'Video thumbnail'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => {
            if (video.preview && imgSrc !== video.preview) {
              setImgSrc(video.preview);
            } else {
              setImgSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%230F172A'/%3E%3Ccircle cx='200' cy='125' r='30' fill='%236366F1'/%3E%3Cpolygon points='193,110 213,125 193,140' fill='white'/%3E%3C/svg%3E");
            }
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {video.watermarkRemoved && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Sparkles size={9} /> Clean
            </span>
          )}
          {isCloudBacked && (
            <span className="bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Cloud size={9} /> Drive
            </span>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(video.id);
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs backdrop-blur-sm transition-all"
          aria-label="Delete video"
        >
          <X size={13} />
        </button>

        {/* Duration badge */}
        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
          <Play size={9} fill="white" /> <span>{duration}</span>
        </div>
      </div>

      <div className="p-3 bg-white rounded-b-2xl border-t border-slate-50">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
            {video.caption || 'Untitled Video'}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="copy-btn hover:text-blue-600"
            aria-label="Copy caption & hashtags"
          >
            <Copy size={15} />
          </button>
        </div>
        <p className="text-[11px] text-blue-600 font-medium line-clamp-2">
          {hashtagText}
        </p>
      </div>
    </div>
  );
}