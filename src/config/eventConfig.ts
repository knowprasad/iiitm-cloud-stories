import { EventConfig } from '../types/badge';

export const googleCloudStudyJams2026: EventConfig = {
  id: 'gcsj-2026',
  title: 'Google Cloud Study Jams',
  subtitle: 'with Community 2026',
  edition: '2026 Campus Edition',
  organization: 'Google Developer Groups',
  community: 'GDG on Campus',
  date: 'March - April 2026',
  venue: 'Campus Tech Hub & Hybrid Workshops',
  registrationUrl: 'https://gdg.community.dev',
  hashtags: ['#GoogleCloudStudyJams', '#GDGOnCampus', '#StudyJams2026', '#GoogleCloud', '#GeminiAI'],
  themes: [
    {
      id: 'cloud-explorer',
      name: 'Cloud Explorer',
      description: 'Google Cloud Blue with isometric cloud architecture & crisp tech vibes',
      swatchGradient: 'linear-gradient(135deg, #e8f0fe 50%, #4285f4 50%)',
      outer: '#f4f7fc',
      bg: ['#f8fbff', '#e8f0fe'],
      stub: '#1a73e8',
      stubText: '#ffffff',
      stubSub: '#d2e3fc',
      stubAccent: '#fbbc04',
      text: '#202124',
      sub: '#5f6368',
      accent: '#1a73e8',
      gold: '#f9ab00',
      border: '#4285f4',
      art: '#1a73e8',
      pillBg: 'rgba(255, 255, 255, 0.85)',
      pillBorder: 'rgba(66, 133, 244, 0.35)',
      tagBg: '#1a73e8',
      tagText: '#ffffff',
      photoBg: '#e8f0fe',
      dark: false,
    },
    {
      id: 'builder-edition',
      name: 'Builder Edition',
      description: 'Deep midnight with Vertex AI & Gemini glow — built for developers',
      swatchGradient: 'linear-gradient(135deg, #0d1330 50%, #a142f4 50%)',
      outer: '#060914',
      bg: ['#0d1330', '#18123a'],
      stub: '#080c1e',
      stubText: '#f1f3ff',
      stubSub: '#aab4e8',
      stubAccent: '#8ab4f8',
      text: '#f1f3ff',
      sub: '#aab4e8',
      accent: '#8ab4f8',
      gold: '#d7aefb',
      border: '#6c7ff2',
      art: '#8ab4f8',
      pillBg: 'rgba(241, 243, 255, 0.08)',
      pillBorder: 'rgba(138, 180, 248, 0.45)',
      tagBg: '#8ab4f8',
      tagText: '#0d1330',
      photoBg: '#090d22',
      dark: true,
    },
    {
      id: 'campus-edition',
      name: 'Campus Edition',
      description: 'Warm ivory canvas with iconic Google 4-color geometry & collegiate energy',
      swatchGradient: 'linear-gradient(135deg, #faf5ea 50%, #ea4335 50%)',
      outer: '#faf5ea',
      bg: ['#fdfbf7', '#f4ede1'],
      stub: '#1f2440',
      stubText: '#faf5ea',
      stubSub: '#ffd3b0',
      stubAccent: '#fbbc04',
      text: '#1a1a1a',
      sub: '#5f4630',
      accent: '#ea4335',
      gold: '#fbbc04',
      border: '#ea4335',
      art: '#ea4335',
      pillBg: 'rgba(250, 245, 234, 0.9)',
      pillBorder: 'rgba(234, 67, 53, 0.35)',
      tagBg: '#ea4335',
      tagText: '#ffffff',
      photoBg: '#ede4d3',
      dark: false,
    },
  ],
  roles: [
    { id: 'Student Builder', label: 'Student & Aspiring Builder' },
    { id: 'Cloud Architect', label: 'Cloud Architect' },
    { id: 'AI / ML Practitioner', label: 'AI / ML Engineer' },
    { id: 'DevOps & SRE', label: 'DevOps & SRE' },
    { id: 'Full Stack Dev', label: 'Full Stack Developer' },
    { id: 'Flutter & Mobile', label: 'Mobile & Flutter Dev' },
    { id: 'Community Lead', label: 'Community Lead / Organizer' },
    { id: 'Cloud Facilitator', label: 'Study Jam Facilitator' },
    { id: 'Explorer', label: 'Tech Enthusiast' },
  ],
  tracks: [
    { id: 'genai', label: 'Google Cloud & GenAI', icon: '☁️' },
    { id: 'gemini', label: 'Gemini & Vertex AI', icon: '🤖' },
    { id: 'devops', label: 'Cloud DevOps & Kubernetes', icon: '⚡' },
    { id: 'flutter', label: 'Android, Flutter & Firebase', icon: '📱' },
    { id: 'serverless', label: 'Modern Web & Serverless', icon: '🌐' },
  ],
  stickers: [
    { id: 'cloud-native', label: 'Cloud Native', emoji: '☁️' },
    { id: 'built-gemini', label: 'Built with Gemini', emoji: '🤖' },
    { id: 'chai-code', label: 'Chai & Code', emoji: '☕' },
    { id: 'ship-prod', label: 'Ship to Prod', emoji: '⚡' },
    { id: 'flutter-fan', label: 'Flutter Fan', emoji: '📱' },
    { id: '10x-builder', label: '10x Builder', emoji: '🚀' },
    { id: 'gdg-member', label: 'GDG on Campus', emoji: '❤️' },
    { id: 'open-source', label: 'Open Source', emoji: '🌐' },
    { id: 'jam-certified', label: 'Jam Certified', emoji: '🏆' },
  ],
  defaultRole: 'Student Builder',
  defaultTrack: 'genai',
  captionTemplate: (data) => {
    const kindVerb =
      data.kind === 'speaker'
        ? "I'm speaking at"
        : data.kind === 'volunteer'
        ? "I'm volunteering at"
        : data.kind === 'facilitator'
        ? "I'm facilitating"
        : "I'm taking on";

    const trackObj = googleCloudStudyJams2026.tracks.find((t) => t.id === data.trackId);
    const trackName = trackObj ? trackObj.label : 'Google Cloud';

    return `Excited to announce that ${kindVerb} Google Cloud Study Jams with Community 2026! 🚀☁️\n\n` +
      `Focusing on ${trackName} with hands-on labs, generative AI workshops, and community-driven learning on campus.\n\n` +
      `Ready to skill up on Google Cloud and build real-world AI applications together with GDG on Campus!\n\n` +
      `Are you joining the journey? Drop a 🙋 in the comments and let's connect!\n\n` +
      `#GoogleCloudStudyJams #GDGOnCampus #StudyJams2026 #GoogleCloud #GeminiAI #CloudNative`;
  },
};

// Alternate event showing reusability
export const devfestCampus2026: EventConfig = {
  id: 'devfest-campus-2026',
  title: 'DevFest Campus 2026',
  subtitle: 'Central India Developer Gathering',
  edition: '2026 Edition',
  organization: 'Google Developer Groups',
  community: 'GDG on Campus',
  date: 'November 2026',
  venue: 'Main Auditorium & Community Stage',
  registrationUrl: 'https://gdg.community.dev',
  hashtags: ['#DevFest2026', '#GDGOnCampus', '#DevFest', '#Developers'],
  themes: googleCloudStudyJams2026.themes,
  roles: googleCloudStudyJams2026.roles,
  tracks: googleCloudStudyJams2026.tracks,
  stickers: googleCloudStudyJams2026.stickers,
  defaultRole: 'Full Stack Dev',
  defaultTrack: 'gemini',
  captionTemplate: (_data) => {
    return `Can't wait for DevFest Campus 2026! 🎟️🔥\n\n` +
      `Joining hundreds of developers, students, and engineers for a full day of tech talks, code, and community.\n\n` +
      `#DevFest2026 #GDGOnCampus #DevFest`;
  },
};

export const availableEvents: Record<string, EventConfig> = {
  'gcsj-2026': googleCloudStudyJams2026,
  'devfest-campus-2026': devfestCampus2026,
};
