import type { HubHomepageRole, HubSection } from './hub-homepage.types';

const WORKER_SECTIONS: HubSection[] = [
  'feed',
  'quickActions',
  'weather',
  'jobs',
  'safetyBlog',
  'achievements',
];

const SUPERVISOR_SECTIONS: HubSection[] = [
  ...WORKER_SECTIONS,
  'trending',
  'projectUpdates',
  'announcements',
];

const COMPANY_ADMIN_SECTIONS: HubSection[] = [...SUPERVISOR_SECTIONS];

const UNION_HALL_SECTIONS: HubSection[] = [
  'feed',
  'quickActions',
  'trending',
  'weather',
  'jobs',
  'safetyBlog',
  'achievements',
  'announcements',
];

export function mapJwtRoleToHubRole(role: string): HubHomepageRole {
  if (role === 'UNION_HALL_ADMIN') return 'UNION_HALL';
  if (role === 'COMPANY_ADMIN' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return 'COMPANY_ADMIN';
  }
  if (role === 'SUPERVISOR' || role === 'PROJECT_MANAGER') {
    return 'SUPERVISOR';
  }
  return 'WORKER';
}

export function sectionsForHubRole(hubRole: HubHomepageRole): HubSection[] {
  switch (hubRole) {
    case 'UNION_HALL':
      return UNION_HALL_SECTIONS;
    case 'COMPANY_ADMIN':
      return COMPANY_ADMIN_SECTIONS;
    case 'SUPERVISOR':
      return SUPERVISOR_SECTIONS;
    default:
      return WORKER_SECTIONS;
  }
}

export function quickActionsForHubRole(hubRole: HubHomepageRole) {
  const base = [
    { id: 'wallet', label: 'My wallet', href: '/wallet', icon: 'wallet' },
    {
      id: 'training',
      label: 'Training',
      href: '/training',
      icon: 'graduation-cap',
    },
  ];
  if (hubRole === 'WORKER') {
    return [
      ...base,
      { id: 'jobs', label: 'Find jobs', href: '/jobs', icon: 'briefcase' },
      { id: 'safety', label: 'Safety blog', href: '/safety', icon: 'shield' },
    ];
  }
  if (hubRole === 'UNION_HALL') {
    return [
      {
        id: 'union-hall',
        label: 'Union hall',
        href: '/union-hall',
        icon: 'users',
      },
      {
        id: 'dispatch',
        label: 'Dispatch',
        href: '/union-hall/dispatch',
        icon: 'truck',
      },
      {
        id: 'training',
        label: 'Training receipts',
        href: '/union-hall/training',
        icon: 'graduation-cap',
      },
    ];
  }
  if (hubRole === 'SUPERVISOR') {
    return [
      {
        id: 'supervisor',
        label: 'Supervisor home',
        href: '/supervisor/home',
        icon: 'clipboard',
      },
      { id: 'core', label: 'Vera Core', href: '/core', icon: 'layers' },
      {
        id: 'equipment',
        label: 'Equipment',
        href: '/equipment',
        icon: 'wrench',
      },
    ];
  }
  return [
    { id: 'admin', label: 'Admin', href: '/admin', icon: 'settings' },
    {
      id: 'dashboard',
      label: 'Operations',
      href: '/dashboard',
      icon: 'layout-dashboard',
    },
    { id: 'core', label: 'Vera Core', href: '/core', icon: 'layers' },
  ];
}
