import React from 'react';

const CATEGORIES = ['All', 'Reels', 'YouTube', 'Ideas', 'Travel'];

export default function CategoryChips({ selectedCategory, onSelectCategory, counts = {} }) {
  return (
    <div className="py-2.5 px-4 bg-white/50 backdrop-blur-sm border-b border-slate-100">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = counts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 font-normal'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
