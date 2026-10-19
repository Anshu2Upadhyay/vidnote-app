export default function CategoryChips({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === cat
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}