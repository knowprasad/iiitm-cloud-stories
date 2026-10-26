import React from 'react';
import { EventConfig } from '../types/badge';
import { availableEvents } from '../config/eventConfig';
import { X, Check, Calendar, MapPin } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  currentEventId: string;
  onSelectEvent: (event: EventConfig) => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  currentEventId,
  onSelectEvent,
  onClose,
}) => {
  if (!isOpen) return null;

  const eventsList = Object.values(availableEvents);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-df-border bg-df-bg-raised p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-df-border">
          <div>
            <h3 className="text-lg font-black text-df-fg">Select Campaign</h3>
            <p className="text-xs text-df-fg/60">
              Reusable event badge studio for GDG on Campus
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-df-fg/60 hover:text-df-fg hover:bg-df-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign List */}
        <div className="space-y-3 pt-1">
          {eventsList.map((ev) => {
            const isSelected = ev.id === currentEventId;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => {
                  onSelectEvent(ev);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-google-blue bg-google-blue/5 shadow-sm ring-2 ring-google-blue/20'
                    : 'border-df-border bg-df-bg hover:border-df-fg/40 hover:bg-df-bg-raised'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-google-blue">
                      {ev.edition}
                    </div>
                    <div className="text-base font-black text-df-fg mt-0.5">
                      {ev.title}
                    </div>
                    <div className="text-xs font-semibold text-df-fg/70">
                      {ev.subtitle}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-google-blue text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-df-fg/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-google-blue" />
                    <span>{ev.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-google-red" />
                    <span>{ev.venue}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Platform Note */}
        <div className="rounded-xl border border-df-border bg-df-bg p-3 text-[11px] text-df-fg/70 leading-relaxed">
          <span className="font-bold text-df-fg">Organizers:</span> New campaigns can be configured in{' '}
          <code className="rounded bg-df-bg-sunken px-1 font-mono text-[10px]">
            src/config/eventConfig.ts
          </code>{' '}
          with custom branding, roles, tracks, and stickers.
        </div>
      </div>
    </div>
  );
};
