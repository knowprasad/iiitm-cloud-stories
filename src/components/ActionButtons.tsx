import React, { useState } from 'react';
import { BadgeFormData, EventConfig } from '../types/badge';
import { copyToClipboard, getLinkedInShareUrl, getXShareUrl } from '../utils/share';
import { Download, Copy, Check, ChevronRight, ExternalLink, Loader2, Sparkles } from 'lucide-react';

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
    <div className="mt-6 border-t border-white/10 pt-5 space-y-4">
      {/* 1. Primary Big Hyper-Glow CTA */}
      <button
        type="button"
        disabled={isExporting}
        onClick={onShare}
        className="relative group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FBBC04] via-[#FFD27A] to-[#FBBC04] px-6 py-4 text-sm font-black uppercase tracking-wider text-black shadow-[0_0_35px_rgba(251,188,4,0.4)] transition-all hover:scale-[1.015] active:scale-95 disabled:opacity-50 sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBC04] cursor-pointer"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-black" />
            <span>Rendering High-Res Master...</span>
          </>
        ) : (
          <>
            <span className="text-xl">🚀</span>
            <span>Mint & Share Badge</span>
            <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
          </>
        )}
      </button>

      {/* 2. Secondary Row: Download, LinkedIn, X */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          disabled={isExporting}
          onClick={onDownload}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-white/30 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#4285F4]" />
          <span>Download</span>
        </button>

        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-white/30 active:scale-95 cursor-pointer"
        >
          <span className="text-[#0a66c2] font-black">in</span>
          <span>LinkedIn</span>
        </a>

        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 hover:border-white/30 active:scale-95 cursor-pointer"
        >
          <span className="font-black text-white">𝕏</span>
          <span>Post</span>
        </a>
      </div>

      {/* 3. Live Feedback Status */}
      {statusMessage && (
        <p
          role="status"
          className="min-h-5 text-center text-xs font-mono font-bold text-[#34A853] animate-fade-in"
        >
          {statusMessage}
        </p>
      )}

      {/* 4. Expandable Social Caption Preview */}
      <details className="group border-t border-white/10 pt-2">
        <summary className="cursor-pointer list-none rounded-md text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 select-none py-1.5">
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
          <span>Verified Social Caption</span>
        </summary>

        <div className="mt-2.5 space-y-2.5">
          <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/50 p-4 text-xs leading-relaxed text-slate-300 font-mono">
            {caption}
          </p>
          <button
            type="button"
            onClick={handleCopyCaption}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-mono font-bold text-white transition-all active:scale-95 w-full cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#34A853]" />
                <span className="text-[#34A853]">CAPTION COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>COPY FORMATTED CAPTION</span>
              </>
            )}
          </button>
        </div>
      </details>

      {/* 5. Ticket / Registration Callout */}
      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#FBBC04]/20 bg-[#FBBC04]/5 p-4 text-center sm:flex-row sm:text-left">
        <div>
          <div className="text-xs font-mono font-black text-white">
            NOT REGISTERED FOR STUDY JAMS YET?
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Claim official Qwiklabs credits & community access pass.
          </div>
        </div>
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-[#4285F4] hover:text-white transition-all shadow-sm cursor-pointer"
        >
          <span>Claim Pass</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
