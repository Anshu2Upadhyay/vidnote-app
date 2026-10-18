import React from 'react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';

export default function EmptyState({ onOpenAdd, onLoadSamples, isLoadingSamples }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in my-auto min-h-[460px]">
      {/* 3D-Style Vector/SVG Illustration of Open Blue Vault / Safe */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center drop-shadow-xl">
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="vaultOuter" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="vaultInner" x1="40" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" stopOpacity="0.25" />
              <stop offset="1" stopColor="#2563EB" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="doorGrad" x1="10" y1="30" x2="160" y2="210" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="0.6" stopColor="#2563EB" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="goldHinge" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#FDE047" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shadow beneath vault */}
          <ellipse cx="120" cy="216" rx="90" ry="14" fill="#0F172A" fillOpacity="0.12" />

          {/* Vault Outer Chassis */}
          <rect x="36" y="38" width="168" height="164" rx="28" fill="url(#vaultOuter)" stroke="#334155" strokeWidth="4" />

          {/* Vault Interior Chamber (Recessed & Glowing Blue) */}
          <rect x="52" y="54" width="136" height="132" rx="18" fill="#090E17" />
          <rect x="54" y="56" width="132" height="128" rx="16" fill="url(#vaultInner)" />

          {/* Glowing interior rays */}
          <circle cx="120" cy="115" r="45" fill="#38BDF8" fillOpacity="0.25" filter="url(#glowLight)" />

          {/* Content Inside Vault: Floating Video Frame */}
          <g transform="translate(68, 64) rotate(-6)">
            {/* Film frame */}
            <rect width="66" height="48" rx="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
            {/* Film sprockets top & bottom */}
            <rect x="4" y="3" width="6" height="4" rx="1" fill="#0284C7" />
            <rect x="16" y="3" width="6" height="4" rx="1" fill="#0284C7" />
            <rect x="28" y="3" width="6" height="4" rx="1" fill="#0284C7" />
            <rect x="40" y="3" width="6" height="4" rx="1" fill="#0284C7" />
            <rect x="52" y="3" width="6" height="4" rx="1" fill="#0284C7" />
            {/* Center screen with play triangle */}
            <rect x="8" y="10" width="50" height="30" rx="4" fill="#E0F2FE" />
            <polygon points="30,20 40,25 30,30" fill="#0284C7" />
          </g>

          {/* Content Inside Vault: Notepad with Hashtags & Notes */}
          <g transform="translate(108, 88) rotate(8)">
            <rect width="56" height="70" rx="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
            {/* Notepad header clip */}
            <rect x="18" y="-4" width="20" height="8" rx="3" fill="#2563EB" />
            {/* Text lines */}
            <rect x="10" y="14" width="36" height="4" rx="2" fill="#3B82F6" />
            <rect x="10" y="24" width="32" height="3" rx="1.5" fill="#94A3B8" />
            <rect x="10" y="32" width="26" height="3" rx="1.5" fill="#94A3B8" />
            {/* Hashtag pills representation */}
            <rect x="10" y="42" width="16" height="5" rx="2" fill="#DBEAFE" />
            <rect x="29" y="42" width="18" height="5" rx="2" fill="#DBEAFE" />
            <rect x="10" y="52" width="24" height="5" rx="2" fill="#DBEAFE" />
          </g>

          {/* Vault Door Swung Open to the Left (Perspective 3D angle) */}
          <path
            d="M 40 44 L 16 60 L 16 182 L 40 198 Z"
            fill="#1D4ED8"
            stroke="#1E3A8A"
            strokeWidth="3"
          />
          <path
            d="M 40 44 L 20 62 L 20 180 L 40 198 Z"
            fill="url(#doorGrad)"
          />

          {/* Circular Combination Lock Wheel on Door */}
          <ellipse cx="28" cy="120" rx="9" ry="18" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="28" cy="120" rx="4" ry="8" fill="#D97706" />

          {/* Metallic Hinges */}
          <rect x="36" y="60" width="8" height="18" rx="3" fill="url(#goldHinge)" />
          <rect x="36" y="162" width="8" height="18" rx="3" fill="url(#goldHinge)" />

          {/* Sparkling Stars around Vault */}
          <g fill="#FBBF24">
            <path d="M 205 60 Q 205 70 215 70 Q 205 70 205 80 Q 205 70 195 70 Q 205 70 205 60 Z" />
            <path d="M 28 35 Q 28 42 35 42 Q 28 42 28 49 Q 28 42 21 42 Q 28 42 28 35 Z" />
          </g>
        </svg>
      </div>

      {/* Heading */}
      <h2 className="text-xl font-bold text-slate-800 mt-4 tracking-tight">
        Your vault is empty.
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-slate-500 text-center px-8 mt-1 leading-relaxed">
        Tap + to add your first video and caption!
      </p>

      {/* Primary Action Button */}
      <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onOpenAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3 px-5 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add New Video</span>
        </button>

        {/* Subtle "Load Sample Videos" Button */}
        <button
          onClick={onLoadSamples}
          disabled={isLoadingSamples}
          className="w-full bg-white hover:bg-slate-50 active:scale-95 text-slate-600 hover:text-blue-600 border border-slate-200/90 font-medium py-2.5 px-4 rounded-2xl shadow-xs flex items-center justify-center gap-2 text-xs transition-colors"
        >
          {isLoadingSamples ? (
            <>
              <Loader2 size={15} className="animate-spin text-blue-600" />
              <span>Generating Demo Vault...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-amber-500" />
              <span>Load Sample Videos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
