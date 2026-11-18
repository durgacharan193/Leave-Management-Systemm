/**
 * Predefined departments for a software company
 * Used across registration, admin panel, and user management
 */

export const DEPARTMENTS = [
  'Engineering',
  'Quality Assurance',
  'Product Management',
  'UI/UX Design',
  'DevOps',
  'Data Science',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Customer Support',
  'Administration',
  'Legal',
  'IT Infrastructure',
];

/**
 * Department icons/emojis for visual display
 */
export const DEPARTMENT_CONFIG = {
  'Engineering': { emoji: '⚙️', color: '#6366f1' },
  'Quality Assurance': { emoji: '🧪', color: '#f59e0b' },
  'Product Management': { emoji: '📋', color: '#14b8a6' },
  'UI/UX Design': { emoji: '🎨', color: '#e879f9' },
  'DevOps': { emoji: '🚀', color: '#f97316' },
  'Data Science': { emoji: '📊', color: '#3b82f6' },
  'Human Resources': { emoji: '👥', color: '#ec4899' },
  'Marketing': { emoji: '📢', color: '#8b5cf6' },
  'Sales': { emoji: '💼', color: '#10b981' },
  'Finance': { emoji: '💰', color: '#eab308' },
  'Customer Support': { emoji: '🎧', color: '#06b6d4' },
  'Administration': { emoji: '🏢', color: '#64748b' },
  'Legal': { emoji: '⚖️', color: '#78716c' },
  'IT Infrastructure': { emoji: '🖥️', color: '#0ea5e9' },
};

/**
 * Role configuration for consistent styling across the app
 */
export const ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    shortLabel: 'Admin',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    icon: '🛡️',
    description: 'Full system access',
  },
  manager: {
    label: 'Manager',
    shortLabel: 'Manager',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: '👔',
    description: 'Team management',
  },
  employee: {
    label: 'Employee',
    shortLabel: 'Employee',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    icon: '👤',
    description: 'Standard access',
  },
};
