import { useState, useRef } from 'react';
import {
  X,
  Play,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  Sparkles,
  Wand2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { removeVideoWatermark, generateSmartAutofill } from '@/services/apiService';

const CATS = ['Reels', 'YouTube', 'Ideas', 'Travel'];

export default function AddVideoModal({ onSave, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [duration, setDuration] = useState('0:00');
  const [category, setCategory] = useState('Reels');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('#travel #video #vidnote');
  const [saving, setSaving] = useState(false);
  const [thumbUrl, setThumbUrl] = useState(null);

  // Watermark removal state
  const [isRemovingWatermark, setIsRemovingWatermark] = useState(false);
  const [watermarkRemoved, setWatermarkRemoved] = useState(false);

  // Social Metadata State
  const [showSocialSection, setShowSocialSection] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState('youtube');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // YouTube
  const [ytTitle, setYtTitle] = useState('');
  const [ytDescription, setYtDescription] = useState('');
  const [ytTags, setYtTags] = useState('');
  const [ytHashtags, setYtHashtags] = useState('');

  // Instagram
  const [igCaption, setIgCaption] = useState('');
  const [igHashtags, setIgHashtags] = useState('');

  // Facebook
  const [fbPostText, setFbPostText] = useState('');
  const [fbHashtags, setFbHashtags] = useState('');

  const [copiedKey, setCopiedKey] = useState(null);
  const inputRef = useRef(null);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const v = document.createElement('video');
    v.src = url;
    v.onloadedmetadata = () => {
      setDuration(fmt(v.duration));
      capThumb(v);
    };
  };

  const capThumb = (vid) => {
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 250;
    const ctx = c.getContext('2d');
    ctx.drawImage(vid, 0, 0, 400, 250);
    setThumbUrl(c.toDataURL('image/jpeg', 0.8));
  };

  const rem = () => {
    setFile(null);
    setPreview(null);
    setDuration('0:00');
    setThumbUrl(null);
    setWatermarkRemoved(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onHashtag = (e) => {
    let v = e.target.value.split(/[\s,]+/).filter(Boolean).map(w => w.startsWith('#') ? w : '#' + w).join(' ');
    setHashtags(v);
  };

  // Watermark removal action
  const handleRemoveWatermark = async () => {
    if (!preview || isRemovingWatermark) return;
    setIsRemovingWatermark(true);
    try {
      const res = await removeVideoWatermark({
        preview,
        thumbnailDataUrl: thumbUrl,
        caption,
      });
      if (res && res.cleanedVideoUrl) {
        setPreview(res.cleanedVideoUrl);
        setThumbUrl(res.cleanedVideoUrl);
        setWatermarkRemoved(true);
      }
    } catch (err) {
      console.error(err);
      alert('Watermark removal error: ' + err.message);
    } finally {
      setIsRemovingWatermark(false);
    }
  };

  // Contextual AI Smart Autofill trigger
  const handleSmartAutoFill = async () => {
    if (isAutoFilling) return;
    setIsAutoFilling(true);
    try {
      const tagsArray = hashtags.split(/[\s,]+/).filter(Boolean);
      const res = await generateSmartAutofill({
        title: caption,
        caption: caption,
        hashtags: tagsArray,
        category,
      });

      if (res && res.youtube) {
        setYtTitle(res.youtube.title || '');
        setYtDescription(res.youtube.description || '');
        setYtTags(res.youtube.tags || '');
        setYtHashtags(res.youtube.hashtags || '');
      }

      if (res && res.instagram) {
        setIgCaption(res.instagram.reelCaption || '');
        setIgHashtags(res.instagram.hashtags || '');
      }

      if (res && res.facebook) {
        setFbPostText(res.facebook.postText || '');
        setFbHashtags(res.facebook.hashtags || '');
      }

      setShowSocialSection(true);
    } catch (err) {
      console.error('Smart autofill error:', err);
      alert('Could not autofill: ' + err.message);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const notifyCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const save = () => {
    if (!file || !caption.trim() || saving) return;
    setSaving(true);

    const socialData = (ytTitle || igCaption || fbPostText) ? {
      youtube: {
        title: ytTitle,
        description: ytDescription,
        tags: ytTags,
        hashtags: ytHashtags,
      },
      instagram: {
        reelCaption: igCaption,
        hashtags: igHashtags,
      },
      facebook: {
        postText: fbPostText,
        hashtags: fbHashtags,
      },
    } : null;

    onSave({
      file,
      preview,
      duration,
      caption: caption.trim(),
      hashtags: hashtags.split(/\s+/).filter(Boolean),
      category,
      thumbnailDataUrl: thumbUrl || '',
      watermarkRemoved,
      ...(socialData ? { socialMetadata: socialData } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-slate-800 text-base">Add New Video Note</h2>
          <button
            onClick={save}
            disabled={!file || !caption.trim() || saving}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !file || !caption.trim() || saving
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save size={14} />}
            <span>Save</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* File Picker / Preview */}
          {!file ? (
            <div
              className="bg-blue-50/70 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition-all"
              onClick={() => inputRef.current.click()}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2.5 text-blue-600">
                <Camera size={26} />
              </div>
              <p className="font-bold text-blue-700 text-sm">Select Video from Gallery</p>
              <p className="text-[11px] text-blue-500 mt-0.5">Tap to choose a local video file</p>
              <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={pickFile} />
            </div>
          ) : (
            <div className="relative h-44 bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
              <video src={preview} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                <Play size={36} className="text-white bg-white/20 backdrop-blur rounded-full p-2" />
              </div>

              {/* Watermark badge / action on preview */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <button
                  onClick={handleRemoveWatermark}
                  disabled={isRemovingWatermark}
                  className="flex items-center gap-1 px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-full text-[10px] font-semibold shadow-md backdrop-blur active:scale-95 transition-all"
                >
                  {isRemovingWatermark ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Sparkles size={11} className="text-amber-300" />
                  )}
                  <span>✨ Remove Watermark (AI)</span>
                </button>
                {watermarkRemoved && (
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Cleaned
                  </span>
                )}
              </div>

              <button
                onClick={rem}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                {duration}
              </div>
            </div>
          )}

          {/* Category Chips */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <div className="flex gap-1.5">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === c
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Caption Input with Auto-Fill Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Title / Caption
              </label>
              {caption.trim().length > 0 && (
                <button
                  onClick={handleSmartAutoFill}
                  disabled={isAutoFilling}
                  className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-all"
                >
                  {isAutoFilling ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                  <span>🪄 Auto-Fill Social Metadata</span>
                </button>
              )}
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your title or caption here..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-0.5">
              <span>Used as core prompt for AI auto-fill</span>
              <span>{caption.length}/500</span>
            </div>
          </div>

          {/* Initial Hashtags with Auto-Fill Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Initial Hashtags
              </label>
              <button
                onClick={handleSmartAutoFill}
                disabled={isAutoFilling || !caption.trim()}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
              >
                {isAutoFilling ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                <span>Auto-Fill from tags</span>
              </button>
            </div>
            <input
              type="text"
              value={hashtags}
              onChange={onHashtag}
              placeholder="#travel #video #vidnote"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-blue-600 font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              maxLength={200}
            />
          </div>

          {/* Social Metadata Accordion / Section */}
          <div className="border border-purple-100 rounded-2xl overflow-hidden bg-gradient-to-b from-purple-50/40 to-white">
            <button
              onClick={() => setShowSocialSection(!showSocialSection)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-purple-50/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                  <Wand2 size={13} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Social Metadata (YouTube, IG, FB)
                  </span>
                  {(ytTitle || igCaption || fbPostText) && (
                    <span className="ml-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Generated
                    </span>
                  )}
                </div>
              </div>
              {showSocialSection ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {showSocialSection && (
              <div className="p-3 pt-0 border-t border-purple-50 space-y-3">
                {/* Platform Switcher */}
                <div className="flex gap-1 pt-2">
                  <button
                    onClick={() => setSocialPlatform('youtube')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      socialPlatform === 'youtube'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    YouTube
                  </button>
                  <button
                    onClick={() => setSocialPlatform('instagram')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      socialPlatform === 'instagram'
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => setSocialPlatform('facebook')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      socialPlatform === 'facebook'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Facebook
                  </button>
                </div>

                {/* YouTube */}
                {socialPlatform === 'youtube' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-slate-600">YouTube Title</label>
                        <button
                          onClick={() => notifyCopy(ytTitle, 'yt-title')}
                          className="text-[10px] text-red-600 hover:underline"
                        >
                          {copiedKey === 'yt-title' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ytTitle}
                        onChange={(e) => setYtTitle(e.target.value)}
                        placeholder="High-converting YouTube Title"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-slate-600">YouTube Description</label>
                        <button
                          onClick={() => notifyCopy(ytDescription, 'yt-desc')}
                          className="text-[10px] text-red-600 hover:underline"
                        >
                          {copiedKey === 'yt-desc' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        value={ytDescription}
                        onChange={(e) => setYtDescription(e.target.value)}
                        placeholder="Description with timestamps & CTAs"
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Tags</label>
                        <input
                          type="text"
                          value={ytTags}
                          onChange={(e) => setYtTags(e.target.value)}
                          placeholder="tag1, tag2..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hashtags</label>
                        <input
                          type="text"
                          value={ytHashtags}
                          onChange={(e) => setYtHashtags(e.target.value)}
                          placeholder="#Shorts #VidNote"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-red-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {socialPlatform === 'instagram' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-slate-600">Reel Caption</label>
                        <button
                          onClick={() => notifyCopy(igCaption, 'ig-cap')}
                          className="text-[10px] text-pink-600 hover:underline"
                        >
                          {copiedKey === 'ig-cap' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        value={igCaption}
                        onChange={(e) => setIgCaption(e.target.value)}
                        placeholder="Reel caption with emojis & hook"
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-slate-600">Hashtags</label>
                        <button
                          onClick={() => notifyCopy(igHashtags, 'ig-hash')}
                          className="text-[10px] text-pink-600 hover:underline"
                        >
                          {copiedKey === 'ig-hash' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        value={igHashtags}
                        onChange={(e) => setIgHashtags(e.target.value)}
                        placeholder="#reels #explorepage"
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-pink-600 outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Facebook */}
                {socialPlatform === 'facebook' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-slate-600">Post Text</label>
                        <button
                          onClick={() => notifyCopy(fbPostText, 'fb-text')}
                          className="text-[10px] text-blue-600 hover:underline"
                        >
                          {copiedKey === 'fb-text' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        value={fbPostText}
                        onChange={(e) => setFbPostText(e.target.value)}
                        placeholder="Community conversation post"
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] font-bold text-slate-600">Hashtags</label>
                        <button
                          onClick={() => notifyCopy(fbHashtags, 'fb-hash')}
                          className="text-[10px] text-blue-600 hover:underline"
                        >
                          {copiedKey === 'fb-hash' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={fbHashtags}
                        onChange={(e) => setFbHashtags(e.target.value)}
                        placeholder="#Community #VidNote"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-blue-600 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}