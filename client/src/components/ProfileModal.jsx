import React from 'react';
import { X, User, ShieldCheck } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, totalVideos }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Creator Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-4 ring-blue-50">
            <User size={32} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Creator Studio</h4>
            <p className="text-xs text-blue-600 font-medium">@vidnote_creator</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck size={11} />
              Vault Active • Offline-Ready
            </span>
          </div>
        </div>

        {/* Key Vault Stats */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Videos</span>
            <span className="text-lg font-extrabold text-slate-800">{totalVideos}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Storage Mode</span>
            <span className="text-sm font-bold text-blue-600">Dexie IndexedDB</span>
          </div>
        </div>

        {/* App details */}
        <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span>VidNote Mobile App</span>
            <span className="text-blue-600 font-mono">v1.0.0</span>
          </div>
          <p className="text-slate-500 text-[10px]">
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
