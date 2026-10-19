import { X, Copy, Play } from 'lucide-react';

export default function VideoCard({ video, onPlay, onDelete, onCopy }) {
  const duration = video.duration || '0:00';
  const thumb = video.thumbnailDataUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect width="400" height="250" fill="%23E2E8F0"/%3E%3C/svg%3E';
  const hashtags = video.hashtags || [];
  const hashtagText = hashtags.join(' ');

  return (
    <div className="video-card group" onClick={() => onPlay(video)}>
      <div className="relative h-40 bg-slate-200 overflow-hidden">
        <img src={thumb} alt="thumbnail" className="w-full h-full object-cover" />
        <button
          onClick={e => { e.stopPropagation(); onDelete(video.id); }}
          className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
          aria-label="Delete video"
        >
          <X size={14} />
        </button>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
          <Play size={10} fill="white" /> <span>{duration}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">{video.caption}</p>
          <button
            onClick={e => { e.stopPropagation(); onCopy(); }}
            className="copy-btn"
            aria-label="Copy caption & hashtags"
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="text-[11px] text-blue-600 font-medium line-clamp-2">{hashtagText}</p>
      </div>
    </div>
  );
}