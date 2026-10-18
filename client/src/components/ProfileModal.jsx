import { X, User, ShieldCheck } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, totalVideos }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-slide-up transition-colors border-t sm:border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Creator Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-4 ring-blue-50 dark:ring-slate-800">
            <User size={32} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Creator Studio</h4>
            <p className="text-xs text-blue-600 dark:text-sky-400 font-medium">@vidnote_creator</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck size={11} />
              Vault Active • Offline-Ready
            </span>
          </div>
        </div>

        {/* Key Vault Stats */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-center transition-colors">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Videos</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{totalVideos}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-center transition-colors">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Storage Mode</span>
            <span className="text-sm font-bold text-blue-600 dark:text-sky-400">Zero-Duplicate Ref</span>
          </div>
        </div>

        {/* App details */}
        <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 transition-colors">
          <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200">
            <span>VidNote Mobile App</span>
            <span className="text-blue-600 dark:text-sky-400 font-mono">v2.0.0</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px]">
            Designed for mobile viewport, PWA installation, and Capacitor Android compilation.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
