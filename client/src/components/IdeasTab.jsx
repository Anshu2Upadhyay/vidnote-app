import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Hash,
  Plus,
  Copy,
  Trash2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../services/db';
import VideoCard from './VideoCard';

export default function IdeasTab({
  videos,
  onOpenPlayer,
  onTogglePosted,
  onDeleteVideo,
  onOpenAddModal,
}) {
  const [tagGroups, setTagGroups] = useState([]);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupTags, setGroupTags] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Filter videos that belong to Ideas category
  const ideaVideos = videos.filter((v) => v.category === 'Ideas');

  // Load tag groups from Dexie
  const loadTagGroups = async () => {
    try {
      const groups = await db.savedTagGroups.toArray();
      setTagGroups(groups);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTagGroups();
  }, []);

  // Save new tag group
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!groupTitle.trim() || !groupTags.trim()) {
      toast.error('Please enter both title and tags');
      return;
    }

    // Format tags
    const formatted = groupTags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .join(' ');

    const newGroup = {
      id: 'grp_' + Date.now(),
      title: groupTitle.trim(),
      tags: formatted,
      createdAt: Date.now(),
    };

    await db.savedTagGroups.put(newGroup);
    setGroupTitle('');
    setGroupTags('');
    setIsAddingGroup(false);
    toast.success('Hashtag group saved to vault! 🏷️');
    loadTagGroups();
  };

  const handleDeleteGroup = async (id) => {
    await db.savedTagGroups.delete(id);
    toast.success('Hashtag group deleted');
    loadTagGroups();
  };

  const handleCopyGroup = (group) => {
    navigator.clipboard.writeText(group.tags).then(() => {
      setCopiedId(group.id);
      toast.success(`Copied "${group.title}" tags! 📋`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto no-scrollbar animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Lightbulb size={18} />
          </div>
          <h2 className="text-lg font-bold">Ideas & Tag Vault</h2>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          Store reusable hashtag bundles for your niche and organize video concept drafts before recording.
        </p>
      </div>

      {/* 1. Saved Hashtag Groups Manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Hash size={17} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Hashtag Vault Bundles</h3>
          </div>
          <button
            onClick={() => setIsAddingGroup(!isAddingGroup)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl flex items-center gap-1 active:scale-95"
          >
            <Plus size={14} />
            <span>New Bundle</span>
          </button>
        </div>

        {/* Create Group Form */}
        {isAddingGroup && (
          <form onSubmit={handleSaveGroup} className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700">Create Reusable Hashtag Group</h4>
            <input
              type="text"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              placeholder="e.g. Daily Tech Vlog, Fitness Workout"
              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={groupTags}
              onChange={(e) => setGroupTags(e.target.value)}
              rows={2}
              placeholder="#tech #apple #gadgets #developer"
              className="w-full bg-slate-50 border border-slate-200 text-xs text-blue-600 font-medium px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingGroup(false)}
                className="px-3 py-1.5 text-xs text-slate-500 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95"
              >
                Save Group
              </button>
            </div>
          </form>
        )}

        {/* Hashtag Groups Cards */}
        <div className="space-y-2.5">
          {tagGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-100 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">{group.title}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyGroup(group)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors active:scale-90"
                    title="Copy all tags"
                  >
                    {copiedId === group.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-90"
                    title="Delete group"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-blue-600 font-medium line-clamp-2 leading-relaxed">
                {group.tags}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Draft Video Concepts in Ideas Category */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lightbulb size={17} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">
              Idea Drafts ({ideaVideos.length})
            </h3>
          </div>
          <button
            onClick={onOpenAddModal}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add Idea</span>
          </button>
        </div>

        {ideaVideos.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No video notes categorized under "Ideas" yet. Add one with the + button!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ideaVideos.map((video) => (
              <VideoCard
                key={video.localId}
                video={video}
                onOpenPlayer={onOpenPlayer}
                onTogglePosted={onTogglePosted}
                onDelete={onDeleteVideo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
