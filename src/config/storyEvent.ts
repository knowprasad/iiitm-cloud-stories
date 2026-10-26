// Confirmed campus identity, shared by every student card.
export const storyEvent = {
  chapter: 'ABV-IIITM Gwalior',
  instagram: 'gdg_oncampus_iiitm',
  linkedin: 'https://in.linkedin.com/company/gdgoncampus-iiitm',
  communityUrl: 'https://gdg.community.dev/gdg-on-campus-atal-bihari-vajpayee-indian-institute-of-information-technology-and-management-gwalior-india/',
  logo: '/gdg-iiitm-gwalior.png',
};
export type StoryEvent = typeof storyEvent;
export const templates = [
  { id: 'cloud-buddies', name: 'Cloud buddies', description: 'A little soft. A little sky.', color: '#e0f2ff' },
  { id: 'campus-scrapbook', name: 'Campus scrapbook', description: 'For the memories folder.', color: '#fff1ce' },
  { id: 'builder-mode', name: 'Builder mode', description: 'Big ideas. Bigger energy.', color: '#2856ed' },
] as const;
export type TemplateId = typeof templates[number]['id'];
export const moods = [
  { id: 'curious', label: 'Cloud curious', symbol: '✦' },
  { id: 'labs', label: 'Here for the labs', symbol: '⌘' },
  { id: 'chai', label: 'Chai & Cloud', symbol: '☕' },
] as const;
export type MoodId = typeof moods[number]['id'] | '';
export function storyCaption(event: StoryEvent): string {
  const tag = event.instagram.trim().replace(/^@/, '');
  return `I'm joining Google Cloud Study Jams at ${event.chapter}! ☁️\nNew skills. Familiar faces. Let's build something together.${tag ? `\n@${tag}` : ''}\n#GoogleCloudStudyJams #GDGOnCampus #IIITMGwalior`;
}
