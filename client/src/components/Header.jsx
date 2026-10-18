import React, { useState } from 'react';
import { Search, X, User, WifiOff, RefreshCw } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  isOnline,
  serverStatus,
  onSync,
  isSyncing,
  onOpenProfile,
}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand Logo & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-[#1E293B]">Vid</span>
              <span className="text-[#0EA5E9]">Note</span>
            </h1>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                isOnline
                  ? serverStatus?.serverConnected
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
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
          <span className="text-[11px] font-medium text-slate-500 -mt-0.5">
            Caption & Hashtag Saver
          </span>
        </div>

        {/* Right Actions: Search & Profile */}
        <div className="flex items-center gap-2">
          {/* Quick sync icon if server connected */}
          {serverStatus?.serverConnected && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Sync with cloud"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin text-blue-600' : ''} />
            </button>
          )}

          {/* Search Toggle Button */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={`p-2 rounded-full transition-colors ${
              showSearch || searchQuery
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Search captions and hashtags"
          >
            {showSearch ? <X size={19} /> : <Search size={19} />}
          </button>

          {/* Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white hover:opacity-95"
            aria-label="User Profile"
          >
            <User size={18} />
          </button>
        </div>
      </div>

      {/* Expandable Live Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 pt-1 animate-fade-in border-t border-slate-50">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captions or #hashtags..."
              autoFocus
              className="w-full bg-slate-100 text-slate-800 text-xs pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
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
