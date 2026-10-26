import { describe, it, expect } from 'vitest';
import { googleCloudStudyJams2026, devfestCampus2026, availableEvents } from '../config/eventConfig';
import { BadgeFormData } from '../types/badge';

describe('Event Configuration & Multi-Campaign Architecture', () => {
  it('has valid core configuration for Google Cloud Study Jams 2026', () => {
    expect(googleCloudStudyJams2026.id).toBe('gcsj-2026');
    expect(googleCloudStudyJams2026.title).toContain('Google Cloud');
    expect(googleCloudStudyJams2026.community).toBe('GDG on Campus');
    expect(googleCloudStudyJams2026.themes.length).toBeGreaterThanOrEqual(3);
  });

  it('provides distinct, high-quality themes with complete color tokens', () => {
    const themeIds = googleCloudStudyJams2026.themes.map((t) => t.id);
    expect(themeIds).toContain('cloud-explorer');
    expect(themeIds).toContain('builder-edition');
    expect(themeIds).toContain('campus-edition');

    googleCloudStudyJams2026.themes.forEach((theme) => {
      expect(theme.name).toBeDefined();
      expect(theme.outer).toMatch(/^#|^rgba/);
      expect(theme.border).toBeDefined();
      expect(theme.bg.length).toBe(2);
      expect(theme.accent).toBeDefined();
    });
  });

  it('supports multiple distinct campaigns through availableEvents registry', () => {
    expect(availableEvents['gcsj-2026']).toBeDefined();
    expect(availableEvents['devfest-campus-2026']).toBe(devfestCampus2026);
    expect(Object.keys(availableEvents).length).toBeGreaterThanOrEqual(2);
  });

  it('dynamically interpolates personalized caption with user role, track and hashtags', () => {
    const mockData: BadgeFormData = {
      fullName: 'Samira Khan',
      handle: '@samira_ai',
      kind: 'speaker',
      role: 'AI / ML Engineer',
      trackId: 'gemini',
      themeId: 'builder-edition',
      layout: 'ticket',
      format: 'portrait',
      stickers: ['built-gemini'],
      photoUrl: null,
      photoFit: { zoom: 1, fx: 0.5, fy: 0.5 },
    };

    const caption = googleCloudStudyJams2026.captionTemplate(mockData);
    expect(caption).toContain("I'm speaking at Google Cloud Study Jams");
    expect(caption).toContain('Gemini & Vertex AI');
    expect(caption).toContain('#GoogleCloudStudyJams');
    expect(caption).toContain('#GDGOnCampus');
  });

  it('adjusts caption phrasing for attendees', () => {
    const mockData: BadgeFormData = {
      fullName: 'Rahul Sharma',
      handle: '@rahul_dev',
      kind: 'attendee',
      role: 'Student Builder',
      trackId: 'genai',
      themeId: 'cloud-explorer',
      layout: 'ticket',
      format: 'portrait',
      stickers: [],
      photoUrl: null,
      photoFit: { zoom: 1, fx: 0.5, fy: 0.5 },
    };

    const caption = googleCloudStudyJams2026.captionTemplate(mockData);
    expect(caption).toContain("I'm taking on Google Cloud Study Jams");
  });
});
