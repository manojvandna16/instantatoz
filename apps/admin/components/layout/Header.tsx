'use client';

import { Bell, Search, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { AdminUser } from '@/types';

export default function Header({ adminUser }: { adminUser: AdminUser }) {
  const { logout } = useAuth();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users, workers, jobs, payments..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Location indicator */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span>Uttarkashi, Uttarakhand</span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
