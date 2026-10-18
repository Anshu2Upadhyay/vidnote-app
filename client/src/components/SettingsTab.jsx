import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Cloud,
  CloudOff,
  RefreshCw,
  Sparkles,
  Download,
  Trash2,
  Loader2,
  Smartphone,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../services/db';

export default function SettingsTab({
  isOnline: _isOnline,
  serverStatus,
  onSync,
  isSyncing,
  onLoadSamples,
  isLoadingSamples,
  onClearAllData,
  videoCount,
  isDarkMode = false,
  onToggleDarkMode,
}) {
  const [storageEstimate, setStorageEstimate] = useState({ usedMB: '0.0', quotaMB: '0' });

  // Read actual browser IndexedDB storage quota
  useEffect(() => {
    async function checkStorage() {
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
          const quotaMB = ((estimate.quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
          setStorageEstimate({ usedMB, quotaMB: quotaMB + ' GB' });
        } catch (_e) {
          console.warn(_e);
        }
      }
    }
    checkStorage();
  }, [videoCount]);

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const allVideos = await db.videos.toArray();
      const allGroups = await db.savedTagGroups.toArray();

      // Clean reference-only JSON export (zero heavy blobs)
      const backupData = {
        app: 'VidNote',
        version: '2.0.0',
        architecture: 'zero-duplicate-references',
        exportedAt: new Date().toISOString(),
        videos: allVideos.map((v) => ({
          id: v.id || v.localId,
          localId: v.id || v.localId,
          title: v.title || v.videoName || 'Video Draft',
          videoUri: v.videoUri || '',
          caption: v.caption,
          hashtags: v.hashtags,
          category: v.category,
          duration: v.duration,
          durationFormatted: v.durationFormatted,
          thumbnail: v.thumbnail,
          status: v.status || (v.isPosted ? 'Posted' : 'Draft'),
          isPosted: v.status === 'Posted' || v.isPosted,
          createdAt: v.createdAt || v.clientCreatedAt,
        })),
        hashtagGroups: allGroups,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `vidnote_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Backup exported successfully! 📦');
    } catch (_e) {
      console.warn(_e);
      toast.error('Failed to export backup');
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar animate-fade-in transition-colors">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Settings & Vault</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage device storage, dark theme, and cloud synchronization</p>
      </div>

      {/* 0. Appearance & Theme Settings (Persistent Dark Mode) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center transition-colors">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">Dark Mode Appearance</h3>
              <p className="text-[10px] text-slate-400">
                {isDarkMode ? 'Dark theme active (Saved persistently)' : 'Light theme active'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={onToggleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
              isDarkMode ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform flex items-center justify-center">
              {isDarkMode ? <Moon size={10} className="text-blue-600" /> : <Sun size={10} className="text-amber-500" />}
            </div>
          </button>
        </div>
      </div>

      {/* 1. Device Storage Quota Inspector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 flex items-center justify-center transition-colors">
            <HardDrive size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">IndexedDB Device Storage</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck size={12} />
              100% Offline-First Enabled
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 transition-colors">
            <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">STORAGE USED</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{storageEstimate.usedMB} MB</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 transition-colors">
            <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold">VIDEOS IN VAULT</span>
            <span className="text-sm font-bold text-blue-600 dark:text-sky-400">{videoCount} Files</span>
          </div>
        </div>
      </div>

      {/* 2. MERN Backend Sync Control */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              serverStatus?.serverConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {serverStatus?.serverConnected ? <Cloud size={18} /> : <CloudOff size={18} />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">Node.js + MongoDB Sync</h3>
              <p className="text-[10px] text-slate-400">
                {serverStatus?.serverConnected
                  ? `Backend connected (${serverStatus.dbStatus})`
                  : 'Backend offline (local vault active)'}
              </p>
            </div>
          </div>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* 3. Demo Data Loader */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              <span>Showcase Demo Videos</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Populate Mountain View, Golden Retriever, Sunset, & Coffee Cup demo items.
            </p>
          </div>
        </div>

        <button
          onClick={onLoadSamples}
          disabled={isLoadingSamples}
          className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-98 text-blue-600 dark:text-sky-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-blue-100 dark:border-blue-900/40"
        >
          {isLoadingSamples ? (
            <>
              <Loader2 size={15} className="animate-spin text-blue-600 dark:text-sky-400" />
              <span>Generating Demo Clips...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Load 4 Showcase Demo Videos</span>
            </>
          )}
        </button>
      </div>

      {/* 4. Backup & Data Maintenance */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2.5 transition-colors">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Backup & Data Maintenance
        </h3>

        <div className="flex flex-col gap-2">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-between transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <span className="flex items-center gap-2">
              <Download size={15} className="text-blue-600 dark:text-sky-400" />
              <span>Export Backup (JSON)</span>
            </span>
            <span className="text-[10px] text-slate-400">Portable</span>
          </button>

          {/* Clear All Data */}
          <button
            onClick={onClearAllData}
            className="w-full py-2.5 px-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-98 text-red-600 dark:text-red-400 font-semibold text-xs rounded-xl flex items-center justify-between transition-colors border border-red-100 dark:border-red-900/40"
          >
            <span className="flex items-center gap-2">
              <Trash2 size={15} className="text-red-500" />
              <span>Clear All Data</span>
            </span>
            <span className="text-[10px] text-red-400">Reset Vault</span>
          </button>
        </div>
      </div>

      {/* 5. Mobile & PWA info */}
      <div className="bg-slate-100/70 dark:bg-slate-800/50 p-4 rounded-2xl text-center space-y-1 transition-colors">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Smartphone size={15} />
          <span>VidNote PWA & APK Ready</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Package ID: <code className="text-blue-600 dark:text-sky-400 font-mono">com.vidnote.app</code> • Built for Android APK export via Capacitor
        </p>
      </div>
    </div>
  );
}
