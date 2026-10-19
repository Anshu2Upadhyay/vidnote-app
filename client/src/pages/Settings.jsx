export default function SettingsPage({ videos, loadDemoData, clearVault, onThemeToggle }) {
  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Settings</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Appearance</h3>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">Dark Mode</span>
          <button onClick={onThemeToggle} className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors">
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform"></span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Data & Backup</h3>
        <div className="space-y-3">
          <button onClick={loadDemoData} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-2">
            <span>📦</span> Load Demo Data
          </button>
          <button onClick={() => { const data = JSON.stringify(videos, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'vidnote-backup.json'; a.click(); }} className="w-full py-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100 hover:bg-green-100 flex items-center justify-center gap-2">
            <span>💾</span> Export Backup (JSON)
          </button>
          <button onClick={clearVault} className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2">
            <span>🗑️</span> Clear Local Vault
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">About</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-bold text-slate-800">App:</span> VidNote: Caption & Hashtag Saver</p>
          <p><span className="font-bold text-slate-800">Version:</span> 1.0.0</p>
          <p><span className="font-bold text-slate-800">Storage:</span> IndexedDB (Dexie.js) - Offline First</p>
        </div>
      </div>
    </div>
  );
}