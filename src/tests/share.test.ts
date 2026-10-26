import { describe, it, expect } from 'vitest';
import { getLinkedInShareUrl, getXShareUrl } from '../utils/share';

describe('Share Utilities & Social Intents', () => {
  it('generates valid LinkedIn feed share URL with encoded caption', () => {
    const caption = 'Attending Google Cloud Study Jams 2026! 🚀';
    const url = getLinkedInShareUrl(caption);

    expect(url).toContain('https://www.linkedin.com/feed/?shareActive=true');
    expect(url).toContain('text=Attending%20Google%20Cloud%20Study%20Jams%202026!%20%F0%9F%9A%80');
  });

  it('generates valid Twitter/X tweet intent with encoded caption and target URL', () => {
    const caption = 'Joining GDG on Campus for Cloud Study Jams! #GoogleCloud';
    const targetUrl = 'https://gdg.community.dev';
    const url = getXShareUrl(caption, targetUrl);

    expect(url).toContain('https://twitter.com/intent/tweet');
    expect(url).toContain('text=Joining%20GDG%20on%20Campus%20for%20Cloud%20Study%20Jams!%20%23GoogleCloud');
    expect(url).toContain('url=https%3A%2F%2Fgdg.community.dev');
  });
});
