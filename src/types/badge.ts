export type OutputFormat = 'portrait' | 'story' | 'square' | 'landscape';
export type BadgeLayout = 'creator' | 'ticket';
export type AttendeeKind = 'attendee' | 'speaker' | 'volunteer' | 'facilitator';

export interface PhotoFit {
  zoom: number;
  fx: number; // 0 to 1 horizontal focal position (0.5 is center)
  fy: number; // 0 to 1 vertical focal position (0.5 is center)
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  swatchGradient: string;
  outer: string;
  bg: [string, string];
  stub: string;
  stubText: string;
  stubSub: string;
  stubAccent: string;
  text: string;
  sub: string;
  accent: string;
  gold: string;
  border: string;
  art: string;
  pillBg: string;
  pillBorder: string;
  tagBg: string;
  tagText: string;
  photoBg: string;
  dark?: boolean;
}

export interface TrackOption {
  id: string;
  label: string;
  icon: string;
}

export interface RoleOption {
  id: string;
  label: string;
}

export interface StickerOption {
  id: string;
  label: string;
  emoji: string;
}

export interface EventConfig {
  id: string;
  title: string;
  subtitle: string;
  edition: string;
  organization: string;
  community: string;
  date: string;
  venue: string;
  registrationUrl: string;
  hashtags: string[];
  themes: ThemeConfig[];
  roles: RoleOption[];
  tracks: TrackOption[];
  stickers: StickerOption[];
  defaultRole: string;
  defaultTrack: string;
  captionTemplate: (data: BadgeFormData) => string;
}

export interface BadgeFormData {
  fullName: string;
  handle: string;
  kind: AttendeeKind;
  role: string;
  trackId: string;
  themeId: string;
  layout: BadgeLayout;
  format: OutputFormat;
  stickers: string[]; // up to 3 ids
  photoUrl: string | null;
  photoFit: PhotoFit;
  githubUsername?: string;
}
