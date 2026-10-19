export default function EmptyState({ onAddDemo, onAddVideo }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-32 h-32 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Your vault is empty.</h2>
      <p className="text-sm text-slate-500 text-center px-4 mb-8">Tap + to add your first video and caption!</p>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={onAddDemo} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium shadow-md hover:bg-blue-700 transition-colors">
          Load Demo Data
        </button>
        <button onClick={onAddVideo} className="flex-1 bg-white text-slate-700 py-3 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
          Add Video
        </button>
      </div>
    </div>
  );
}