import {
  HiOutlineViewGrid,
  HiOutlineBell,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlineDocumentReport,
  HiOutlineCog,
} from 'react-icons/hi';

export const SEVERITY_LEVELS = {
  CRITICAL: {
    label: 'Critical',
    color: '#dc2626',
    bg: 'bg-red-950/50',
    text: 'text-red-400',
    border: 'border-red-500/40',
  },
  HIGH: {
    label: 'High',
    color: '#f97316',
    bg: 'bg-orange-950/50',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#eab308',
    bg: 'bg-yellow-950/50',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
  },
  LOW: {
    label: 'Low',
    color: '#3b82f6',
    bg: 'bg-blue-950/50',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
  },
  INFO: {
    label: 'Info',
    color: '#6b7280',
    bg: 'bg-gray-900/50',
    text: 'text-gray-400',
    border: 'border-gray-500/40',
  },
};

export const ALERT_STATUSES = {
  NEW: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-500/30' },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-500/30' },
  DISMISSED: { label: 'Dismissed', color: 'text-gray-400', bg: 'bg-gray-900/50', border: 'border-gray-500/30' },
};

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/alerts', label: 'Alerts', icon: HiOutlineBell },
  { path: '/incidents', label: 'Incidents', icon: HiOutlineExclamationCircle },
  { path: '/logs', label: 'Logs', icon: HiOutlineDocumentText },
  { path: '/threat-intel', label: 'Threat Intel', icon: HiOutlineGlobeAlt },
  { path: '/reports', label: 'Reports', icon: HiOutlineDocumentReport },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

export const ATTACK_TYPES = [
  'Brute Force',
  'Port Scan',
  'SQL Injection',
  'Cross-Site Scripting (XSS)',
  'Malware Execution',
  'DDoS Attack',
  'Phishing Attempt',
  'Ransomware Activity',
  'Command Injection',
  'Directory Traversal',
];
