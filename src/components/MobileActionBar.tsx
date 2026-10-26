import React from 'react';
import { Download, Loader2 } from 'lucide-react';

interface MobileActionBarProps {
  onShare: () => void;
  onDownload: () => void;
  isExporting: boolean;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  onShare,
  onDownload,
  isExporting,
}) => {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-2xl border border-df-border/80 bg-df-bg/95 p-2 shadow-2xl backdrop-blur-lg lg:hidden">
      <button
        type="button"
        disabled={isExporting}
        onClick={onShare}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-df-yellow px-4 py-2.5 text-xs font-black uppercase tracking-wider text-df-ink shadow-md active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue cursor-pointer"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span aria-hidden="true">🚀</span>
        )}
        <span>Share Badge</span>
      </button>

      <button
        type="button"
        disabled={isExporting}
        onClick={onDownload}
        className="flex items-center gap-1.5 rounded-xl border border-df-border bg-df-bg-raised px-4 py-2.5 text-xs font-bold text-df-fg active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
      >
        <Download className="w-4 h-4 text-google-blue" />
        <span>Download</span>
      </button>
    </div>
  );
};
