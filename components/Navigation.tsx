'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Users, Hammer, Wallet, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import {ModeToggle} from '@/components/ToggleBtn'
export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { href: '/mods', label: 'সব মড', icon: List },
    { href: '/mods/working', label: 'চলমান কাজ', icon: Hammer },
    { href: '/mods/pending', label: 'পেন্ডিং কাজ', icon: Pause },
    { href: '/creators', label: 'ক্রিয়েটর ব্যবস্থাপনা', icon: Users },
    { href: '/earnings', label: 'আয়ের ড্যাশবোর্ড', icon: Wallet },
  ];

  // Find the best matching nav item: the one with the longest href that matches the current path
  const activeHref = navItems.reduce<string | null>((best, item) => {
    const matches = pathname === item.href || pathname.startsWith(item.href + '/');
    if (!matches) return best;
    if (!best) return item.href;
    return item.href.length > best.length ? item.href : best;
  }, null);

  return (
    <nav className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">মড ম্যানেজার</h1>
        <p className="text-xs text-sidebar-accent-foreground mt-1">প্রজেক্ট এবং পেমেন্ট ট্র্যাকার</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeHref === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-center text-xs text-sidebar-accent-foreground">
        <ModeToggle />
        <p>সব ডেটা আপনার ব্রাউজারে সংরক্ষিত</p>
      </div>
    </nav>
  );
}
