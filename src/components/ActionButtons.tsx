import React, { useState } from 'react';
import { BadgeFormData, EventConfig } from '../types/badge';
import { copyToClipboard, getLinkedInShareUrl, getXShareUrl } from '../utils/share';
import { Download, Copy, Check, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  data: BadgeFormData;
  event: EventConfig;
  onShare: () => void;
  onDownload: () => void;
  isExporting: boolean;
  statusMessage: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  data,
  event,
  onShare,
  onDownload,
  isExporting,
  statusMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const caption = event.captionTemplate(data);

  const handleCopyCaption = async () => {
    const success = await copyToClipboard(caption);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const linkedInUrl = getLinkedInShareUrl(caption);
  const xUrl = getXShareUrl(caption);

  return (
    <div className="mt-6 border-t border-df-border/60 pt-5 space-y-4">
      {/* 1. Primary Big CTA: Share my badge */}
      <button
        type="button"
        disabled={isExporting}
        onClick={onShare}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-df-yellow px-5 py-3.5 text-sm font-black uppercase tracking-wider text-df-ink shadow-xl transition-all hover:scale-[1.015] active:scale-95 disabled:opacity-50 sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-blue cursor-pointer"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating High-Res Badge...</span>
          </>
        ) : (
          <>
            <span className="text-xl">🚀</span>
            <span>Share my badge</span>
          </>
        )}
      </button>

      {/* 2. Secondary Row: Download, LinkedIn, X */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={isExporting}
          onClick={onDownload}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-df-border bg-df-bg px-3 py-2.5 text-xs font-bold text-df-fg transition-all hover:border-df-fg/50 hover:bg-df-bg-raised active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
        >
          <Download className="w-3.5 h-3.5 text-google-blue" />
          <span>Download</span>
        </button>

        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-df-border bg-df-bg px-3 py-2.5 text-xs font-bold text-df-fg transition-all hover:border-df-fg/50 hover:bg-df-bg-raised active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
        >
          <span className="text-[#0a66c2] font-black">in</span>
          <span>LinkedIn</span>
        </a>

        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-df-border bg-df-bg px-3 py-2.5 text-xs font-bold text-df-fg transition-all hover:border-df-fg/50 hover:bg-df-bg-raised active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
        >
          <span className="font-black text-df-fg">𝕏</span>
          <span>Post</span>
        </a>
      </div>

      {/* 3. Live Feedback Status */}
      {statusMessage && (
        <p
          role="status"
          className="min-h-5 text-center text-xs font-bold text-google-green animate-fade-in"
        >
          {statusMessage}
        </p>
      )}

      {/* 4. Expandable Social Caption Preview */}
      <details className="group border-t border-df-border/40 pt-2">
        <summary className="cursor-pointer list-none rounded-md text-xs font-bold text-df-fg/70 hover:text-df-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue flex items-center gap-1 select-none py-1">
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
          <span>See caption to copy</span>
        </summary>

        <div className="mt-2 space-y-2">
          <p className="whitespace-pre-wrap rounded-xl border border-df-border/70 bg-df-bg p-3.5 text-xs leading-relaxed text-df-fg/80 font-mono">
            {caption}
          </p>
          <button
            type="button"
            onClick={handleCopyCaption}
            className="flex items-center justify-center gap-2 rounded-xl border border-df-border bg-df-bg hover:bg-df-bg-raised px-3.5 py-2 text-xs font-bold text-df-fg transition-all active:scale-95 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-google-green" />
                <span className="text-google-green">Caption Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-df-fg/60" />
                <span>Copy caption</span>
              </>
            )}
          </button>
        </div>
      </details>

      {/* 5. Ticket / Registration Callout */}
      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-df-yellow/30 bg-df-yellow/10 p-3.5 text-center sm:flex-row sm:text-left">
        <div>
          <div className="text-xs font-black text-df-fg">
            Haven’t registered for Study Jams yet?
          </div>
          <div className="text-[11px] text-df-fg/70">
            Registration & lab seats are open on GDG Community platform.
          </div>
        </div>
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-df-fg px-3.5 py-2 text-xs font-bold text-df-bg transition-colors hover:bg-google-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
        >
          <span>Register Now</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
