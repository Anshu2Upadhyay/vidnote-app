export default function IdeasPage({ videos, onAddVideo, onPlay, onDelete, onCopy }) {
  const ideas = videos.filter(v => v.category === 'Ideas');
  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Ideas</h2>
        <p className="text-sm text-slate-500">Quick caption and hashtag drafts</p>
      </div>
      {ideas.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">No ideas yet</h3>
          <p className="text-sm text-slate-500 mb-6">Tap + to add your first idea draft!</p>
          <button onClick={onAddVideo} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">Add Idea</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-2">
          {ideas.map(video => (
            <div key={video.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2">{video.caption}</p>
              <p className="text-[11px] text-blue-600 font-medium line-clamp-1 mb-3">{video.hashtags.join(' ')}</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => onPlay(video)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-100">Preview</button>
                <button onClick={() => { const t = `${video.caption}\n\n${video.hashtags.join(' ')}`; onCopy(t); }} className="flex-1 bg-white text-slate-700 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50">Copy</button>
                <button onClick={() => onDelete(video.id)} className="w-10 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-medium hover:bg-red-100">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}