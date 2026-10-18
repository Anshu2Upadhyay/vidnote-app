import React from 'react';
import { Home, Lightbulb, BarChart3, Settings, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  return (
    <div className="sticky bottom-0 z-40 bg-white border-t border-slate-100 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="relative flex items-center justify-around h-16 px-2">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'home' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home size={21} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        {/* Tab 2: Ideas */}
        <button
          onClick={() => setActiveTab('ideas')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'ideas' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Lightbulb size={21} strokeWidth={activeTab === 'ideas' ? 2.5 : 1.8} />
          <span className="text-[10px] mt-1">Ideas</span>
        </button>

        {/* Center Floating Action Button (FAB) */}
        <div className="relative flex items-center justify-center px-2">
          <button
            onClick={onOpenAddModal}
            aria-label="Add New Video"
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 -mt-6 border-4 border-[#F8FAFC] transition-transform duration-200"
          >
            <Plus size={28} strokeWidth={2.6} />
          </button>
        </div>

        {/* Tab 3: Stats */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'stats' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 size={21} strokeWidth={activeTab === 'stats' ? 2.5 : 1.8} />
          <span className="text-[10px] mt-1">Stats</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'settings' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings size={21} strokeWidth={activeTab === 'settings' ? 2.5 : 1.8} />
          <span className="text-[10px] mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
}
