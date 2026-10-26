import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BadgeFormData, EventConfig } from '../types/badge';
import { renderBadgeToCanvas, loadImage } from '../engine/canvasRenderer';
import { Camera, Sliders } from 'lucide-react';

interface PreviewCardProps {
  data: BadgeFormData;
  event: EventConfig;
  onOpenPhotoUpload: () => void;
  onOpenPhotoAdjust: () => void;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  data,
  event,
  onOpenPhotoUpload,
  onOpenPhotoAdjust,
  onCanvasReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50, isHovered: false });
  const [isRendering, setIsRendering] = useState(false);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;
    if (data.photoUrl) {
      loadImage(data.photoUrl)
        .then((img) => {
          if (active) setPhotoImg(img);
        })
        .catch(() => {
          if (active) setPhotoImg(null);
        });
    } else {
      setPhotoImg(null);
    }
    return () => {
      active = false;
    };
  }, [data.photoUrl]);

  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      await renderBadgeToCanvas(canvasRef.current, data, event, photoImg);
      if (onCanvasReady) {
        onCanvasReady(canvasRef.current);
      }
    } catch (err) {
      console.error('Failed to render preview canvas', err);
    } finally {
      setIsRendering(false);
    }
  }, [data, event, photoImg, onCanvasReady]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, shineX, shineY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt((prev) => ({ ...prev, x: 0, y: 0, isHovered: false }));
  };

  const getFormatStyle = () => {
    switch (data.format) {
      case 'story':
        return {
          aspectRatio: '1080 / 1920',
          maxWidth: '360px',
        };
      case 'square':
        return {
          aspectRatio: '1080 / 1080',
          maxWidth: '430px',
        };
      case 'landscape':
        return {
          aspectRatio: '1200 / 675',
          maxWidth: '520px',
        };
      case 'portrait':
      default:
        return {
          aspectRatio: '1080 / 1350',
          maxWidth: '430px',
        };
    }
  };

  const formatStyle = getFormatStyle();
  const theme = event.themes.find((t) => t.id === data.themeId) || event.themes[0];

  return (
    <div className="flex min-w-0 flex-col items-center lg:sticky lg:top-20 lg:self-start w-full">
      {/* Format & Dimensions Status Pill + Photo Actions Bar */}
      <div
        className="mb-3.5 flex items-center justify-between w-full px-1"
        style={{ maxWidth: formatStyle.maxWidth }}
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
          <span className="capitalize font-black text-[#8AB4F8]">{data.format}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/60">
            {data.format === 'story'
              ? '1080 × 1920 (Story)'
              : data.format === 'square'
              ? '1080 × 1080 (Square)'
              : data.format === 'landscape'
              ? '1200 × 675 (Wide)'
              : '1080 × 1350 (Portrait)'}
          </span>
        </div>

        {/* Quick Photo Actions in Bar */}
        <div>
          {data.photoUrl ? (
            <button
              type="button"
              onClick={onOpenPhotoAdjust}
              className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1 text-xs font-bold border border-white/20 backdrop-blur-md shadow transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] cursor-pointer"
              title="Adjust Crop and Zoom"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FBBC04]" />
              <span>Adjust Photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPhotoUpload}
              className="flex items-center gap-1.5 rounded-full bg-[#4285F4] hover:bg-blue-600 text-white px-3.5 py-1 text-xs font-bold shadow-[0_0_15px_rgba(66,133,244,0.4)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ Add Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Perspective Card Container with Pedestal Lighting */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative mx-auto w-full touch-pan-y transition-transform duration-200"
        style={{
          perspective: '1400px',
          maxWidth: formatStyle.maxWidth,
        }}
      >
        {/* Ambient Pedestal Glow behind badge */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl transition-all duration-300 pointer-events-none"
          style={{
            background: theme.dark
              ? 'radial-gradient(circle, rgba(161, 66, 244, 0.4) 0%, rgba(66, 133, 244, 0.25) 50%, transparent 80%)'
              : 'radial-gradient(circle, rgba(66, 133, 244, 0.45) 0%, rgba(234, 67, 53, 0.2) 50%, transparent 80%)',
          }}
        />

        <div
          className="relative overflow-hidden rounded-[1.6rem] transition-transform duration-150 ease-out select-none border border-white/15"
          style={{
            aspectRatio: formatStyle.aspectRatio,
            backgroundColor: theme.outer,
            boxShadow: 'rgba(0, 0, 0, 0.8) 0px 30px 80px -15px, rgba(66, 133, 244, 0.2) 0px 0px 50px 0px',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${
              tilt.isHovered ? 1.02 : 1
            }, ${tilt.isHovered ? 1.02 : 1}, 1)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Canvas Render Element */}
          <canvas
            ref={canvasRef}
            className="h-full w-full object-contain pointer-events-none select-none"
          />

          {/* Holographic Iridescent Sheen on Tilt */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: tilt.isHovered ? 0.4 : 0,
              background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255, 255, 255, 0.9) 0%, rgba(138, 180, 248, 0.3) 30%, transparent 70%)`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Loading Spinner */}
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs transition-opacity">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#4285F4] border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3.5 text-center text-[11px] font-mono text-white/40 select-none hidden sm:block">
        Hover or drag card for 3D holographic tilt
      </div>
    </div>
  );
};
