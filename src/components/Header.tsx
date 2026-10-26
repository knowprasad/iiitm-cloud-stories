import React from 'react';
import { EventConfig } from '../types/badge';
import { Sparkles, Calendar, Layers } from 'lucide-react';

interface HeaderProps {
  event: EventConfig;
  onOpenEventModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ event, onOpenEventModal }) => {
  return (
    <header className="relative mx-auto w-full max-w-6xl px-4 pt-4 pb-2 sm:px-6 sm:pt-8 lg:px-8">
      {/* Top Glassmorphic Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Glowing Google 4-Color Brackets */}
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 shadow-inner">
            <span className="font-mono font-bold text-sm tracking-tighter">
              <span className="text-[#4285F4]">&lt;</span>
              <span className="text-[#EA4335]">/</span>
              <span className="text-[#34A853]">&gt;</span>
            </span>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>{event.organization}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34A853] animate-ping" />
            </div>
            <div className="text-[11px] font-mono text-white/50">
              {event.community} • ASIA-SOUTH
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/70">
            <Calendar className="w-3.5 h-3.5 text-[#4285F4]" />
            <span>{event.date}</span>
          </div>

          <button
            type="button"
            onClick={onOpenEventModal}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] cursor-pointer"
            title="Switch Campaign / Event"
          >
            <Layers className="w-3.5 h-3.5 text-[#A142F4]" />
            <span className="hidden xs:inline text-white/60">Campaign:</span>
            <span className="text-[#4285F4] font-black">{event.title}</span>
          </button>
        </div>
      </div>

      {/* Hero Headline & Subtitle */}
      <div className="mt-8 text-center sm:mt-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-3.5 py-1 text-xs font-mono font-bold text-[#8AB4F8] mb-4 shadow-[0_0_20px_rgba(66,133,244,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
          <span>OFFICIAL ATTENDEE BADGE STUDIO • {event.edition.toUpperCase()}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Pass secured. <span className="bg-gradient-to-r from-[#4285F4] via-[#A142F4] to-[#FBBC04] bg-clip-text text-transparent">Now flex it!</span> 🎟️
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-400 sm:mt-4 sm:text-base leading-relaxed">
          Mint your personalized credential with official Google Cloud & GDG on Campus branding. 
          Ready to share on LinkedIn, Instagram, and X!
        </p>
      </div>
    </header>
  );
};
