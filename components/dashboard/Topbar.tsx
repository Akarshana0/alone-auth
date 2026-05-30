'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Bell } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#0c0c18]/60 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="text-sm font-mono text-gray-500">{time}</div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications bell */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] transition-all duration-300">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </button>

        {/* Admin info & logout */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/[0.08]">
          <div className="text-right">
            <p className="text-sm text-gray-200 font-medium">
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Administrator</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0c0c18]" />
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
