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

  // Load user photo image whenever photoUrl changes
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

  // Re-render canvas whenever data, event or photo changes
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

  // 3D Perspective Tilt on Mouse / Touch Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7; // Max tilt: -7deg to +7deg
    const rotateY = ((x - centerX) / centerX) * 7;

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, shineX, shineY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt((prev) => ({ ...prev, x: 0, y: 0, isHovered: false }));
  };

  // Determine aspect ratio class & max-width based on format
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
          maxWidth: '440px',
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
    <div className="flex min-w-0 flex-col items-center lg:sticky lg:top-24 lg:self-start w-full">
      {/* Format & Dimensions Pill */}
      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-df-fg/60">
        <span className="capitalize font-black text-df-fg">{data.format}</span>
        <span>•</span>
        <span className="font-mono text-[11px]">
          {data.format === 'story'
            ? '1080 × 1920 (9:16)'
            : data.format === 'square'
            ? '1080 × 1080 (1:1)'
            : data.format === 'landscape'
            ? '1200 × 675 (16:9)'
            : '1080 × 1350 (4:5)'}
        </span>
      </div>

      {/* 3D Perspective Card Container */}
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
        <div
          className="relative overflow-hidden rounded-[1.4rem] shadow-2xl transition-transform duration-150 ease-out select-none"
          style={{
            aspectRatio: formatStyle.aspectRatio,
            backgroundColor: theme.outer,
            boxShadow: theme.dark
              ? 'rgba(0, 0, 0, 0.7) 0px 30px 70px -15px'
              : 'rgba(66, 133, 244, 0.35) 0px 30px 70px -15px',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${
              tilt.isHovered ? 1.015 : 1
            }, ${tilt.isHovered ? 1.015 : 1}, 1)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Canvas Preview */}
          <canvas
            ref={canvasRef}
            className="h-full w-full object-contain pointer-events-none select-none"
          />

          {/* Specular Hologram Light Sweep */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: tilt.isHovered ? 0.45 : 0,
              background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.15) 35%, transparent 65%)`,
              mixBlendMode: 'soft-light',
            }}
          />

          {/* Direct Photo Action Overlay Pill */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
            {data.photoUrl ? (
              <button
                type="button"
                onClick={onOpenPhotoAdjust}
                className="flex items-center gap-1 rounded-full bg-df-ink/80 hover:bg-df-ink text-white px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
                title="Adjust Crop and Zoom"
              >
                <Sliders className="w-3.5 h-3.5 text-df-yellow" />
                <span>Adjust</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenPhotoUpload}
                className="flex items-center gap-1.5 rounded-full bg-google-blue hover:bg-blue-600 text-white px-3.5 py-1.5 text-xs font-black shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Photo</span>
              </button>
            )}
          </div>

          {/* Loading Indicator Overlay */}
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs transition-opacity">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      {/* Tilt hint for users */}
      <div className="mt-3 text-center text-[11px] font-semibold text-df-fg/45 select-none hidden sm:block">
        Hover or tilt badge for interactive 3D effect
      </div>
    </div>
  );
};
