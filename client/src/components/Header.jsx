import { Search, User, Plus } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery, searchOpen, setSearchOpen, onAdd }) {
  return (
    <header className="glass-header px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white shadow-sm">
            <span className="text-xs font-bold">V</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Vid<span className="text-cyan-600">Note</span></h1>
            <p className="text-xs text-slate-500">Caption & Hashtag Saver</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="text-lg">×</span>
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setSearchOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Search size={20} />
              </button>
              <button onClick={onAdd} className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
                <Plus size={18} />
              </button>
              <button className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                <User size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}