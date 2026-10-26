import React from 'react';
import { PhotoFit } from '../types/badge';
import { X, ZoomIn, RotateCcw, Move, Check } from 'lucide-react';

interface PhotoAdjustModalProps {
  isOpen: boolean;
  photoUrl: string | null;
  photoFit: PhotoFit;
  onChangeFit: (fit: PhotoFit) => void;
  onClose: () => void;
}

export const PhotoAdjustModal: React.FC<PhotoAdjustModalProps> = ({
  isOpen,
  photoUrl,
  photoFit,
  onChangeFit,
  onClose,
}) => {
  if (!isOpen || !photoUrl) return null;

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFit({
      ...photoFit,
      zoom: parseFloat(e.target.value),
    });
  };

  const handleFx = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFit({
      ...photoFit,
      fx: parseFloat(e.target.value),
    });
  };

  const handleFy = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFit({
      ...photoFit,
      fy: parseFloat(e.target.value),
    });
  };

  const handleReset = () => {
    onChangeFit({
      zoom: 1,
      fx: 0.5,
      fy: 0.5,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-df-border bg-df-bg-raised p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-df-border">
          <h3 className="text-lg font-black text-df-fg">Adjust Photo</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-df-fg/60 hover:text-df-fg hover:bg-df-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Circular Crop Preview */}
        <div className="flex justify-center">
          <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-google-blue shadow-lg bg-df-bg">
            <img
              src={photoUrl}
              alt="Adjustment preview"
              className="absolute max-w-none transition-all duration-75 select-none pointer-events-none"
              style={{
                width: `${100 * photoFit.zoom}%`,
                height: `${100 * photoFit.zoom}%`,
                left: `${(0.5 - photoFit.fx) * 100 * (photoFit.zoom - 1)}%`,
                top: `${(0.5 - photoFit.fy) * 100 * (photoFit.zoom - 1)}%`,
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-2">
          {/* Zoom Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-df-fg/80 mb-1">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-google-blue" />
                <span>Zoom Scale</span>
              </span>
              <span className="font-mono text-[11px]">{photoFit.zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={photoFit.zoom}
              onChange={handleZoom}
              className="w-full accent-google-blue cursor-pointer"
            />
          </div>

          {/* Horizontal Position (Pan X) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-df-fg/80 mb-1">
              <span className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-google-green" />
                <span>Horizontal Pan</span>
              </span>
              <span className="font-mono text-[11px]">{Math.round(photoFit.fx * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={photoFit.fx}
              onChange={handleFx}
              className="w-full accent-google-green cursor-pointer"
            />
          </div>

          {/* Vertical Position (Pan Y) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-df-fg/80 mb-1">
              <span className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-google-red rotate-90" />
                <span>Vertical Pan</span>
              </span>
              <span className="font-mono text-[11px]">{Math.round(photoFit.fy * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={photoFit.fy}
              onChange={handleFy}
              className="w-full accent-google-red cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-df-border">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-df-border text-xs font-bold text-df-fg hover:bg-df-bg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-df-fg text-df-bg text-xs font-bold uppercase tracking-wider hover:bg-df-ink shadow-sm transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
