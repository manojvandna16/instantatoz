'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { AdminUser } from '@/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles';
import {
  LayoutDashboard, Zap, Users, HardHat, ClipboardCheck, Briefcase,
  ListChecks, Radio, MapPin, CreditCard, Percent, Wallet, RotateCcw,
  MessageSquareWarning, Scale, Star, Bell, HeadphonesIcon, BarChart3,
  FileText, Tag, Globe2, BookOpen, Gavel, Smartphone, Settings,
  ShieldCheck, Activity, ChevronDown, ChevronRight, Building2
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Live Operations', href: '/dashboard/live-operations', icon: Zap, badge: 'LIVE' },
  { label: 'Users', href: '/dashboard/users', icon: Users },
  {
    label: 'Workers', icon: HardHat, children: [
      { label: 'All Workers', href: '/dashboard/workers', icon: HardHat },
      { label: 'Verification', href: '/dashboard/workers/verification', icon: ClipboardCheck },
    ]
  },
  {
    label: 'Jobs', icon: Briefcase, children: [
      { label: 'All Jobs', href: '/dashboard/jobs', icon: Briefcase },
      { label: 'Job Requests', href: '/dashboard/jobs/requests', icon: ListChecks },
      { label: 'Live Jobs', href: '/dashboard/jobs/live', icon: Radio },
    ]
  },
  {
    label: 'Locations', icon: MapPin, children: [
      { label: 'Analytics', href: '/dashboard/locations', icon: MapPin },
      { label: 'Service Areas', href: '/dashboard/service-areas', icon: Building2 },
    ]
  },
  {
    label: 'Finance', icon: CreditCard, children: [
      { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
      { label: 'Commission', href: '/dashboard/commission', icon: Percent },
      { label: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
      { label: 'Refunds', href: '/dashboard/refunds', icon: RotateCcw },
    ]
  },
  {
    label: 'Support', icon: HeadphonesIcon, children: [
      { label: 'Complaints', href: '/dashboard/complaints', icon: MessageSquareWarning },
      { label: 'Disputes', href: '/dashboard/disputes', icon: Scale },
      { label: 'Support Tickets', href: '/dashboard/support', icon: HeadphonesIcon },
      { label: 'Contact Forms', href: '/dashboard/contacts', icon: FileText },
    ]
  },
  { label: 'Ratings & Reviews', href: '/dashboard/ratings', icon: Star },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  {
    label: 'Analytics', icon: BarChart3, children: [
      { label: 'Overview', href: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/dashboard/reports', icon: FileText },
    ]
  },
  { label: 'Categories', href: '/dashboard/categories', icon: Tag },
  {
    label: 'Content', icon: Globe2, children: [
      { label: 'Website Content', href: '/dashboard/content', icon: Globe2 },
      { label: 'Legal Pages', href: '/dashboard/legal', icon: Gavel },
    ]
  },
  { label: 'App Management', href: '/dashboard/app-management', icon: Smartphone },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: ShieldCheck },
  { label: 'System Health', href: '/dashboard/system-health', icon: Activity },
];

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() =>
    item.children?.some(c => c.href && pathname.startsWith(c.href)) ?? false
  );

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={clsx(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group',
            open ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          )}
        >
          <span className="flex items-center gap-2.5">
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </span>
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {open && (
          <div className="ml-3 mt-0.5 border-l border-gray-800 pl-3 space-y-0.5">
            {item.children.map(child => (
              <NavItemComponent key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = item.href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname.startsWith(item.href!);

  return (
    <Link
      href={item.href!}
      className={clsx(
        'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      )}
    >
      <span className="flex items-center gap-2.5">
        <item.icon className="w-4 h-4 flex-shrink-0" />
        {item.label}
      </span>
      {item.badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded-full animate-pulse">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ adminUser }: { adminUser: AdminUser }) {
  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
            IA
          </div>
          <div>
            <p className="text-sm font-bold text-white">Instantatoz</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
        {NAV_ITEMS.map(item => (
          <NavItemComponent key={item.label} item={item} />
        ))}
      </nav>

      {/* Admin info */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {adminUser.name?.[0]?.toUpperCase() ?? adminUser.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{adminUser.name || adminUser.email}</p>
            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-medium', ROLE_COLORS[adminUser.role])}>
              {ROLE_LABELS[adminUser.role]}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
