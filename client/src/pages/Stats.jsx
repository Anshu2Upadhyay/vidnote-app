export default function StatsPage({ videos }) {
  const total = videos.length;
  const allTags = videos.flatMap(v => v.hashtags || []);
  const uniqueTags = [...new Set(allTags)].length;
  const totalSize = videos.reduce((acc, v) => acc + (v.file?.size || 0), 0);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  const tagCounts = {};
  allTags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Stats</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Videos</p>
          <p className="text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Unique Hashtags</p>
          <p className="text-3xl font-bold text-slate-900">{uniqueTags}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Storage Used</p>
          <p className="text-3xl font-bold text-slate-900">{sizeMB} MB</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Synced</p>
          <p className="text-3xl font-bold text-slate-900">{videos.filter(v => v.synced).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Hashtags</h3>
        {topTags.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No hashtags yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">{tag}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}