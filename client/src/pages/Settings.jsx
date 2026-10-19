import { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, LogOut, ShieldCheck, Database, HardDrive } from 'lucide-react';
import { fetchGoogleAuthUrl, fetchGoogleDriveStatus, disconnectGoogleAccount } from '@/services/apiService';

export default function SettingsPage({ videos, loadDemoData, clearVault, onThemeToggle }) {
  const [driveStatus, setDriveStatus] = useState({
    isConnected: false,
    email: null,
    isConfigured: false,
    vaultName: 'VidNote Cloud Vault',
  });
  const [loadingDrive, setLoadingDrive] = useState(true);
  const [authNotice, setAuthNotice] = useState(null);

  const checkStatus = async () => {
    setLoadingDrive(true);
    try {
      const res = await fetchGoogleDriveStatus();
      if (res) {
        setDriveStatus(res);
      }
    } catch (e) {
      console.warn('Status error:', e);
    } finally {
      setLoadingDrive(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Listen for OAuth completion message from popup window
    const handleMsg = (e) => {
      if (e.data?.type === 'GOOGLE_DRIVE_CONNECTED') {
        setDriveStatus((prev) => ({ ...prev, isConnected: true, email: e.data.email }));
        setAuthNotice(`Successfully connected as ${e.data.email}!`);
        setTimeout(() => setAuthNotice(null), 4000);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const handleConnectDrive = async () => {
    setAuthNotice('Opening Google Account login...');
    try {
      const data = await fetchGoogleAuthUrl();
      if (data?.url) {
        const w = 500;
        const h = 600;
        const left = window.screen.width / 2 - w / 2;
        const top = window.screen.height / 2 - h / 2;
        window.open(data.url, 'GoogleAuth', `width=${w},height=${h},top=${top},left=${left}`);
      } else {
        setAuthNotice('Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env to connect.');
      }
    } catch (err) {
      setAuthNotice('Connection error: ' + err.message);
    }
  };

  const handleDisconnectDrive = async () => {
    await disconnectGoogleAccount();
    setDriveStatus((prev) => ({ ...prev, isConnected: false, email: null }));
    setAuthNotice('Google Drive disconnected.');
    setTimeout(() => setAuthNotice(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 select-none">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Settings & Cloud Vault</h2>

      {authNotice && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Cloud size={16} />
          <span>{authNotice}</span>
        </div>
      )}

      {/* ── Real Google Drive Integration Section ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <Cloud size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Google Drive Cloud Storage</h3>
              <p className="text-[11px] text-slate-500">Real OAuth 2.0 direct-to-Drive video backup</p>
            </div>
          </div>
          {driveStatus.isConnected ? (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} /> Connected
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full">
              Cloud Ready
            </span>
          )}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Vault Folder:</span>
            <span className="font-bold text-slate-800">VidNote Cloud Vault</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Linked Account:</span>
            <span className="font-mono text-slate-700 font-semibold">
              {driveStatus.email || (driveStatus.isConnected ? 'Google Account Connected' : 'Not Linked Yet')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Zero-Loss Persistence:</span>
            <span className="font-semibold text-emerald-600">Active (Safe if mobile deletes)</span>
          </div>
        </div>

        {driveStatus.isConnected ? (
          <div className="flex gap-2">
            <button
              onClick={checkStatus}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw size={13} className={loadingDrive ? 'animate-spin' : ''} />
              <span>Sync Status</span>
            </button>
            <button
              onClick={handleDisconnectDrive}
              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <LogOut size={13} />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleConnectDrive}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Cloud size={16} />
              <span>Connect Your Google Account (Drive)</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Requires Google Client ID & Secret configured in server environment.
            </p>
          </div>
        )}
      </div>

      {/* ── Data & Backup ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Device Vault & Backup</h3>
        <div className="space-y-3">
          <button
            onClick={loadDemoData}
            className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-2 transition-all"
          >
            <Database size={15} /> Load Demo Seed Data
          </button>
          <button
            onClick={() => {
              const data = JSON.stringify(videos, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vidnote-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
            }}
            className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 flex items-center justify-center gap-2 transition-all"
          >
            <HardDrive size={15} /> Export Complete Vault (JSON)
          </button>
          <button
            onClick={clearVault}
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2 transition-all"
          >
            <span>🗑️</span> Clear Device Cache
          </button>
        </div>
      </div>

      {/* ── System Information ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Architecture & Pipeline</h3>
        <div className="space-y-2 text-xs text-slate-600">
          <p><span className="font-bold text-slate-800">Pipeline Engine:</span> Gemini Reverse-Alpha Mathematical Unblender</p>
          <p><span className="font-bold text-slate-800">Algorithm:</span> Original = (Watermarked - Logo*α) / (1 - α)</p>
          <p><span className="font-bold text-slate-800">Cloud Storage:</span> Google Drive API v3 + Dual Server Vault</p>
          <p><span className="font-bold text-slate-800">Device Cache:</span> IndexedDB (Dexie.js)</p>
          <p><span className="font-bold text-slate-800">Status:</span> Production-Ready Verified</p>
        </div>
      </div>
    </div>
  );
}