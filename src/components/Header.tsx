import React from 'react';
import { EventConfig } from '../types/badge';
import { Sparkles, Calendar, Layers } from 'lucide-react';

interface HeaderProps {
  event: EventConfig;
  onOpenEventModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ event, onOpenEventModal }) => {
  return (
    <header className="relative mx-auto w-full max-w-6xl px-4 pt-6 pb-4 sm:px-6 sm:pt-10 lg:px-8">
      {/* Top Bar: Event Badge & Campaign Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-df-border/60">
        <div className="flex items-center gap-2.5">
          {/* GDG Brackets SVG */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-df-bg-raised border border-df-border shadow-sm">
            <span className="font-mono font-bold text-xs tracking-tighter">
              <span className="text-google-blue">&lt;</span>
              <span className="text-google-red">/</span>
              <span className="text-google-green">&gt;</span>
            </span>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-df-fg">
              {event.organization}
            </div>
            <div className="text-[11px] font-medium text-df-fg/60">
              {event.community}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-df-bg-raised border border-df-border text-[11px] font-bold text-df-fg/75">
            <Calendar className="w-3.5 h-3.5 text-google-blue" />
            <span>{event.date}</span>
          </div>

          <button
            type="button"
            onClick={onOpenEventModal}
            className="flex items-center gap-1.5 rounded-full border border-df-border bg-df-bg-raised px-3 py-1.5 text-xs font-bold text-df-fg hover:border-df-fg/40 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-blue"
            title="Switch Campaign / Event"
          >
            <Layers className="w-3.5 h-3.5 text-df-purple" />
            <span className="hidden xs:inline">Campaign:</span>
            <span className="text-google-blue">{event.title}</span>
          </button>
        </div>
      </div>

      {/* Hero Headline & Subtitle */}
      <div className="mt-8 text-center sm:mt-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-google-blue/10 border border-google-blue/20 px-3 py-1 text-xs font-extrabold text-google-blue mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{event.edition}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-df-fg sm:text-5xl lg:text-6xl">
          Pass secured. Now flex it! 🎟️
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-df-fg/75 sm:mt-3.5 sm:text-base leading-relaxed">
          Add your photo and name, then share your custom card on LinkedIn, Instagram, or X. 
          Celebrate your learning journey with the community!
        </p>
      </div>
    </header>
  );
};
