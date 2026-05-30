'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  KeyRound,
  Users,
  ScrollText,
  AppWindow,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/licenses', label: 'Licenses', icon: KeyRound },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/applications', label: 'Applications', icon: AppWindow },
  { href: '/dashboard/logs', label: 'Logs', icon: ScrollText },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        bg-[#0c0c18]/80 backdrop-blur-2xl
        border-r border-white/[0.06]
        flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <Shield className="w-8 h-8 text-indigo-400" />
          <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              ALONEAUTH
            </h1>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">License System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-300 relative
                ${isActive
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-r-full" />
              )}
              <item.icon
                size={20}
                className={`flex-shrink-0 transition-all duration-300 ${
                  isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:text-gray-300'
                }`}
              />
              {!collapsed && (
                <span className={`text-sm font-medium transition-all duration-300 ${
                  isActive ? 'text-indigo-300' : ''
                }`}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="px-3 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] transition-all duration-300"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
