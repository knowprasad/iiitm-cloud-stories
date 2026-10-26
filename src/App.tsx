import React, { useState, useRef } from 'react';
import { BadgeFormData, EventConfig } from './types/badge';
import { googleCloudStudyJams2026 } from './config/eventConfig';
import { Header } from './components/Header';
import { PreviewCard } from './components/PreviewCard';
import { EditorCard } from './components/EditorCard';
import { MobileActionBar } from './components/MobileActionBar';
import { PhotoAdjustModal } from './components/PhotoAdjustModal';
import { EventModal } from './components/EventModal';
import { renderBadgeToCanvas, loadImage } from './engine/canvasRenderer';
import { shareBadge, downloadBlob } from './utils/share';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<EventConfig>(googleCloudStudyJams2026);

  const [formData, setFormData] = useState<BadgeFormData>({
    fullName: 'Alex Johnson',
    handle: '@alexbuilds',
    kind: 'attendee',
    role: googleCloudStudyJams2026.defaultRole,
    trackId: googleCloudStudyJams2026.defaultTrack,
    themeId: 'cloud-explorer',
    layout: 'ticket',
    format: 'portrait',
    stickers: ['cloud-native', 'built-gemini', 'chai-code'],
    photoUrl: null,
    photoFit: { zoom: 1, fx: 0.5, fy: 0.5 },
  });

  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isPhotoAdjustOpen, setIsPhotoAdjustOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const updateFormData = (updated: Partial<BadgeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  // Helper: Trigger celebratory confetti burst
  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#A142F4'],
    });
  };

  // Generate high-resolution Blob using an offscreen canvas
  const generateBadgeBlob = async (): Promise<Blob | null> => {
    const offscreenCanvas = document.createElement('canvas');
    let loadedImg: HTMLImageElement | null = null;
    if (formData.photoUrl) {
      try {
        loadedImg = await loadImage(formData.photoUrl);
      } catch (err) {
        console.warn('Could not load photo for export', err);
      }
    }

    await renderBadgeToCanvas(offscreenCanvas, formData, currentEvent, loadedImg);

    return new Promise((resolve) => {
      offscreenCanvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
  };

  // Share action (Web Share API or fallback)
  const handleShare = async () => {
    setIsExporting(true);
    setStatusMessage('Generating high-resolution badge...');

    try {
      const blob = await generateBadgeBlob();
      if (!blob) throw new Error('Failed to generate badge blob');

      const caption = currentEvent.captionTemplate(formData);
      const fileName = `${currentEvent.id}-${formData.fullName.replace(/\s+/g, '-').toLowerCase() || 'badge'}.png`;

      const result = await shareBadge({
        title: `${currentEvent.title} Badge - ${formData.fullName}`,
        text: caption,
        blob,
        fileName,
      });

      triggerConfetti();

      if (result.method === 'web-share-file' || result.method === 'web-share-text') {
        setStatusMessage('Badge ready to share! 🚀');
      } else {
        setStatusMessage('Badge downloaded! Caption ready to paste on social feeds 🎨');
      }
    } catch (err: any) {
      console.error('Share failed', err);
      setStatusMessage('Export error. Please try downloading directly.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  // Direct download action
  const handleDownload = async () => {
    setIsExporting(true);
    setStatusMessage('Rendering high-res PNG...');

    try {
      const blob = await generateBadgeBlob();
      if (!blob) throw new Error('Failed to generate image');

      const fileName = `${currentEvent.id}-${formData.fullName.replace(/\s+/g, '-').toLowerCase() || 'badge'}.png`;
      downloadBlob(blob, fileName);

      triggerConfetti();
      setStatusMessage('High-resolution badge downloaded! 🎉');
    } catch (err: any) {
      console.error('Download failed', err);
      setStatusMessage('Download failed. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-df-bg text-df-fg">
      {/* Hidden File Input for quick upload from preview overlay */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (typeof evt.target?.result === 'string') {
              updateFormData({
                photoUrl: evt.target.result,
                photoFit: { zoom: 1, fx: 0.5, fy: 0.5 },
              });
            }
          };
          reader.readAsDataURL(file);
          e.target.value = '';
        }}
      />

      {/* Main Container */}
      <main className="flex-1 pb-24 pt-4 sm:pt-6">
        <Header
          event={currentEvent}
          onOpenEventModal={() => setIsEventModalOpen(true)}
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column: Interactive 3D Preview */}
            <PreviewCard
              data={formData}
              event={currentEvent}
              onOpenPhotoUpload={() => hiddenFileInputRef.current?.click()}
              onOpenPhotoAdjust={() => setIsPhotoAdjustOpen(true)}
            />

            {/* Right Column: Customization Controls */}
            <EditorCard
              data={formData}
              event={currentEvent}
              onChange={updateFormData}
              onOpenPhotoAdjust={() => setIsPhotoAdjustOpen(true)}
              onShare={handleShare}
              onDownload={handleDownload}
              isExporting={isExporting}
              statusMessage={statusMessage}
            />
          </div>
        </div>
      </main>

      {/* Mobile Floating Bottom Bar */}
      <MobileActionBar
        onShare={handleShare}
        onDownload={handleDownload}
        isExporting={isExporting}
      />

      {/* Photo Adjust Modal */}
      <PhotoAdjustModal
        isOpen={isPhotoAdjustOpen}
        photoUrl={formData.photoUrl}
        photoFit={formData.photoFit}
        onChangeFit={(fit) => updateFormData({ photoFit: fit })}
        onClose={() => setIsPhotoAdjustOpen(false)}
      />

      {/* Campaign Switcher Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        currentEventId={currentEvent.id}
        onSelectEvent={(ev) => {
          setCurrentEvent(ev);
          updateFormData({
            role: ev.defaultRole,
            trackId: ev.defaultTrack,
            themeId: ev.themes[0].id,
          });
        }}
        onClose={() => setIsEventModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-df-border/60 py-8 text-center text-xs text-df-fg/60">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>Built with ❤️ for</span>
            <span className="font-bold text-df-fg">{currentEvent.community}</span>
            <span>• Google Cloud Study Jams 2026</span>
          </div>

          <div className="flex items-center gap-4 text-df-fg/50">
            <span>Client-side private rendering</span>
            <span>•</span>
            <span>No account required</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
