export const ORIENTATION_LOCALES = ['en', 'fr', 'es', 'tl', 'pa'] as const;
export type OrientationLocale = (typeof ORIENTATION_LOCALES)[number];

export const DEFAULT_ORIENTATION_SECTIONS_EN = [
  {
    id: 'welcome',
    type: 'text',
    title: 'Welcome',
    body: 'Welcome to the site. This orientation covers hazards, emergency response, and your responsibilities.',
  },
  {
    id: 'hazards',
    type: 'text',
    title: 'Hazards',
    body: 'Review site-specific hazards with your supervisor before starting work.',
  },
  {
    id: 'emergency',
    type: 'text',
    title: 'Emergency response',
    body: 'Know muster points, alarm signals, and how to report emergencies.',
  },
  {
    id: 'ppe',
    type: 'text',
    title: 'PPE',
    body: 'Wear required PPE at all times in designated areas.',
  },
  {
    id: 'responsibilities',
    type: 'text',
    title: 'Worker responsibilities',
    body: 'Follow safe work practices, participate in FLHAs, and stop work when unsafe.',
  },
];
