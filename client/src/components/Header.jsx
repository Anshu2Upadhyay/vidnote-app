import { useState } from 'react';
import { Search, X, User, WifiOff, RefreshCw, Moon, Sun } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  isOnline,
  serverStatus,
  onSync,
  isSyncing,
  onOpenProfile,
  isDarkMode = false,
  onToggleDarkMode,
}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 safe-top transition-colors">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand Logo & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-[#1E293B] dark:text-slate-100 transition-colors">Vid</span>
              <span className="text-[#0EA5E9] dark:text-sky-400 transition-colors">Note</span>
            </h1>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                isOnline
                  ? serverStatus?.serverConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-blue-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
              }`}
              title={
                isOnline
                  ? serverStatus?.serverConnected
                    ? 'Online & Synced with Node/MongoDB'
                    : 'Online - Offline Storage Active'
                  : '100% Offline Mode'
              }
            >
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {serverStatus?.serverConnected ? 'Synced' : 'Local Vault'}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff size={10} />
                  Offline
                </span>
              )}
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 transition-colors">
            Caption & Hashtag Saver
          </span>
        </div>

        {/* Right Actions: Dark Mode, Search, Profile */}
        <div className="flex items-center gap-1.5">
          {/* Quick sync icon if server connected */}
          {serverStatus?.serverConnected && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Sync with cloud"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <RefreshCw size={17} className={isSyncing ? 'animate-spin text-blue-600 dark:text-sky-400' : ''} />
            </button>
          )}

          {/* Persistent Dark Mode On/Off Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-full text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun size={19} className="text-amber-400 animate-spin-once" />
            ) : (
              <Moon size={18} className="text-slate-600 hover:text-slate-900" />
            )}
          </button>

          {/* Search Toggle Button */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={`p-2 rounded-full transition-colors ${
              showSearch || searchQuery
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-sky-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Search captions and hashtags"
          >
            {showSearch ? <X size={19} /> : <Search size={19} />}
          </button>

          {/* Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-slate-800 hover:opacity-95"
            aria-label="User Profile"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      {/* Expandable Live Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 pt-1 animate-fade-in border-t border-slate-50 dark:border-slate-800/80">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captions or #hashtags..."
              autoFocus
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
