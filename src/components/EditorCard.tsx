import React, { useState, useRef } from 'react';
import { BadgeFormData, EventConfig, OutputFormat, AttendeeKind } from '../types/badge';
import { fetchGithubAvatar } from '../utils/github';
import { ActionButtons } from './ActionButtons';
import { Camera, Sliders, Trash2, ChevronDown, Check, Loader2 } from 'lucide-react';

interface EditorCardProps {
  data: BadgeFormData;
  event: EventConfig;
  onChange: (updated: Partial<BadgeFormData>) => void;
  onOpenPhotoAdjust: () => void;
  onShare: () => void;
  onDownload: () => void;
  isExporting: boolean;
  statusMessage: string;
}

export const EditorCard: React.FC<EditorCardProps> = ({
  data,
  event,
  onChange,
  onOpenPhotoAdjust,
  onShare,
  onDownload,
  isExporting,
  statusMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [githubUser, setGithubUser] = useState(data.githubUsername || '');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15 MB. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onChange({
          photoUrl: event.target.result,
          photoFit: { zoom: 1, fx: 0.5, fy: 0.5 },
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-uploaded if desired
    e.target.value = '';
  };

  // GitHub avatar fetcher
  const handleFetchGithub = async () => {
    if (!githubUser.trim()) return;
    setGithubLoading(true);
    setGithubError(null);

    try {
      const res = await fetchGithubAvatar(githubUser);
      onChange({
        photoUrl: res.avatarUrl,
        fullName: data.fullName ? data.fullName : (res.name || githubUser),
        githubUsername: githubUser.trim(),
        photoFit: { zoom: 1, fx: 0.5, fy: 0.5 },
      });
    } catch (err: any) {
      setGithubError(err.message || 'Failed to fetch avatar');
    } finally {
      setGithubLoading(false);
    }
  };

  // Sticker toggle (up to 3)
  const toggleSticker = (stickerId: string) => {
    const current = [...data.stickers];
    const index = current.indexOf(stickerId);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      if (current.length >= 3) {
        // Shift oldest out to keep max 3
        current.shift();
      }
      current.push(stickerId);
    }
    onChange({ stickers: current });
  };

  return (
    <div className="min-w-0 rounded-2xl border border-df-border bg-df-bg-raised p-4 shadow-xl sm:rounded-3xl sm:p-7">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        aria-label="Upload photo"
        className="hidden"
        onChange={handleFileChange}
      />

      <h2 className="text-xl font-black text-df-fg sm:text-2xl">
        Make it yours
      </h2>

      <div className="mt-5 space-y-5">
        {/* 1. Photo Upload Row */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload your photo"
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-google-blue/40 bg-google-blue/5 text-xl flex items-center justify-center transition-all hover:border-google-blue hover:bg-google-blue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
          >
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt="Selected avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="w-6 h-6 text-google-blue group-hover:scale-110 transition-transform" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-df-fg px-4 py-2 text-xs font-black uppercase tracking-wider text-df-bg shadow-sm transition-transform active:scale-95 hover:bg-df-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
              >
                {data.photoUrl ? 'Change photo' : 'Upload photo'}
              </button>

              {data.photoUrl && (
                <>
                  <button
                    type="button"
                    onClick={onOpenPhotoAdjust}
                    className="flex items-center gap-1 rounded-xl border border-df-border bg-df-bg px-3 py-2 text-xs font-bold text-df-fg hover:border-df-fg/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Crop & Zoom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange({ photoUrl: null })}
                    className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
            <div className="mt-1 text-[11px] text-df-fg/60">
              Supports JPG, PNG, WebP (processed locally)
            </div>
          </div>
        </div>

        {/* 2. Full Name Input */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="full-name"
              className="block text-xs font-bold uppercase tracking-wider text-df-fg/70"
            >
              Your name
            </label>
            <span className="text-[10px] font-mono text-df-fg/40">
              {data.fullName.length}/40
            </span>
          </div>
          <input
            id="full-name"
            type="text"
            maxLength={40}
            placeholder="e.g. Priya Sharma"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-df-border bg-df-bg px-3.5 py-2.5 text-base font-bold text-df-fg shadow-xs outline-none transition-all focus:border-google-blue focus-visible:ring-2 focus-visible:ring-google-blue"
          />
        </div>

        {/* 3. Theme Selector */}
        <div>
          <span
            id="theme-label"
            className="block text-xs font-bold uppercase tracking-wider text-df-fg/70"
          >
            Theme
          </span>
          <div
            role="radiogroup"
            aria-labelledby="theme-label"
            className="mt-2 flex flex-wrap gap-2"
          >
            {event.themes.map((theme) => {
              const isSelected = data.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onChange({ themeId: theme.id })}
                  title={theme.description}
                  className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-xs font-black transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue ${
                    isSelected
                      ? 'border-df-fg bg-df-fg text-df-bg shadow-sm'
                      : 'border-df-border bg-df-bg text-df-fg hover:border-df-fg/40'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 rounded-full border border-black/15 shadow-inner"
                    style={{ background: theme.swatchGradient }}
                  />
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Expandable Accordion: More Options */}
        <details className="group rounded-2xl border border-df-border bg-df-bg overflow-hidden" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3.5 text-xs font-black uppercase tracking-wider text-df-fg hover:bg-df-bg-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue">
            <span>
              More options
              <span className="ml-1.5 font-normal normal-case tracking-normal text-df-fg/60">
                @handle, size, role, stickers
              </span>
            </span>
            <ChevronDown className="w-4 h-4 text-df-fg/50 transition-transform group-open:rotate-180" />
          </summary>

          <div className="space-y-4 p-3.5 pt-1 border-t border-df-border/50">
            {/* GitHub Avatar Fetcher */}
            <div>
              <label htmlFor="github-handle" className="block text-[11px] font-bold uppercase tracking-wider text-df-fg/70 mb-1">
                GitHub Photo Fetcher
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-df-fg/40 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <input
                    id="github-handle"
                    type="text"
                    placeholder="or enter GitHub username"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFetchGithub();
                      }
                    }}
                    className="w-full rounded-lg border border-df-border bg-df-bg-raised pl-8 pr-2.5 py-1.5 text-xs font-bold text-df-fg outline-none focus:border-google-blue focus-visible:ring-2 focus-visible:ring-google-blue"
                  />
                </div>
                <button
                  type="button"
                  disabled={githubLoading || !githubUser.trim()}
                  onClick={handleFetchGithub}
                  className="flex items-center gap-1 shrink-0 rounded-lg border border-df-border bg-df-bg-raised px-3 py-1.5 text-xs font-bold text-df-fg hover:border-df-fg disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
                >
                  {githubLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Fetch</span>
                  )}
                </button>
              </div>
              {githubError && (
                <p className="mt-1 text-[11px] font-semibold text-google-red">
                  {githubError}
                </p>
              )}
            </div>

            {/* Attendee Kind & Social Handle Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
              <div>
                <label
                  htmlFor="badge-kind"
                  className="block text-xs font-bold uppercase tracking-wider text-df-fg/70"
                >
                  I’m
                </label>
                <select
                  id="badge-kind"
                  value={data.kind}
                  onChange={(e) => onChange({ kind: e.target.value as AttendeeKind })}
                  className="mt-1.5 w-full rounded-xl border border-df-border bg-df-bg-raised px-3 py-2 text-sm font-bold text-df-fg shadow-xs outline-none transition-all focus:border-google-blue focus-visible:ring-2 focus-visible:ring-google-blue sm:w-auto"
                >
                  <option value="attendee">attending</option>
                  <option value="speaker">speaking</option>
                  <option value="volunteer">volunteering</option>
                  <option value="facilitator">facilitating</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="handle"
                  className="block text-xs font-bold uppercase tracking-wider text-df-fg/70"
                >
                  Your @handle
                </label>
                <input
                  id="handle"
                  type="text"
                  maxLength={30}
                  placeholder="@handle (Instagram, X, LinkedIn)"
                  value={data.handle}
                  onChange={(e) => onChange({ handle: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-df-border bg-df-bg-raised px-3 py-2 text-sm font-bold text-df-fg shadow-xs outline-none transition-all focus:border-google-blue focus-visible:ring-2 focus-visible:ring-google-blue"
                />
              </div>
            </div>

            {/* Layout Toggle (Creator vs Ticket) */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-df-fg/70">
                Layout
              </span>
              <div
                role="radiogroup"
                aria-label="Layout"
                className="mt-1.5 flex gap-1 rounded-xl border border-df-border bg-df-bg-raised p-1"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={data.layout === 'creator'}
                  onClick={() => onChange({ layout: 'creator' })}
                  className={`flex-1 rounded-lg px-2.5 py-1.5 text-left text-xs font-black transition-all ${
                    data.layout === 'creator'
                      ? 'bg-df-fg text-df-bg shadow-xs'
                      : 'text-df-fg/70 hover:text-df-fg'
                  }`}
                >
                  Creator
                  <span className="block text-[10px] font-normal opacity-70">
                    big photo + @handle
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={data.layout === 'ticket'}
                  onClick={() => onChange({ layout: 'ticket' })}
                  className={`flex-1 rounded-lg px-2.5 py-1.5 text-left text-xs font-black transition-all ${
                    data.layout === 'ticket'
                      ? 'bg-df-fg text-df-bg shadow-xs'
                      : 'text-df-fg/70 hover:text-df-fg'
                  }`}
                >
                  Ticket
                  <span className="block text-[10px] font-normal opacity-70">
                    event pass with QR
                  </span>
                </button>
              </div>
            </div>

            {/* Size / Format Switcher */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-df-fg/70">
                Size & Format
              </span>
              <div
                role="radiogroup"
                aria-label="Size"
                className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl border border-df-border bg-df-bg-raised p-1 sm:grid-cols-4"
              >
                {[
                  { id: 'portrait', label: 'Post', desc: 'LinkedIn / IG (4:5)' },
                  { id: 'story', label: 'Story', desc: 'Reels / Status (9:16)' },
                  { id: 'square', label: 'Square', desc: 'Feed Post (1:1)' },
                  { id: 'landscape', label: 'Wide', desc: 'X Post (16:9)' },
                ].map((fmt) => {
                  const isSelected = data.format === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onChange({ format: fmt.id as OutputFormat })}
                      className={`rounded-lg px-2 py-1.5 text-left text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-df-fg text-df-bg shadow-xs'
                          : 'text-df-fg/70 hover:text-df-fg'
                      }`}
                    >
                      {fmt.label}
                      <span className="block text-[10px] font-normal opacity-70">
                        {fmt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role & Track Dropdowns */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="role-select"
                  className="block text-xs font-bold uppercase tracking-wider text-df-fg/70"
                >
                  Role / Identity
                </label>
                <select
                  id="role-select"
                  value={data.role}
                  onChange={(e) => onChange({ role: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-df-border bg-df-bg-raised px-3 py-2 text-sm font-bold text-df-fg shadow-xs outline-none transition-all focus:border-google-blue focus-visible:ring-2 focus-visible:ring-google-blue"
                >
                  {event.roles.map((r) => (
                    <option key={r.id} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="track-select"
                  className="block text-xs font-bold uppercase tracking-wider text-df-fg/70"
                >
                  Favorite track
                </label>
                <select
                  id="track-select"
                  value={data.trackId}
                  onChange={(e) => onChange({ trackId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-df-border bg-df-bg-raised px-3 py-2 text-sm font-bold text-df-fg shadow-xs outline-none transition-all focus:border-google-blue focus-visible:ring-2 focus-visible:ring-google-blue"
                >
                  {event.tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stickers Selection */}
            <div>
              <div className="flex items-center justify-between">
                <span
                  id="stickers-label"
                  className="block text-xs font-bold uppercase tracking-wider text-df-fg/70"
                >
                  Stickers
                </span>
                <span className="text-[11px] font-bold text-df-fg/50">
                  ({data.stickers.length} of 3 selected)
                </span>
              </div>
              <div
                role="group"
                aria-labelledby="stickers-label"
                className="mt-2 flex flex-wrap gap-1.5"
              >
                {event.stickers.map((s) => {
                  const isChecked = data.stickers.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={isChecked}
                      onClick={() => toggleSticker(s.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all active:scale-95 ${
                        isChecked
                          ? 'border-google-blue bg-google-blue text-white shadow-xs'
                          : 'border-df-border bg-df-bg-raised text-df-fg hover:border-df-fg/40'
                      }`}
                    >
                      <span aria-hidden="true">{s.emoji}</span>
                      <span>{s.label}</span>
                      {isChecked && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Action Buttons Section */}
      <ActionButtons
        data={data}
        event={event}
        onShare={onShare}
        onDownload={onDownload}
        isExporting={isExporting}
        statusMessage={statusMessage}
      />
    </div>
  );
};
