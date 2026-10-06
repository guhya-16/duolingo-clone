'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Settings,
  Sparkles,
  Store,
  Trophy,
  User,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Learn', href: '/learn', icon: Home },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Shop', href: '/shop', icon: Store },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 border-r-2 border-duo-border dark:border-gray-700 bg-white dark:bg-[#131F24] px-4 py-6 z-30 transition-colors duration-200">
        <div className="px-4 mb-8 flex items-center gap-2">
          <Link href="/learn" className="text-3xl font-black text-duo-green tracking-tight">
            duolingo
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === '/learn' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-2 border-duo-blue bg-blue-50 dark:bg-blue-950/40 text-duo-blue'
                    : 'text-duo-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-duo-charcoal dark:hover:text-white border-2 border-transparent'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[3]' : 'stroke-2'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Super Promo Banner */}
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col gap-2">
          <div className="flex items-center gap-2 font-black text-sm">
            <Sparkles className="w-5 h-5 text-yellow-300 fill-current" />
            <span>SUPER DUOLINGO</span>
          </div>
          <p className="text-xs text-indigo-100 font-bold leading-relaxed">
            Unlimited hearts & faster progress!
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#131F24] border-t-2 border-duo-border dark:border-gray-700 flex justify-around items-center z-40 px-2 transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/learn' && pathname === '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
                isActive
                  ? 'text-duo-blue font-black'
                  : 'text-duo-muted dark:text-gray-400 hover:text-duo-charcoal dark:hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[3]' : 'stroke-2'}`} />
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
