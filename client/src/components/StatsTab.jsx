import React from 'react';
import {
  Hash,
  Video,
  Copy,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StatsTab({ videos }) {
  const totalVideos = videos.length;
  const postedCount = videos.filter((v) => v.status === 'Posted' || v.isPosted).length;
  const draftCount = totalVideos - postedCount;
  const postedPercent = totalVideos > 0 ? Math.round((postedCount / totalVideos) * 100) : 0;

  // Compute unique hashtags and frequency
  const hashtagMap = {};
  videos.forEach((v) => {
    const tags = (v.hashtags || '')
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.startsWith('#'));

    tags.forEach((tag) => {
      hashtagMap[tag] = (hashtagMap[tag] || 0) + 1;
    });
  });

  const uniqueHashtagsCount = Object.keys(hashtagMap).length;

  // Top 5 hashtags
  const topHashtags = Object.entries(hashtagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Category breakdown
  const categoryMap = {};
  videos.forEach((v) => {
    const cat = v.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag).then(() => {
      toast.success(`Copied ${tag} ✨`, { id: `stat-${tag}` });
    });
  };

  return (
    <div className="flex-1 p-4 space-y-5 overflow-y-auto no-scrollbar animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Creator Analytics</h2>
        <p className="text-xs text-slate-500">Track your video vault production & hashtag performance</p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Total Videos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Video size={20} />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{totalVideos}</div>
            <div className="text-[11px] font-medium text-slate-500">Total Videos</div>
          </div>
        </div>

        {/* Card 2: Unique Hashtags */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Hash size={20} />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{uniqueHashtagsCount}</div>
            <div className="text-[11px] font-medium text-slate-500">Unique Tags</div>
          </div>
        </div>
      </div>

      {/* Production Status: Drafts vs Posted */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Publishing Status
          </h3>
          <span className="text-xs font-bold text-blue-600">{postedPercent}% Posted</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${postedPercent}%` }}
            className="bg-emerald-500 transition-all duration-500 rounded-full"
          />
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">{postedCount} Posted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="font-semibold text-slate-500">{draftCount} Drafts</span>
          </div>
        </div>
      </div>

      {/* Top 5 Most Used Hashtags */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Top 5 Most Used Hashtags
            </h3>
          </div>
        </div>

        {topHashtags.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No hashtags recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {topHashtags.map(([tag, count], index) => {
              const maxCount = topHashtags[0][1] || 1;
              const barWidth = Math.round((count / maxCount) * 100);

              return (
                <div key={tag} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleCopyTag(tag)}
                      className="font-semibold text-blue-600 hover:underline flex items-center gap-1 active:scale-95"
                    >
                      <span>#{index + 1} {tag}</span>
                      <Copy size={11} className="text-slate-400" />
                    </button>
                    <span className="font-bold text-slate-600 text-[11px]">{count}x</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Category Distribution
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {['Reels', 'YouTube', 'Ideas', 'Travel'].map((cat) => (
            <div key={cat} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{cat}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {categoryMap[cat] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
